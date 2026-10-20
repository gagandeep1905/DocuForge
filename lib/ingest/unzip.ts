import { unzipSync, type UnzipFileInfo } from 'fflate';
import { IngestError } from './errors';
import { LIMITS } from './limits';
import { looksBinary, normalizePath, shouldSkip } from './filters';
import type { ExtractResult, ExtractedFile } from './types';

const decoder = new TextDecoder('utf-8', { fatal: false });

/** If every path shares one top-level folder (GitHub zipballs do), strip it. */
function stripCommonRoot(paths: string[]): string {
  if (paths.length === 0) return '';
  const first = paths[0].split('/');
  if (first.length < 2) return '';
  const root = first[0] + '/';
  return paths.every((p) => p.startsWith(root)) ? root : '';
}

/** Safely extract a zip in memory with traversal, file-count and expanded-size guards. */
export function extractZip(data: Uint8Array): ExtractResult {
  const skipped: Record<string, number> = {};
  const bump = (reason: string) => { skipped[reason] = (skipped[reason] ?? 0) + 1; };
  let entries = 0;
  let declaredTotal = 0;

  let raw: Record<string, Uint8Array>;
  try {
    raw = unzipSync(data, {
      filter(info: UnzipFileInfo) {
        if (info.name.endsWith('/')) return false;
        entries++;
        if (entries > LIMITS.maxEntries) {
          throw new IngestError('too_many_files', `This archive has more than ${LIMITS.maxEntries} files. Remove build folders and dependencies, then try again.`);
        }
        declaredTotal += info.originalSize;
        if (declaredTotal > LIMITS.maxExtractedBytes) {
          throw new IngestError('too_large', 'This archive is too large once extracted. Remove large assets and try again.');
        }
        const path = normalizePath(info.name);
        if (path === null) throw new IngestError('unsafe_path', 'This archive contains an unsafe file path and was rejected.');
        const reason = shouldSkip(path);
        if (reason) { bump(reason); return false; }
        if (info.originalSize > LIMITS.maxFileBytes) { bump('file_too_large'); return false; }
        return true;
      },
    });
  } catch (e) {
    if (e instanceof IngestError) throw e;
    throw new IngestError('bad_archive', 'This file could not be read as a valid zip archive.');
  }

  const cleaned: Array<[string, Uint8Array]> = [];
  for (const [name, bytes] of Object.entries(raw)) {
    const path = normalizePath(name);
    if (!path) continue;
    if (bytes.length > LIMITS.maxFileBytes) { bump('file_too_large'); continue; }
    if (looksBinary(bytes)) { bump('binary'); continue; }
    cleaned.push([path, bytes]);
  }

  const root = stripCommonRoot(cleaned.map(([p]) => p));
  const files: ExtractedFile[] = cleaned.map(([p, bytes]) => ({
    path: root ? p.slice(root.length) : p,
    content: decoder.decode(bytes).replace(/\u0000/g, ''),
    bytes: bytes.length,
  }));

  return { files, skipped, totalEntries: entries };
}

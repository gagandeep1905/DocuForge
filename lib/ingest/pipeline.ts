import { supabaseAdmin } from '../supabase';
import { getObjectBytes } from '../storage';
import { IngestError } from './errors';
import { LIMITS } from './limits';
import { extractZip } from './unzip';
import { downloadRepoZip, parseGithubUrl } from './github';
import { redactSecrets } from './secrets';
import { classifyRole, scoreFile } from './classify';
import { detectStack, languageFor } from './detect';
import type { Coverage } from './types';

async function setStatus(projectId: string, status: string) {
  const { error } = await supabaseAdmin.from('projects').update({ status }).eq('id', projectId);
  if (error) throw error;
}

/** Group rows into insert batches capped by payload size (file contents can be large). */
function batchBySize<T extends { content: string }>(rows: T[], maxBytes: number): T[][] {
  const batches: T[][] = [];
  let cur: T[] = [];
  let size = 0;
  const encoder = new TextEncoder();
  for (const r of rows) {
    // UTF-8 byte size is what matters to PostgREST, not JS UTF-16 code units.
    const rowBytes = encoder.encode(r.content).byteLength;
    if (cur.length && size + rowBytes > maxBytes) { batches.push(cur); cur = []; size = 0; }
    cur.push(r);
    size += rowBytes;
 }
  if (cur.length) batches.push(cur);
  return batches;
}

/** Idempotent: safe to retry. Returns a small coverage summary (Inngest step outputs must stay small). */
export async function runIngest(projectId: string): Promise<Coverage> {
  const { data: project, error } = await supabaseAdmin
    .from('projects').select('id, source_type, source_ref').eq('id', projectId).single();
  if (error || !project) throw new IngestError('not_found', 'Project not found.');

  await setStatus(projectId, 'ingesting');

  // 1. Fetch the archive
  let archive: Uint8Array;
  if (project.source_type === 'zip') {
    archive = await getObjectBytes(project.source_ref);
  } else {
    const parsed = parseGithubUrl(project.source_ref);
    if (!parsed) throw new IngestError('bad_url', 'That does not look like a valid GitHub repository URL.');
    archive = await downloadRepoZip(parsed.owner, parsed.repo);
  }
  if (archive.length > LIMITS.maxUploadBytes) throw new IngestError('too_large', 'The upload is larger than the 100 MB limit.');

  // 2. Extract + filter (zip-bomb, traversal, binaries, dependencies, lockfiles, secret files)
  const extracted = extractZip(archive);
  if (extracted.files.length === 0) {
    throw new IngestError('empty', 'No readable source files were found. Check that you uploaded the project folder, not only build output.');
  }

  // 3. Redact secrets inside kept files, classify and rank
  let redactions = 0;
  const rows = extracted.files.map((f) => {
    const { text, count } = redactSecrets(f.content);
    redactions += count;
    const role = classifyRole(f.path);
    return {
      path: f.path,
      content: text,
      role,
      language: languageFor(f.path),
      size_bytes: f.bytes,
      score: scoreFile(f.path, role, f.bytes),
    };
  });
  rows.sort((a, b) => b.score - a.score);
  const analyzeSet = new Set(rows.slice(0, LIMITS.maxAnalyzed).map((r) => r.path));

  // 4. Detect stack from ALL kept files (cheap, no AI)
  const stack = detectStack(rows.map((r) => ({ path: r.path, content: r.content })));

  // 5. Persist (replace previous attempt)
  const { error: deleteError } = await supabaseAdmin.from('project_files').delete().eq('project_id', projectId);
  if (deleteError) throw deleteError;
  const insertRows = rows.map((r) => ({ ...r, project_id: projectId, analyze: analyzeSet.has(r.path) }));
  for (const batch of batchBySize(insertRows, LIMITS.insertBatchBytes)) {
    const { error: insErr } = await supabaseAdmin.from('project_files').insert(batch);
    if (insErr) throw insErr;
  }

  const coverage: Coverage = {
    total_files: rows.length,
    analyzed: analyzeSet.size,
    skipped: extracted.skipped,
    redactions,
    languages: stack.languages.slice(0, 8),
    frameworks: stack.frameworks,
    manifests: stack.manifests,
    has_readme: stack.hasReadme,
  };
  const { error: finishError } = await supabaseAdmin
    .from('projects').update({ status: 'ingested', coverage, error: null }).eq('id', projectId);
  if (finishError) throw finishError;
  return coverage;
}

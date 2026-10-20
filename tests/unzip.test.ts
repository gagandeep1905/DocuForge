import { describe, it, expect } from 'vitest';
import { zipSync, strToU8 } from 'fflate';
import { extractZip } from '../lib/ingest/unzip';
import { IngestError } from '../lib/ingest/errors';
import { LIMITS } from '../lib/ingest/limits';

const u8 = strToU8;

describe('extractZip', () => {
  it('filters junk, strips the common root and reports skips', () => {
    const zip = zipSync({
      'proj/src/app.js': u8('console.log(1)'),
      'proj/README.md': u8('# Hello'),
      'proj/node_modules/x/index.js': u8('x'),
      'proj/.env': u8('SECRET=1'),
      'proj/logo.png': new Uint8Array([137, 80, 78, 71, 0, 1]),
      'proj/vendor.zip': u8('nested'),
    });
    const r = extractZip(zip);
    expect(r.files.map((f) => f.path).sort()).toEqual(['README.md', 'src/app.js']);
    expect(r.skipped).toMatchObject({ ignored_dir: 1, secret_file: 1, binary: 1, nested_archive: 1 });
  });

  it('rejects path traversal', () => {
    const zip = zipSync({ '../evil.js': u8('boom') });
    expect(() => extractZip(zip)).toThrowError(IngestError);
    try { extractZip(zip); } catch (e) { expect((e as IngestError).code).toBe('unsafe_path'); }
  });

  it('skips oversized files without inflating the whole archive into results', () => {
    const big = new Uint8Array(LIMITS.maxFileBytes + 1).fill(97);
    const r = extractZip(zipSync({ 'a/big.txt': big, 'a/ok.txt': u8('fine') }));
    expect(r.files.map((f) => f.path)).toEqual(['ok.txt']);
    expect(r.skipped.file_too_large).toBe(1);
  });

  it('throws a friendly error for non-zip data', () => {
    try { extractZip(u8('definitely not a zip')); expect.unreachable(); }
    catch (e) { expect((e as IngestError).code).toBe('bad_archive'); }
  });
});

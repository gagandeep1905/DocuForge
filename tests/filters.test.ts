import { describe, it, expect } from 'vitest';
import { normalizePath, shouldSkip, looksBinary } from '../lib/ingest/filters';

describe('normalizePath', () => {
  it('accepts normal paths and cleans them', () => {
    expect(normalizePath('src/app.js')).toBe('src/app.js');
    expect(normalizePath('./src//app.js')).toBe('src/app.js');
    expect(normalizePath('src\\app.js')).toBe('src/app.js');
  });
  it('rejects traversal and absolute paths', () => {
    expect(normalizePath('../evil.js')).toBeNull();
    expect(normalizePath('a/../../evil.js')).toBeNull();
    expect(normalizePath('/etc/passwd')).toBeNull();
    expect(normalizePath('C:\\Windows\\x.dll')).toBeNull();
    expect(normalizePath('a\0b')).toBeNull();
  });
});

describe('shouldSkip', () => {
  it.each([
    ['node_modules/react/index.js', 'ignored_dir'],
    ['web/.next/server/app.js', 'ignored_dir'],
    ['package-lock.json', 'lockfile'],
    ['assets/logo.png', 'binary'],
    ['lib/vendor.zip', 'nested_archive'],
    ['public/app.min.js', 'generated'],
    ['.env', 'secret_file'],
    ['config/id_rsa', 'secret_file'],
  ])('skips %s as %s', (path, reason) => expect(shouldSkip(path)).toBe(reason));

  it.each(['src/index.ts', 'README.md', 'package.json', '.env.example', 'app/models.py'])(
    'keeps %s', (path) => expect(shouldSkip(path)).toBeNull());
});

describe('looksBinary', () => {
  it('detects NUL bytes', () => {
    expect(looksBinary(new Uint8Array([104, 105, 0, 1]))).toBe(true);
    expect(looksBinary(new TextEncoder().encode('hello'))).toBe(false);
  });
});

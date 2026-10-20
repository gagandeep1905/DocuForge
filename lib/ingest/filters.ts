import { isSecretFile } from './secrets';

const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.svn', '.hg', 'dist', 'build', 'out', '.next', '.nuxt', '.cache',
  'venv', '.venv', 'env', '__pycache__', 'site-packages', '.pytest_cache', '.mypy_cache',
  'target', 'bin', 'obj', 'vendor', 'coverage', '.gradle', '.idea', '.vscode', '__macosx',
  'pods', '.dart_tool', '.expo', '.terraform',
]);

const IGNORED_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'composer.lock',
  'poetry.lock', 'pipfile.lock', 'gemfile.lock', 'cargo.lock', 'pubspec.lock', '.ds_store', 'thumbs.db',
]);

const ARCHIVE_EXT = new Set(['.zip', '.tar', '.gz', '.tgz', '.rar', '.7z', '.bz2', '.xz', '.jar', '.war', '.apk']);

const BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.svg', '.tiff', '.psd',
  '.mp3', '.mp4', '.wav', '.avi', '.mov', '.mkv', '.webm',
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.exe', '.dll', '.so', '.dylib', '.class', '.o', '.pyc', '.bin', '.db', '.sqlite', '.sqlite3',
  '.pkl', '.h5', '.pt', '.onnx', '.npy', '.csv', '.parquet',
]);

export function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i <= 0 ? '' : name.slice(i).toLowerCase();
}

/**
 * Returns a clean forward-slash relative path, or null if the path is unsafe
 * (absolute, drive-letter, NUL byte, or contains `..`).
 */
export function normalizePath(raw: string): string | null {
  if (raw.includes('\0')) return null;
  const p = raw.replace(/\\/g, '/');
  if (p.startsWith('/') || /^[A-Za-z]:/.test(p)) return null;
  const segs = p.split('/').filter((s) => s !== '' && s !== '.');
  if (segs.some((s) => s === '..')) return null;
  return segs.length ? segs.join('/') : null;
}

/** Returns a skip reason, or null if the file should be kept. */
export function shouldSkip(path: string): string | null {
  const segs = path.split('/');
  const name = (segs[segs.length - 1] ?? '').toLowerCase();
  if (segs.slice(0, -1).some((s) => IGNORED_DIRS.has(s.toLowerCase()))) return 'ignored_dir';
  if (isSecretFile(path)) return 'secret_file';
  if (IGNORED_FILES.has(name)) return 'lockfile';
  if (/\.min\.(js|css)$|\.map$/.test(name)) return 'generated';
  const ext = extOf(name);
  if (ARCHIVE_EXT.has(ext)) return 'nested_archive';   // never extracted
  if (BINARY_EXT.has(ext)) return 'binary';
  return null;
}

export function looksBinary(bytes: Uint8Array): boolean {
  const n = Math.min(bytes.length, 8000);
  for (let i = 0; i < n; i++) if (bytes[i] === 0) return true;
  return false;
}

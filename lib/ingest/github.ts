import { IngestError } from './errors';
import { LIMITS } from './limits';

// Strict allow-list: only https://github.com/<owner>/<repo>[.git][/]. No other hosts (SSRF guard).
const GITHUB_URL = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/;

export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const m = GITHUB_URL.exec(url.trim());
  return m ? { owner: m[1], repo: m[2] } : null;
}

async function readCapped(res: Response, max: number): Promise<Uint8Array> {
  const declared = Number(res.headers.get('content-length') ?? 0);
  if (declared > max) throw new IngestError('too_large', 'This repository is larger than the 100 MB limit.');
  if (!res.body) throw new IngestError('download_failed', 'Could not download the repository.');
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > max) {
      await reader.cancel();
      throw new IngestError('too_large', 'This repository is larger than the 100 MB limit.');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.length; }
  return out;
}

/** Downloads the default-branch zipball of a PUBLIC repo. Private repos are out of scope for v1. */
export async function downloadRepoZip(owner: string, repo: string): Promise<Uint8Array> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'docuforge',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/zipball`, { headers, redirect: 'follow' });
  if (res.status === 404) throw new IngestError('repo_not_found', 'Repository not found. Make sure it is public and the URL is correct.');
  if (res.status === 403 || res.status === 429) throw new IngestError('rate_limited', 'GitHub is rate-limiting us right now. Please try again in a few minutes, or upload a zip.');
  if (!res.ok) throw new IngestError('download_failed', 'Could not download the repository from GitHub.');
  return readCapped(res, LIMITS.maxUploadBytes);
}

import { describe, expect, it } from 'vitest';
import { parseGithubUrl } from '../lib/ingest/github';

describe('parseGithubUrl', () => {
  it('accepts only a plain public GitHub repository URL', () => {
    expect(parseGithubUrl('https://github.com/owner/repo')).toEqual({ owner: 'owner', repo: 'repo' });
    expect(parseGithubUrl('https://github.com/owner/repo.git/')).toEqual({ owner: 'owner', repo: 'repo' });
    expect(parseGithubUrl(' https://github.com/owner/repo/ ')).toEqual({ owner: 'owner', repo: 'repo' });
  });

  it.each([
    'http://github.com/owner/repo',
    'https://github.com/owner/repo/tree/main',
    'https://github.com.evil.example/owner/repo',
    'https://example.com/owner/repo',
    'https://github.com/owner/repo?download=1',
  ])('rejects %s', (url) => expect(parseGithubUrl(url)).toBeNull());
});

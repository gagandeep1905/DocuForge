import { describe, expect, it } from 'vitest';
import { parseGithubUrl } from '../lib/ingest/github';

describe('parseGithubUrl', () => {
  it.each([
    ['https://github.com/octocat/Hello-World', { owner: 'octocat', repo: 'Hello-World' }],
    ['https://github.com/example/student-project.git', { owner: 'example', repo: 'student-project' }],
    ['https://github.com/example/student-project.git/', { owner: 'example', repo: 'student-project' }],
  ])('accepts %s', (url, expected) => {
    expect(parseGithubUrl(url)).toEqual(expected);
  });

  it.each([
    'http://github.com/octocat/Hello-World',
    'https://gitlab.com/octocat/Hello-World',
    'git@github.com:octocat/Hello-World.git',
    'https://github.com/octocat/Hello-World/tree/main',
    'https://github.com/octocat/Hello-World?tab=readme',
  ])('rejects unsupported URL %s', (url) => {
    expect(parseGithubUrl(url)).toBeNull();
  });
});

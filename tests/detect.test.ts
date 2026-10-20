import { describe, it, expect } from 'vitest';
import { detectStack } from '../lib/ingest/detect';
import { classifyRole, scoreFile } from '../lib/ingest/classify';

describe('detectStack', () => {
  it('detects frameworks across manifests in a monorepo', () => {
    const s = detectStack([
      { path: 'frontend/package.json', content: JSON.stringify({ dependencies: { next: '15', tailwindcss: '3' } }) },
      { path: 'backend/requirements.txt', content: 'Django==5.0\npsycopg2-binary>=2\n' },
      { path: 'frontend/app/page.tsx', content: 'export default function P(){}' },
      { path: 'backend/models.py', content: 'class User: pass' },
      { path: 'README.md', content: '# x' },
    ]);
    expect(s.frameworks).toEqual(expect.arrayContaining(['Next.js', 'Tailwind CSS', 'Django', 'PostgreSQL']));
    expect(s.hasReadme).toBe(true);
    expect(s.languages.map((l) => l.name)).toEqual(expect.arrayContaining(['TypeScript', 'Python']));
  });
  it('ignores malformed package.json', () => {
    expect(() => detectStack([{ path: 'package.json', content: '{oops' }])).not.toThrow();
  });
});

describe('classify + score', () => {
  it('ranks README and models above tests', () => {
    const readme = scoreFile('README.md', classifyRole('README.md'), 2000);
    const model = scoreFile('app/models.py', classifyRole('app/models.py'), 2000);
    const test = scoreFile('tests/test_a.py', classifyRole('tests/test_a.py'), 2000);
    expect(readme).toBeGreaterThan(model);
    expect(model).toBeGreaterThan(test);
  });
  it('classifies common roles', () => {
    expect(classifyRole('app/api/users/route.ts')).toBe('route');
    expect(classifyRole('src/components/Nav.tsx')).toBe('component');
    expect(classifyRole('db/schema.sql')).toBe('model');
    expect(classifyRole('package.json')).toBe('config');
  });
});

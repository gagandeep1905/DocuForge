import type { Role } from './types';

export const MANIFESTS = new Set([
  'package.json', 'requirements.txt', 'pyproject.toml', 'pom.xml', 'build.gradle',
  'build.gradle.kts', 'pubspec.yaml', 'composer.json', 'gemfile', 'go.mod', 'cargo.toml',
]);

export function classifyRole(path: string): Role {
  const p = path.toLowerCase();
  const name = p.split('/').pop() ?? '';

  if (
    /(^|\/)(tests?|__tests__|spec|e2e|cypress)\//.test(p) ||
    /\.(test|spec)\.[a-z]+$/.test(name) ||
    /^test_.*\.py$/.test(name)
  ) return 'test';

  if (
    MANIFESTS.has(name) ||
    /^dockerfile$|docker-compose|\.config\.[a-z]+$|^tsconfig|\.(ya?ml|toml|ini|cfg)$|^\.env\./.test(name)
  ) return 'config';

  if (/^readme/.test(name) || /\.(md|rst)$/.test(name) || /(^|\/)docs?\//.test(p)) return 'doc';

  if (
    /\.sql$/.test(name) || name === 'schema.prisma' || /^models?\.py$/.test(name) ||
    /(^|\/)(models?|entities|schemas?|migrations?|db)\//.test(p)
  ) return 'model';

  if (
    /(^|\/)(routes?|controllers?|api|views|endpoints|handlers)\//.test(p) ||
    /^(urls|views|routes)\.py$/.test(name)
  ) return 'route';

  if (
    /\.(jsx|tsx|vue|svelte|html|dart)$/.test(name) ||
    /(^|\/)(components?|pages|screens|templates|ui|layouts?)\//.test(p)
  ) return 'component';

  if (/(^|\/)(utils?|helpers?|lib|services?|middleware)\//.test(p)) return 'util';
  return 'other';
}

const BASE_SCORE: Record<Role, number> = {
  doc: 70, config: 30, model: 85, route: 80, component: 50, util: 40, other: 30, test: 10,
};

/** Higher = more important for understanding the project. Top N get AI summaries. */
export function scoreFile(path: string, role: Role, bytes: number): number {
  const name = (path.split('/').pop() ?? '').toLowerCase();
  let s = BASE_SCORE[role];
  if (/^readme/.test(name)) s = 100;
  if (MANIFESTS.has(name)) s = 90;
  if (/^(main|index|app|server|manage|wsgi|asgi)\.[a-z]+$/.test(name)) s += 15;
  if (bytes < 50) s -= 20;
  if (bytes > 50_000) s -= 10;
  const depth = path.split('/').length;
  if (depth > 3) s -= 2 * (depth - 3);
  return Math.round(s);
}

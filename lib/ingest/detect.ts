import { extOf } from './filters';
import { MANIFESTS } from './classify';
import type { StackInfo } from './types';

const LANGUAGES: Record<string, string> = {
  '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.ts': 'TypeScript', '.tsx': 'TypeScript',
  '.py': 'Python', '.java': 'Java', '.kt': 'Kotlin', '.dart': 'Dart', '.php': 'PHP', '.rb': 'Ruby',
  '.go': 'Go', '.rs': 'Rust', '.c': 'C', '.h': 'C', '.cpp': 'C++', '.cs': 'C#', '.swift': 'Swift',
  '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS', '.sql': 'SQL', '.vue': 'Vue', '.svelte': 'Svelte',
  '.ipynb': 'Jupyter Notebook',
};

export function languageFor(path: string): string | null {
  return LANGUAGES[extOf(path)] ?? null;
}

const NPM: Record<string, string> = {
  next: 'Next.js', react: 'React', vue: 'Vue', '@angular/core': 'Angular', svelte: 'Svelte',
  express: 'Express', '@nestjs/core': 'NestJS', 'react-native': 'React Native', tailwindcss: 'Tailwind CSS',
  mongoose: 'MongoDB (Mongoose)', mongodb: 'MongoDB', '@prisma/client': 'Prisma', sequelize: 'Sequelize',
  mysql2: 'MySQL', mysql: 'MySQL', pg: 'PostgreSQL', sqlite3: 'SQLite', firebase: 'Firebase',
  '@supabase/supabase-js': 'Supabase', 'socket.io': 'Socket.IO', vite: 'Vite', jsonwebtoken: 'JWT auth',
  bcrypt: 'bcrypt', bcryptjs: 'bcrypt', stripe: 'Stripe', razorpay: 'Razorpay',
};

const PY: Record<string, string> = {
  django: 'Django', flask: 'Flask', fastapi: 'FastAPI', streamlit: 'Streamlit', tensorflow: 'TensorFlow',
  torch: 'PyTorch', 'scikit-learn': 'scikit-learn', pandas: 'pandas', numpy: 'NumPy',
  'opencv-python': 'OpenCV', sqlalchemy: 'SQLAlchemy', 'mysql-connector-python': 'MySQL',
  psycopg2: 'PostgreSQL', 'psycopg2-binary': 'PostgreSQL', pymongo: 'MongoDB', djangorestframework: 'Django REST Framework',
};

function fromPackageJson(content: string, out: Set<string>) {
  try {
    const pkg = JSON.parse(content) as { dependencies?: object; devDependencies?: object };
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    for (const name of Object.keys(deps)) if (NPM[name]) out.add(NPM[name]);
  } catch { /* malformed manifest: ignore */ }
}

function fromRequirements(content: string, out: Set<string>) {
  for (const line of content.split('\n')) {
    const name = line.trim().toLowerCase().split(/[=<>~!\s[;]/)[0];
    if (name && PY[name]) out.add(PY[name]);
  }
}

function fromText(name: string, content: string, out: Set<string>) {
  const c = content.toLowerCase();
  if (name === 'pom.xml') {
    out.add('Maven');
    if (c.includes('spring-boot')) out.add('Spring Boot');
    if (c.includes('mysql')) out.add('MySQL');
    if (c.includes('hibernate')) out.add('Hibernate');
  } else if (name.startsWith('build.gradle')) {
    out.add('Gradle');
    if (c.includes('com.android')) out.add('Android');
    if (c.includes('spring-boot')) out.add('Spring Boot');
  } else if (name === 'pubspec.yaml') {
    if (c.includes('flutter')) out.add('Flutter');
    if (c.includes('firebase')) out.add('Firebase');
  } else if (name === 'composer.json') {
    if (c.includes('laravel/framework')) out.add('Laravel');
  } else if (name === 'pyproject.toml') {
    for (const [k, v] of Object.entries(PY)) if (c.includes(k)) out.add(v);
  }
}

export function detectStack(files: Array<{ path: string; content: string }>): StackInfo {
  const bytesByLang = new Map<string, number>();
  const frameworks = new Set<string>();
  const manifests: string[] = [];
  let hasReadme = false;

  for (const f of files) {
    const name = (f.path.split('/').pop() ?? '').toLowerCase();
    const lang = languageFor(f.path);
    if (lang) bytesByLang.set(lang, (bytesByLang.get(lang) ?? 0) + f.content.length);
    if (/^readme/.test(name)) hasReadme = true;
    if (MANIFESTS.has(name)) {
      manifests.push(f.path);
      if (name === 'package.json') fromPackageJson(f.content, frameworks);
      else if (name === 'requirements.txt') fromRequirements(f.content, frameworks);
      else fromText(name, f.content, frameworks);
    }
  }

  const total = [...bytesByLang.values()].reduce((a, b) => a + b, 0) || 1;
  const languages = [...bytesByLang.entries()]
    .map(([name, bytes]) => ({ name, bytes, percent: Math.round((bytes / total) * 100) }))
    .sort((a, b) => b.bytes - a.bytes);

  return { languages, frameworks: [...frameworks].sort(), manifests, hasReadme };
}

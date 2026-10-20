'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { authHeaders } from '@/lib/client-auth';

interface Project {
  id: string; title: string; status: string; error: string | null;
  coverage: null | {
    total_files: number; analyzed: number; redactions: number; has_readme: boolean;
    languages: { name: string; percent: number }[]; frameworks: string[]; skipped: Record<string, number>;
  };
}

const TERMINAL = new Set(['ingested', 'failed', 'needs_input', 'ready', 'done']);
const LABEL: Record<string, string> = {
  uploaded: 'Queued…', ingesting: 'Reading your project…', ingested: 'Project read successfully',
  failed: 'Something went wrong',
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/projects/${id}`, { headers: await authHeaders() });
        if (!res.ok) throw new Error(res.status === 404 ? 'Project not found.' : 'Could not load project.');
        const p: Project = await res.json();
        if (cancelled) return;
        setProject(p);
        if (!TERMINAL.has(p.status)) timer = setTimeout(poll, 3000);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load project.');
      }
    }
    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [id]);

  if (error) return <main className="p-8 text-red-600">{error}</main>;
  if (!project) return <main className="p-8 text-gray-500">Loading…</main>;
  const c = project.coverage;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">{project.title}</h1>
      <p className={project.status === 'failed' ? 'text-red-600' : 'text-gray-700'}>
        {LABEL[project.status] ?? project.status}
      </p>
      {project.status === 'failed' && project.error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{project.error}</p>}

      {c && (
        <section className="space-y-3 rounded-lg border p-4 text-sm">
          <p><strong>{c.total_files}</strong> source files found. <strong>{c.analyzed}</strong> most important files will be analyzed.</p>
          {c.languages.length > 0 && <p>Languages: {c.languages.map((l) => `${l.name} ${l.percent}%`).join(', ')}</p>}
          {c.frameworks.length > 0 && <p>Detected: {c.frameworks.join(', ')}</p>}
          {!c.has_readme && <p className="text-amber-700">No README found. Adding project notes will improve the results.</p>}
          {c.redactions > 0 && <p className="text-gray-600">{c.redactions} possible secret(s) were removed before analysis.</p>}
        </section>
      )}
    </main>
  );
}

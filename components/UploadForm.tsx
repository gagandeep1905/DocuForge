'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authHeaders } from '@/lib/client-auth';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { isAllowedZipUploadSize } from '@/lib/ingest/limits';

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'docuforge-uploads';

async function api<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: 'POST', headers: await authHeaders(), body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json as T;
}

export default function UploadForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'zip' | 'github'>('zip');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === 'zip') {
      if (!file) return setError('Choose a .zip file of your project.');
      if (!/\.zip$/i.test(file.name)) return setError('Only .zip files are supported.');
      if (!isAllowedZipUploadSize(file.size)) return setError('Zip must be 50 MB or smaller. Remove node_modules and build folders first.');
    } else if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(repoUrl.trim())) {
      return setError('Enter a public GitHub URL like https://github.com/owner/repo');
    }

    setBusy(true);
    try {
      let sourceRef = repoUrl.trim();
      if (mode === 'zip' && file) {
        if (!supabaseBrowser) throw new Error('Supabase guest storage is not configured. Please contact the site owner.');
        const { path, token } = await api<{ path: string; token: string }>('/api/uploads/sign', {
          filename: file.name,
          size: file.size,
        });
        const { data, error: uploadError } = await supabaseBrowser.storage
          .from(STORAGE_BUCKET)
          .uploadToSignedUrl(path, token, file, {
            contentType: 'application/zip',
            upsert: false,
          });
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        sourceRef = data.path;
      }

      const { id } = await api<{ id: string }>('/api/projects', {
        title, sourceType: mode, sourceRef, userNotes: notes || undefined,
      });
      router.push(`/projects/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  const input = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-5">
      <div className="flex gap-2 rounded-lg bg-gray-100 p-1 text-sm">
        {(['zip', 'github'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`flex-1 rounded-md py-2 ${mode === m ? 'bg-white font-medium shadow' : 'text-gray-600'}`}>
            {m === 'zip' ? 'Upload zip' : 'GitHub link'}
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium">Project title
        <input className={`${input} mt-1`} value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} maxLength={120} />
      </label>

      {mode === 'zip' ? (
        <label className="block text-sm font-medium">Project zip (max 50 MB)
          <input type="file" accept=".zip" className="mt-1 block w-full text-sm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      ) : (
        <label className="block text-sm font-medium">Public GitHub repository
          <input className={`${input} mt-1`} placeholder="https://github.com/owner/repo" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
        </label>
      )}

      <label className="block text-sm font-medium">Notes (optional)
        <textarea className={`${input} mt-1`} rows={4} maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="What problem does it solve? Who is it for? Anything the code doesn't make obvious." />
      </label>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <button disabled={busy} className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-medium text-white disabled:opacity-50">
        {busy ? 'Uploading and analyzing…' : 'Analyze project'}
      </button>
      <p className="text-xs text-gray-500">Dependencies, build folders, binaries and secret files (.env, keys) are skipped automatically.</p>
    </form>
  );
}

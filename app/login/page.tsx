'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/projects/new` },
    });
    if (error) setError(error.message); else setSent(true);
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-24">
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
      {sent ? <p>Check your email for a sign-in link.</p> : (
        <form onSubmit={submit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-medium text-white">Email me a link</button>
        </form>
      )}
    </main>
  );
}

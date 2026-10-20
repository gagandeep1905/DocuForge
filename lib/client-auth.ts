import { supabaseBrowser } from './supabase-browser';

export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabaseBrowser.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please sign in first.');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

import { supabaseBrowser } from './supabase-browser';

export async function authHeaders(): Promise<Record<string, string>> {
  if (!supabaseBrowser) {
    throw new Error('Authentication is not configured yet. The site owner must add the Supabase environment variables.');
  }
  const { data } = await supabaseBrowser.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please sign in first.');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

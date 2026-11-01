import { supabaseBrowser } from './supabase-browser';

/**
 * Gets the current browser session or silently creates an anonymous guest session.
 * The Supabase user ID scopes every project and upload; no sign-in form is shown.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  if (!supabaseBrowser) {
    throw new Error('Guest access is not configured yet. The site owner must add the public Supabase environment variables.');
  }

  const { data: current, error: sessionError } = await supabaseBrowser.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);

  let session = current.session;
  if (!session) {
    const { data, error } = await supabaseBrowser.auth.signInAnonymously();
    if (error) {
      throw new Error(`Could not start a guest session. Enable anonymous sign-ins in Supabase Auth settings. ${error.message}`);
    }
    session = data.session;
  }

  const token = session?.access_token;
  if (!token) throw new Error('A guest session could not be created. Please refresh and try again.');

  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

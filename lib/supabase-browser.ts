import { createClient } from '@supabase/supabase-js';

export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// A null client lets the site render before the owner configures Supabase.
// Interactive sign-in is disabled until both public values are supplied.
export const supabaseBrowser = isSupabaseBrowserConfigured()
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null;

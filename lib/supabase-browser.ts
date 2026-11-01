import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// A null client lets the site render before the owner configures Supabase.
// Interactive guest sign-in is disabled until both public values are supplied.
export const supabaseBrowser = isSupabaseBrowserConfigured()
  ? createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null;

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

function getSupabaseSecretKey(): string | undefined {
  // Prefer Supabase's current sb_secret_* API key. Keep the legacy variable
  // as a fallback so existing deployments can migrate without downtime.
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export class SupabaseConfigurationError extends Error {
  constructor() {
    super('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in the deployment environment.');
    this.name = 'SupabaseConfigurationError';
  }
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && getSupabaseSecretKey());
}

let client: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (!isSupabaseAdminConfigured()) throw new SupabaseConfigurationError();
  if (!client) {
    client = createClient<Database>(
      process.env.SUPABASE_URL!,
      getSupabaseSecretKey()!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  }
  return client;
}

// Lazy initialization keeps the landing page/build usable before production secrets exist.
// Never import this module from a client component: the secret key is server-only.
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, property) {
    const current = getClient() as unknown as Record<PropertyKey, unknown>;
    const value = current[property];
    return typeof value === 'function' ? value.bind(current) : value;
  },
});

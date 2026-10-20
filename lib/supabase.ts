import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class SupabaseConfigurationError extends Error {
  constructor() {
    super('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the deployment environment.');
    this.name = 'SupabaseConfigurationError';
  }
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!isSupabaseAdminConfigured()) throw new SupabaseConfigurationError();
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );
  }
  return client;
}

// Lazy initialization keeps the landing page/build usable before production secrets exist.
// Never import this module from a client component: the service-role key is server-only.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const current = getClient() as unknown as Record<PropertyKey, unknown>;
    const value = current[property];
    return typeof value === 'function' ? value.bind(current) : value;
  },
});

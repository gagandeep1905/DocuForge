import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase';

export class StorageConfigurationError extends Error {
  constructor() {
    super('Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY (or the legacy SUPABASE_SERVICE_ROLE_KEY).');
    this.name = 'StorageConfigurationError';
  }
}

export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'docuforge-uploads';

function bucketStore() {
  if (!isSupabaseAdminConfigured()) throw new StorageConfigurationError();
  return supabaseAdmin.storage.from(STORAGE_BUCKET);
}

/**
 * Create a one-time signed upload capability for a single object.
 * The server authenticates the guest and chooses the owner-scoped key before
 * issuing this token. The privileged Supabase key never reaches the browser.
 */
export async function createSignedUpload(key: string): Promise<{ path: string; token: string }> {
  const { data, error } = await bucketStore().createSignedUploadUrl(key, { upsert: false });
  if (error) throw error;
  if (!data?.path || !data?.token) throw new Error('Supabase did not return a signed upload token.');
  return { path: data.path, token: data.token };
}

export async function objectSize(key: string): Promise<number | null> {
  try {
    const { data, error } = await bucketStore().info(key);
    if (error) {
      if (error instanceof StorageConfigurationError) throw error;
      return null;
    }
    return typeof data.size === 'number' ? data.size : null;
  } catch (error) {
    if (error instanceof StorageConfigurationError) throw error;
    return null;
  }
}

export async function getObjectBytes(key: string): Promise<Uint8Array> {
  const { data, error } = await bucketStore().download(key);
  if (error) throw error;
  return new Uint8Array(await data.arrayBuffer());
}

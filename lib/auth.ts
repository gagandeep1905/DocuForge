import { supabaseAdmin } from './supabase';

export class AuthError extends Error {}

export async function requireUser(req: Request) {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) throw new AuthError('Missing token');
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new AuthError('Invalid token');
  return data.user;
}

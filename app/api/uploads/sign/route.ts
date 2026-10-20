import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { requireUser, AuthError } from '@/lib/auth';
import { presignUpload } from '@/lib/storage';
import { LIMITS } from '@/lib/ingest/limits';

const Body = z.object({
  filename: z.string().min(1).max(200).regex(/\.zip$/i, 'Only .zip files are supported'),
  size: z.number().int().positive().max(LIMITS.maxUploadBytes, 'Zip is larger than 100 MB'),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    // Key is namespaced by user id; /api/projects refuses keys outside this prefix.
    const key = `uploads/${user.id}/${randomUUID()}.zip`;
    const url = await presignUpload(key, parsed.data.size);
    return NextResponse.json({ url, key });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: 'Could not prepare upload' }, { status: 500 });
  }
}

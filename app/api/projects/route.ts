import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser, AuthError } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { objectSize } from '@/lib/storage';
import { parseGithubUrl } from '@/lib/ingest/github';
import { LIMITS } from '@/lib/ingest/limits';
import { inngest } from '@/inngest/client';

const Body = z.object({
  title: z.string().trim().min(2).max(120),
  sourceType: z.enum(['zip', 'github']),
  sourceRef: z.string().trim().min(1).max(300),
  userNotes: z.string().max(4000).optional(),
  templateId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
    }
    const parsed = Body.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { title, sourceType, sourceRef, userNotes, templateId } = parsed.data;

    // Abuse guard: max 5 unfinished ingests per hour per user
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count, error: limitError } = await supabaseAdmin
      .from('projects').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).in('status', ['uploaded', 'ingesting']).gte('created_at', since);
    if (limitError) throw limitError;
    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: 'Too many projects are processing. Wait a few minutes.' }, { status: 429 });
    }

    if (sourceType === 'zip') {
      if (!sourceRef.startsWith(`uploads/${user.id}/`)) {
        return NextResponse.json({ error: 'Invalid upload reference' }, { status: 400 });
      }
      const size = await objectSize(sourceRef);
      if (size === null) return NextResponse.json({ error: 'Upload not found. Please upload again.' }, { status: 400 });
      if (size > LIMITS.maxUploadBytes) return NextResponse.json({ error: 'Zip is larger than 100 MB' }, { status: 400 });
    } else if (!parseGithubUrl(sourceRef)) {
      return NextResponse.json({ error: 'Enter a public GitHub URL like https://github.com/owner/repo' }, { status: 400 });
    }

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: user.id, title, source_type: sourceType, source_ref: sourceRef,
        user_notes: userNotes ?? null, template_id: templateId ?? null,
      })
      .select('id').single();
    if (error || !project) throw error ?? new Error('insert failed');

    try {
      await inngest.send({ name: 'project/created', data: { projectId: project.id } });
    } catch (e) {
      await supabaseAdmin.from('projects')
        .update({ status: 'failed', error: 'Could not start processing. Please try again.' }).eq('id', project.id);
      console.error('inngest send failed', e);
      return NextResponse.json({ error: 'Could not start processing' }, { status: 502 });
    }

    return NextResponse.json({ id: project.id }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

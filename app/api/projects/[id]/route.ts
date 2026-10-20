import { NextResponse } from 'next/server';
import { requireUser, AuthError } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('id, title, status, error, coverage, source_type, created_at')
      .eq('id', id).eq('user_id', user.id).maybeSingle();
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(project);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

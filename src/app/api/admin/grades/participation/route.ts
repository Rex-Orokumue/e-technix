import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const body = await req.json();
  const { student_id, session_id, score, notes } = body;

  if (!student_id || !session_id || typeof score !== 'number' || score < 0 || score > 5)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  try {
    const { data, error } = await supabase
      .from('participation_scores')
      .upsert(
        { student_id, session_id, score, notes: notes ?? null },
        { onConflict: 'student_id,session_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) {
      console.error('[participation POST]', error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[participation POST] unexpected error:', err);
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { student_id, session_id } = await req.json();

  const { error } = await supabase
    .from('participation_scores')
    .delete()
    .eq('student_id', student_id)
    .eq('session_id', session_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

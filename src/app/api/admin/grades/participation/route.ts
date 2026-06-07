import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const body = await req.json();
  const { student_id, session_id, score, notes } = body;

  if (!student_id || !session_id || typeof score !== 'number' || score < 1 || score > 5)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const { data, error } = await supabase
    .from('participation_scores')
    .upsert({ student_id, session_id, score, notes: notes ?? null }, { onConflict: 'student_id,session_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
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

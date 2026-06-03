import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const [{ data: students }, { data: sessions }, { data: attendance }] = await Promise.all([
    supabase.from('students').select('id, full_name, email, track').order('full_name'),
    // Only completed sessions (have a recording)
    supabase.from('sessions')
      .select('id, phase, week, session_number, title, date')
      .not('youtube_url', 'is', null)
      .order('phase').order('week').order('session_number'),
    supabase.from('attendance').select('student_id, session_id'),
  ]);

  return NextResponse.json({ students: students ?? [], sessions: sessions ?? [], attendance: attendance ?? [] });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { student_id, session_id } = await req.json();
  const supabase = createAdminClient();
  const { error } = await supabase.from('attendance').insert({ student_id, session_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { student_id, session_id } = await req.json();
  const supabase = createAdminClient();
  const { error } = await supabase.from('attendance').delete()
    .eq('student_id', student_id).eq('session_id', session_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

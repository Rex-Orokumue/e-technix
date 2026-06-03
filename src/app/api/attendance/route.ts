import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { session_id, code } = await req.json();

  // Verify the attendance code against the session
  const adminSupabase = createAdminClient();
  const { data: session, error: sessionError } = await adminSupabase
    .from('sessions')
    .select('attendance_code, attendance_code_expires_at')
    .eq('id', session_id)
    .single();

  if (sessionError || !session)
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (!session.attendance_code)
    return NextResponse.json({ error: 'No attendance code active for this session' }, { status: 400 });
  if (session.attendance_code !== code)
    return NextResponse.json({ error: 'Incorrect attendance code' }, { status: 400 });
  if (session.attendance_code_expires_at && new Date(session.attendance_code_expires_at) < new Date())
    return NextResponse.json({ error: 'Attendance code has expired' }, { status: 400 });

  const { data, error } = await supabase
    .from('attendance')
    .insert({ student_id: user.id, session_id })
    .select()
    .single();

  if (error?.code === '23505')
    return NextResponse.json({ error: 'Attendance already marked' }, { status: 409 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

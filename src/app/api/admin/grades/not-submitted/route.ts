import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { student_id, assignment_id } = await req.json();
  if (!student_id || !assignment_id)
    return NextResponse.json({ error: 'Missing student_id or assignment_id' }, { status: 400 });

  const supabase = createAdminClient();

  // Upsert: if a real submission already exists don't overwrite it
  const { data: existing } = await supabase
    .from('assignment_submissions')
    .select('id, status')
    .eq('student_id', student_id)
    .eq('assignment_id', assignment_id)
    .maybeSingle();

  if (existing && existing.status !== 'not_submitted')
    return NextResponse.json({ error: 'A real submission already exists for this assignment.' }, { status: 409 });

  if (existing) {
    // Already marked not_submitted — remove it (toggle off)
    const { error } = await supabase.from('assignment_submissions').delete().eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ removed: true });
  }

  const { data, error } = await supabase
    .from('assignment_submissions')
    .insert({
      student_id,
      assignment_id,
      drive_link:     '[not submitted]',
      score:          0,
      contribution:   'full',
      status:         'not_submitted',
      is_late:        false,
      penalty_status: 'none',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

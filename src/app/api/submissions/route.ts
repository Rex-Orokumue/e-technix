import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  // Always check student session FIRST — if a student is logged in, serve only their
  // data regardless of any admin cookie that may also be present on the same device.
  // This prevents data leaking when testing both admin and student on the same browser.
  const ssrClient = await createClient();
  const { data: { user } } = await ssrClient.auth.getUser();

  if (user) {
    // Student: return own submissions only
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*, assignments(title, assignment_code, phase, week)')
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // No student session — require admin cookie
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Admin: return all submissions with student + assignment info
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*, students(full_name, email, track), assignments(title, assignment_code, phase, week)')
    .order('submitted_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Guard against closed assignments + auto-detect late submission
  const adminSupabase = createAdminClient();
  let isLate = false;
  let penaltyStatus = 'none';
  if (body.assignment_id) {
    const { data: assignment } = await adminSupabase
      .from('assignments')
      .select('due_date, status')
      .eq('id', body.assignment_id)
      .single();

    if (assignment?.status === 'closed')
      return NextResponse.json({ error: 'This assignment is closed and no longer accepting submissions.' }, { status: 403 });

    if (assignment?.due_date) {
      const nowGMT1 = new Date(Date.now() + 60 * 60 * 1000);
      // Late = submitted after 23:59:59 on the due date in GMT+1
      const endOfDueDay = new Date(`${assignment.due_date}T23:59:59+01:00`);
      isLate = nowGMT1 > endOfDueDay;
      if (isLate) penaltyStatus = 'auto';
    }
  }

  const { data, error } = await supabase
    .from('assignment_submissions')
    .insert({ ...body, student_id: user.id, is_late: isLate, penalty_status: penaltyStatus })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  // Check student session first — if student owns this submission, enforce student rules
  // even if an admin cookie is also present (prevents cookie bleed when testing both roles).
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (user) {
    const { data: existing, error: fetchErr } = await supabase
      .from('assignment_submissions')
      .select('student_id, edit_count')
      .eq('id', id)
      .single();
    if (fetchErr || !existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (existing.student_id === user.id) {
      // Student editing their own submission — restrict fields, max 2 edits
      if (existing.edit_count >= 2)
        return NextResponse.json({ error: 'Maximum edits reached (2)' }, { status: 400 });
      const { drive_link, note } = body;
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({ drive_link, note, status: 'submitted', edit_count: existing.edit_count + 1, reviewed_at: null })
        .eq('id', id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }
    // Student doesn't own this submission — fall through to admin check below
  }

  // Admin: update any field (status, admin_feedback, etc.)
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('assignment_submissions')
    .update({ ...body, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('assignment_submissions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const body = await req.json();

  // Penalty action: enforce or lift
  if (body.penalty_action) {
    const { penalty_action, penalty_note, admin_name } = body;
    if (!['enforce', 'lift'].includes(penalty_action))
      return NextResponse.json({ error: 'Invalid penalty_action' }, { status: 400 });
    if (!penalty_note?.trim())
      return NextResponse.json({ error: 'A reason is required to change the penalty status.' }, { status: 400 });

    const newStatus = penalty_action === 'enforce' ? 'enforced' : 'lifted';
    const { data, error } = await supabase
      .from('assignment_submissions')
      .update({
        penalty_status:     newStatus,
        penalty_note:       penalty_note.trim(),
        penalty_changed_by: admin_name ?? 'Admin',
        penalty_changed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Score + contribution grading
  const { score, contribution } = body;
  if (typeof score !== 'number' || score < 0 || score > 100)
    return NextResponse.json({ error: 'Score must be 0–100' }, { status: 400 });
  if (!['full', 'partial', 'minimal'].includes(contribution))
    return NextResponse.json({ error: 'Invalid contribution value' }, { status: 400 });

  const { data, error } = await supabase
    .from('assignment_submissions')
    .update({ score, contribution })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

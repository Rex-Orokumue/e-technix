import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const body = await req.json();
  const { student_id, phase = 1, content_score, presentation_score, delivery_score, qa_score, notes } = body;

  for (const [field, val] of Object.entries({ content_score, presentation_score, delivery_score, qa_score })) {
    if (typeof val !== 'number' || val < 1 || val > 10)
      return NextResponse.json({ error: `${field} must be 1–10` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('capstone_grades')
    .upsert(
      { student_id, phase, content_score, presentation_score, delivery_score, qa_score, notes: notes ?? null, updated_at: new Date().toISOString() },
      { onConflict: 'student_id,phase' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { manual_score } = await req.json();
  const supabase = createAdminClient();
  const { data: attempt } = await supabase.from('quiz_attempts').select('auto_score').eq('id', id).single();
  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const total = (attempt.auto_score ?? 0) + (Number(manual_score) || 0);
  const { data, error } = await supabase.from('quiz_attempts')
    .update({ manual_score: Number(manual_score) || 0, total_score: total, status: 'graded' })
    .eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

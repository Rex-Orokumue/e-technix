import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: orig, error } = await supabase.from('quizzes').select('*').eq('id', id).single();
  if (error || !orig) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { id: _omit, created_at: _omit2, ...rest } = orig as any;
  const { data: copy, error: cErr } = await supabase
    .from('quizzes').insert({ ...rest, title: `${orig.title} (Copy)`, status: 'draft' })
    .select().single();
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  const { data: questions } = await supabase
    .from('quiz_questions').select('*').eq('quiz_id', id).order('position');
  if (questions && questions.length) {
    const cloned = questions.map(({ id: _i, quiz_id: _q, ...qrest }: any) => ({ ...qrest, quiz_id: copy.id }));
    const { error: qErr } = await supabase.from('quiz_questions').insert(cloned);
    if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  }
  return NextResponse.json(copy, { status: 201 });
}

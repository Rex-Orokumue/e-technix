import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: quiz, error } = await supabase.from('quizzes').select('*').eq('id', id).single();
  if (error || !quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data: questions } = await supabase
    .from('quiz_questions').select('*').eq('quiz_id', id).order('position');

  // Students must not receive answers/explanations before submitting
  const ssr = await createClient();
  const { data: { user } } = await ssr.auth.getUser();
  const admin = !user && await isAdminAuthenticated();
  if (admin) return NextResponse.json({ ...quiz, questions: questions ?? [] });

  const safe = (questions ?? []).map(q => ({ ...q, correct_answer: undefined, explanation: undefined }));
  return NextResponse.json({ ...quiz, questions: safe });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('quizzes').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('quizzes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

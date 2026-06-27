import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { gradeAttempt } from '@/lib/quiz';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ssr = await createClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { answers, started_at } = await req.json();
  const supabase = createAdminClient();

  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', id).single();
  if (!quiz || quiz.status !== 'published')
    return NextResponse.json({ error: 'Quiz not available' }, { status: 403 });

  const now = new Date();

  // Schedule window check
  if (quiz.opens_at && new Date(quiz.opens_at) > now)
    return NextResponse.json({ error: 'This quiz has not opened yet' }, { status: 403 });
  if (quiz.closes_at && new Date(quiz.closes_at) < now)
    return NextResponse.json({ error: 'The quiz window has closed' }, { status: 403 });

  // Due date check (GMT+1 end of day)
  if (quiz.due_date) {
    const nowG1 = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(`${quiz.due_date}T23:59:59+01:00`);
    if (nowG1 > end) return NextResponse.json({ error: 'Quiz is past its due date' }, { status: 403 });
  }

  // Attempts-left check
  const { data: prior } = await supabase
    .from('quiz_attempts').select('id').eq('quiz_id', id).eq('student_id', user.id);
  const used = prior?.length ?? 0;
  if (used >= quiz.max_attempts)
    return NextResponse.json({ error: 'No attempts remaining' }, { status: 403 });

  const { data: questions } = await supabase
    .from('quiz_questions').select('*').eq('quiz_id', id).order('position');

  const result = gradeAttempt((questions ?? []) as any, answers ?? {});
  const status = result.hasShortText ? 'submitted' : 'graded';
  const totalScore = result.hasShortText ? null : result.autoScore;

  const { data: attempt, error } = await supabase.from('quiz_attempts').insert({
    quiz_id: id, student_id: user.id, answers: answers ?? {},
    auto_score: result.autoScore, max_score: result.maxScore,
    manual_score: result.hasShortText ? null : 0,
    total_score: totalScore, status,
    attempt_number: used + 1,
    started_at: started_at ?? null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return feedback (with explanations) for immediate display
  return NextResponse.json({ attempt, feedback: result.feedback }, { status: 201 });
}

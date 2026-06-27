import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendPushToStudents } from '@/lib/push';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { manual_score } = await req.json();
  const supabase = createAdminClient();

  const { data: attempt } = await supabase
    .from('quiz_attempts').select('auto_score, student_id, quiz_id').eq('id', id).single();
  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const total = (attempt.auto_score ?? 0) + (Number(manual_score) || 0);
  const { data, error } = await supabase.from('quiz_attempts')
    .update({ manual_score: Number(manual_score) || 0, total_score: total, status: 'graded' })
    .eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the student their quiz has been graded
  if (attempt.student_id) {
    const { data: quiz } = await supabase.from('quizzes').select('title').eq('id', attempt.quiz_id).single();
    sendPushToStudents([attempt.student_id], {
      title: '✅ Quiz graded',
      body: `${quiz?.title ?? 'Your quiz'} has been graded — score: ${total}/${data.max_score}. Tap to view.`,
      url: '/hub?tab=quizzes',
    }).catch(console.error);
  }

  return NextResponse.json(data);
}

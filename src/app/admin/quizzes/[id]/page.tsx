export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import QuizBuilder from '@/components/admin/QuizBuilder';
import QuizPageShell from '@/components/QuizPageShell';

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', id).single();
  const { data: questions } = await supabase.from('quiz_questions').select('*').eq('quiz_id', id).order('position');
  if (!quiz) return <div style={{ color: 'var(--muted)' }}>Quiz not found.</div>;
  return (
    <QuizPageShell>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem' }}>Edit Quiz</h1>
      <QuizBuilder quiz={quiz} questions={questions ?? []} />
    </QuizPageShell>
  );
}

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import AttemptGradeRow from '@/components/admin/AttemptGradeRow';

export default async function GradeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', id).single();
  const { data: questions } = await supabase.from('quiz_questions').select('*').eq('quiz_id', id).order('position');
  const { data: attempts } = await supabase
    .from('quiz_attempts').select('*, students(full_name, email, track)')
    .eq('quiz_id', id).order('submitted_at', { ascending: false });
  const allQuestions = questions ?? [];
  const shortText = allQuestions.filter(q => q.type === 'short_text');

  return (
    <div style={{ maxWidth: '100%' }}>
      <Link href="/admin/quizzes" style={{ color: 'var(--muted)', fontSize: '0.82rem', textDecoration: 'none' }}>← Quizzes</Link>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', margin: '0.75rem 0 0.4rem', wordBreak: 'break-word' }}>{quiz?.title} — Submissions</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>{attempts?.length ?? 0} attempts{shortText.length > 0 ? ' · short-text questions need manual grading' : ''}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(attempts ?? []).map(a => (
          <AttemptGradeRow key={a.id} attempt={a} questions={allQuestions} shortTextQuestions={shortText} />
        ))}
        {(attempts ?? []).length === 0 && <p style={{ color: 'var(--muted)' }}>No attempts yet.</p>}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import QuizCard from '@/components/admin/QuizCard';

export default async function AdminQuizzesPage() {
  const supabase = createAdminClient();
  const { data: quizzes } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
  const qc = (await supabase.from('quiz_questions').select('quiz_id')).data ?? [];
  const ac = (await supabase.from('quiz_attempts').select('quiz_id')).data ?? [];
  const count = (rows: any[], id: string) => rows.filter(r => r.quiz_id === id).length;
  const enriched = (quizzes ?? []).map(q => ({ ...q, question_count: count(qc, q.id), attempt_count: count(ac, q.id) }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Quizzes</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{enriched.length} quizzes</p>
        </div>
        <Link href="/admin/quizzes/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', background: 'var(--cyan)', color: '#070D1A', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>+ New Quiz</Link>
      </div>
      {enriched.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🧠</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No quizzes yet. Create your first quiz.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {enriched.map(q => <QuizCard key={q.id} quiz={q} />)}
        </div>
      )}
    </div>
  );
}

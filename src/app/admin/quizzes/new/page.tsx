import QuizBuilder from '@/components/admin/QuizBuilder';
import QuizPageShell from '@/components/QuizPageShell';

export default function NewQuizPage() {
  return (
    <QuizPageShell>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem' }}>New Quiz</h1>
      <QuizBuilder />
    </QuizPageShell>
  );
}

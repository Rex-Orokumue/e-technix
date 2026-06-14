import QuizBuilder from '@/components/admin/QuizBuilder';

export default function NewQuizPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem' }}>New Quiz</h1>
      <QuizBuilder />
    </div>
  );
}

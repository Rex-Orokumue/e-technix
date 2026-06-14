export type QuestionType = 'mcq' | 'true_false' | 'short_text';

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  type: QuestionType;
  prompt: string;
  image_url?: string | null;
  options?: string[] | null;       // mcq choices
  correct_answer?: any;            // mcq: number index; true_false: boolean; short_text: null
  explanation?: string | null;
  points: number;
  position: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  tracks?: string[] | null;
  phase: number;
  week: number;
  session_id?: string | null;
  time_limit_mins?: number | null;
  max_attempts: number;
  shuffle_questions: boolean;
  status: 'draft' | 'published' | 'closed';
  due_date?: string | null;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, any>;
  auto_score: number;
  manual_score: number | null;
  total_score: number | null;
  max_score: number;
  status: 'submitted' | 'graded';
  attempt_number: number;
  started_at?: string | null;
  submitted_at: string;
}

export interface GradeResult {
  autoScore: number;
  maxScore: number;
  hasShortText: boolean;
  // per-question feedback for immediate display
  feedback: Record<string, { correct: boolean | null; earned: number; explanation?: string | null; correctLabel?: string | null }>;
}

// Human-readable correct answer for a question (option text for mcq, True/False for tf)
function correctLabelFor(q: QuizQuestion): string | null {
  if (q.type === 'mcq') {
    const idx = Number(q.correct_answer);
    return q.options?.[idx] ?? null;
  }
  if (q.type === 'true_false') return q.correct_answer ? 'True' : 'False';
  return null;
}

/**
 * Auto-grade MCQ + true/false. Short-text earns 0 now (manual later) and
 * marks correct: null so the UI shows "pending review".
 */
export function gradeAttempt(questions: QuizQuestion[], answers: Record<string, any>): GradeResult {
  let autoScore = 0;
  let maxScore = 0;
  let hasShortText = false;
  const feedback: GradeResult['feedback'] = {};

  for (const q of questions) {
    maxScore += q.points;
    const given = answers[q.id];
    if (q.type === 'short_text') {
      hasShortText = true;
      feedback[q.id] = { correct: null, earned: 0, explanation: q.explanation };
      continue;
    }
    let correct = false;
    if (q.type === 'mcq') correct = Number(given) === Number(q.correct_answer);
    else if (q.type === 'true_false') correct = Boolean(given) === Boolean(q.correct_answer);
    const earned = correct ? q.points : 0;
    autoScore += earned;
    feedback[q.id] = { correct, earned, explanation: q.explanation, correctLabel: correctLabelFor(q) };
  }

  return { autoScore, maxScore, hasShortText, feedback };
}

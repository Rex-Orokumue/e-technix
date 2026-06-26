'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Quiz, QuizQuestion, QuizAttempt } from '@/lib/quiz';
import QuizPageShell from '@/components/QuizPageShell';

const todayGMT1 = () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);

type Feedback = Record<string, { correct: boolean | null; earned: number; explanation?: string | null; correctLabel?: string | null }>;

export default function QuizzesTab({ studentId, track }: { studentId: string; track: string }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<{ quiz: Quiz; questions: QuizQuestion[] } | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await fetch('/api/quizzes').then(r => r.json());
    setQuizzes(data.quizzes ?? []);
    setAttempts(data.attempts ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openQuiz = async (quizId: string) => {
    const data = await fetch(`/api/quizzes/${quizId}`).then(r => r.json());
    setActive({ quiz: data, questions: data.questions ?? [] });
  };

  if (active) {
    return (
      <QuizPageShell>
        <TakeQuiz quiz={active.quiz} questions={active.questions}
          onExit={() => { setActive(null); load(); }} />
      </QuizPageShell>
    );
  }

  return (
    <QuizPageShell>
    <div>
      <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.4rem' }}>Quizzes</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Test your knowledge. Auto-graded questions score instantly.</p>

      {loading ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Loading…</p>
      ) : quizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🧠</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No quizzes available yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {quizzes.map(q => {
            const mine = attempts.filter(a => a.quiz_id === q.id).sort((a, b) => b.attempt_number - a.attempt_number);
            const used = mine.length;
            const left = q.max_attempts - used;
            const latest = mine[0];
            const best = mine.reduce<number | null>((acc, a) => {
              const s = a.total_score; if (s == null) return acc; return acc == null ? s : Math.max(acc, s);
            }, null);
            const pastDue = !!q.due_date && todayGMT1() > q.due_date;
            const awaiting = latest?.status === 'submitted';
            const canTake = left > 0 && !pastDue;

            let statusLine = 'Not started';
            if (awaiting) statusLine = `Submitted — awaiting review (auto: ${latest.auto_score}/${latest.max_score})`;
            else if (best != null) statusLine = `Best score: ${best}/${latest?.max_score ?? '?'}`;
            if (pastDue && !used) statusLine = 'Past due';

            return (
              <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.98rem', margin: '0 0 0.2rem', wordBreak: 'break-word' }}>{q.title}</h3>
                  {q.description && <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0 0 0.35rem', lineHeight: 1.5, wordBreak: 'break-word' }}>{q.description}</p>}
                  <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                    {statusLine} · {left > 0 ? `${left} attempt${left !== 1 ? 's' : ''} left` : 'No attempts left'}
                    {q.due_date && ` · due ${q.due_date}`}
                    {q.time_limit_mins && ` · ${q.time_limit_mins} min limit`}
                  </div>
                </div>
                <button onClick={() => openQuiz(q.id)} disabled={!canTake}
                  style={{ padding: '0.6rem 1.2rem', background: canTake ? 'var(--cyan)' : 'rgba(0,200,255,0.15)', color: canTake ? '#070D1A' : 'var(--muted)', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem', cursor: canTake ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                  {used > 0 ? 'Retake' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </QuizPageShell>
  );
}

function TakeQuiz({ quiz, questions, onExit }: { quiz: Quiz; questions: QuizQuestion[]; onExit: () => void }) {
  const ordered = useMemo(() => {
    const copy = [...questions];
    if (quiz.shuffle_questions) {
      for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
    }
    return copy;
  }, [questions, quiz.shuffle_questions]);

  const startedAt = useRef(new Date().toISOString());
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ attempt: any; feedback: Feedback } | null>(null);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(quiz.time_limit_mins ? quiz.time_limit_mins * 60 : null);
  const [violations, setViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);

  const submit = async () => {
    if (submitting || result) return;
    setSubmitting(true); setError('');
    const res = await fetch(`/api/quizzes/${quiz.id}/attempts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, started_at: startedAt.current }),
    });
    setSubmitting(false);
    if (res.ok) setResult(await res.json());
    else { const d = await res.json(); setError(d.error || 'Failed to submit'); }
  };
  const submitRef = useRef(submit);
  submitRef.current = submit;

  // Countdown
  useEffect(() => {
    if (secondsLeft == null || result) return;
    if (secondsLeft <= 0) { submitRef.current(); return; }
    const t = setTimeout(() => setSecondsLeft(s => (s == null ? s : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, result]);

  // Tab/window visibility anti-cheat
  useEffect(() => {
    if (result) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(v => {
          const next = v + 1;
          if (next >= 2) {
            submitRef.current();
          } else {
            setShowViolationWarning(true);
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [result]);

  const setAnswer = (qid: string, v: any) => setAnswers(a => ({ ...a, [qid]: v }));

  // Results view
  if (result) {
    const showExplanations = ordered.map(q => ({ q, fb: result.feedback[q.id] }));
    return (
      <div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.4rem' }}>{quiz.title} — Results</h2>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--cyan-border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Auto-graded score</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--cyan)' }}>{result.attempt.auto_score} / {result.attempt.max_score}</div>
          {result.attempt.status === 'submitted' && <p style={{ fontSize: '0.8rem', color: '#F59E0B', marginTop: '0.4rem' }}>Short-answer questions are pending instructor review — your total may rise.</p>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {showExplanations.map(({ q, fb }, i) => {
            const color = fb?.correct === true ? 'var(--cyan)' : fb?.correct === false ? '#FF5555' : '#F59E0B';
            const mark = fb?.correct === true ? '✓' : fb?.correct === false ? '✗' : '⏳';
            return (
              <div key={q.id} style={{ background: 'var(--surface)', border: `1px solid ${color}40`, borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color, fontWeight: 800, flexShrink: 0 }}>{mark}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', wordBreak: 'break-word' }}>{i + 1}. {q.prompt}</div>
                    {fb?.correct === false && fb?.correctLabel && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 600, marginBottom: '0.25rem', wordBreak: 'break-word' }}>Correct answer: {fb.correctLabel}</div>
                    )}
                    {fb?.explanation && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5, wordBreak: 'break-word' }}>{fb.explanation}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={onExit} style={{ marginTop: '1.5rem', padding: '0.7rem 1.5rem', background: 'var(--cyan)', color: '#070D1A', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Back to quizzes</button>
      </div>
    );
  }

  // Take view
  const mm = secondsLeft != null ? String(Math.floor(secondsLeft / 60)).padStart(2, '0') : '';
  const ss = secondsLeft != null ? String(secondsLeft % 60).padStart(2, '0') : '';

  return (
    <div>
      {/* Violation warning overlay */}
      {showViolationWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(7,13,26,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid #FF5555', borderRadius: '14px', padding: '2rem', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.15rem', color: '#FF5555', margin: '0 0 0.75rem' }}>Violation Detected</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
              You left the quiz tab. This has been recorded as a violation.<br />
              <strong style={{ color: 'var(--text)' }}>If you leave again, your quiz will be auto-submitted immediately.</strong>
            </p>
            <button onClick={() => setShowViolationWarning(false)}
              style={{ padding: '0.7rem 1.75rem', background: 'var(--cyan)', color: '#070D1A', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
              I understand — Resume Quiz
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>{quiz.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {violations > 0 && (
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', color: '#FF5555', background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.3)', borderRadius: '8px', padding: '0.35rem 0.75rem' }}>
              ⚠ {violations}/2 violation{violations !== 1 ? 's' : ''}
            </span>
          )}
          {secondsLeft != null && (
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem', color: secondsLeft < 60 ? '#FF5555' : 'var(--cyan)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.35rem 0.85rem' }}>⏱ {mm}:{ss}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {ordered.map((q, i) => (
          <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', maxWidth: '100%' }}>
            {/* No select/copy on question text */}
            <div
              style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', wordBreak: 'break-word', userSelect: 'none' }}
              onCopy={e => e.preventDefault()}
              onContextMenu={e => e.preventDefault()}
            >
              {i + 1}. {q.prompt} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.78rem' }}>({q.points} pt{q.points !== 1 ? 's' : ''})</span>
            </div>
            {q.image_url && <img src={q.image_url} alt="" style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '0.75rem', display: 'block' }} />}

            {q.type === 'mcq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(q.options ?? []).map((opt, oi) => (
                  <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', borderRadius: '8px', border: `1px solid ${Number(answers[q.id]) === oi ? 'var(--cyan-border)' : 'var(--border)'}`, background: Number(answers[q.id]) === oi ? 'rgba(0,200,255,0.06)' : 'transparent', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="radio" name={q.id} checked={Number(answers[q.id]) === oi} onChange={() => setAnswer(q.id, oi)} style={{ accentColor: 'var(--cyan)', flexShrink: 0 }} />
                    <span style={{ minWidth: 0, wordBreak: 'break-word' }}>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'true_false' && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[true, false].map(v => (
                  <label key={String(v)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', borderRadius: '8px', border: `1px solid ${answers[q.id] === v ? 'var(--cyan-border)' : 'var(--border)'}`, background: answers[q.id] === v ? 'rgba(0,200,255,0.06)' : 'transparent', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                    <input type="radio" name={q.id} checked={answers[q.id] === v} onChange={() => setAnswer(q.id, v)} style={{ accentColor: 'var(--cyan)' }} />
                    {v ? 'True' : 'False'}
                  </label>
                ))}
              </div>
            )}

            {q.type === 'short_text' && (
              <textarea
                value={answers[q.id] ?? ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                onPaste={e => e.preventDefault()}
                placeholder="Type your answer…"
                style={{ width: '100%', boxSizing: 'border-box', minHeight: '80px', padding: '0.7rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
              />
            )}
          </div>
        ))}
      </div>

      {error && <div style={{ marginTop: '1rem', padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button onClick={submit} disabled={submitting} style={{ padding: '0.85rem 1.75rem', background: 'var(--cyan)', color: '#070D1A', border: 'none', borderRadius: '9px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Submitting…' : 'Submit Quiz'}</button>
        <button onClick={onExit} style={{ padding: '0.85rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '9px', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

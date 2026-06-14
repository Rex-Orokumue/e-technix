'use client';

import { useState } from 'react';

// Render the student's answer for a question in human-readable form
function answerLabel(q: any, raw: any): string {
  if (raw == null || raw === '') return '';
  if (q.type === 'mcq') return q.options?.[Number(raw)] ?? `Option ${Number(raw) + 1}`;
  if (q.type === 'true_false') return raw ? 'True' : 'False';
  return String(raw);
}
function correctLabel(q: any): string {
  if (q.type === 'mcq') return q.options?.[Number(q.correct_answer)] ?? '';
  if (q.type === 'true_false') return q.correct_answer ? 'True' : 'False';
  return '';
}
function isCorrect(q: any, raw: any): boolean | null {
  if (q.type === 'short_text') return null;
  if (raw == null || raw === '') return false;
  if (q.type === 'mcq') return Number(raw) === Number(q.correct_answer);
  return Boolean(raw) === Boolean(q.correct_answer);
}

export default function AttemptGradeRow({ attempt, questions, shortTextQuestions }: { attempt: any; questions: any[]; shortTextQuestions: any[] }) {
  const needsGrading = attempt.status === 'submitted' && shortTextQuestions.length > 0;
  const [scores, setScores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(needsGrading);

  const save = async () => {
    setSaving(true);
    const manual = shortTextQuestions.reduce((sum, q) => sum + (Number(scores[q.id]) || 0), 0);
    const res = await fetch(`/api/quiz-attempts/${attempt.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ manual_score: manual }) });
    setSaving(false);
    if (res.ok) { setDone(true); setTimeout(() => location.reload(), 600); }
  };

  const student = attempt.students;
  const scoreLabel = attempt.total_score != null ? `${attempt.total_score} / ${attempt.max_score}` : `${attempt.auto_score} / ${attempt.max_score} (auto)`;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem 1.25rem', maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.92rem', wordBreak: 'break-word' }}>{student?.full_name ?? 'Unknown'}</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{student?.track} · attempt {attempt.attempt_number}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1rem', color: 'var(--cyan)' }}>{scoreLabel}</span>
          <span style={{ fontSize: '0.64rem', fontWeight: 700, color: attempt.status === 'graded' ? '#34D399' : '#F59E0B', background: attempt.status === 'graded' ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${attempt.status === 'graded' ? '#34D39940' : '#F59E0B40'}`, borderRadius: '4px', padding: '0.1rem 0.45rem', textTransform: 'uppercase' }}>{attempt.status === 'graded' ? 'Graded' : 'Needs review'}</span>
          <button onClick={() => setOpen(o => !o)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.74rem', fontFamily: 'var(--font-head)', fontWeight: 600, cursor: 'pointer' }}>{open ? 'Hide answers' : 'View answers'}</button>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          {questions.map((q, i) => {
            const raw = attempt.answers?.[q.id];
            const given = answerLabel(q, raw);
            const ok = isCorrect(q, raw);
            const color = ok === true ? 'var(--cyan)' : ok === false ? '#FF5555' : '#F59E0B';
            const mark = ok === true ? '✓' : ok === false ? '✗' : '⏳';
            return (
              <div key={q.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ color, fontWeight: 800, flexShrink: 0 }}>{mark}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.2rem', wordBreak: 'break-word' }}>{i + 1}. {q.prompt} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({q.points} pt{q.points !== 1 ? 's' : ''})</span></div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.5rem 0.7rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {given || <em style={{ color: 'var(--muted)' }}>No answer</em>}
                  </div>
                  {ok === false && q.type !== 'short_text' && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--cyan)', marginTop: '0.25rem', wordBreak: 'break-word' }}>Correct: {correctLabel(q)}</div>
                  )}
                  {needsGrading && q.type === 'short_text' && (
                    <input type="number" min="0" max={q.points} placeholder={`Award points (0–${q.points})`} value={scores[q.id] ?? ''} onChange={e => setScores(s => ({ ...s, [q.id]: e.target.value }))}
                      style={{ width: '180px', maxWidth: '100%', boxSizing: 'border-box', marginTop: '0.4rem', padding: '0.45rem 0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--cyan-border)', borderRadius: '7px', color: 'var(--text)', fontSize: '0.82rem', outline: 'none', colorScheme: 'dark' }} />
                  )}
                </div>
              </div>
            );
          })}

          {needsGrading && (
            <button onClick={save} disabled={saving || done} style={{ alignSelf: 'flex-start', padding: '0.55rem 1.1rem', background: 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer' }}>{done ? '✓ Saved' : saving ? 'Saving…' : 'Save grade'}</button>
          )}
        </div>
      )}
    </div>
  );
}

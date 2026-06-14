'use client';

import { useState } from 'react';

export default function AttemptGradeRow({ attempt, shortTextQuestions }: { attempt: any; shortTextQuestions: any[] }) {
  const needsGrading = attempt.status === 'submitted' && shortTextQuestions.length > 0;
  const [scores, setScores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.92rem' }}>{student?.full_name ?? 'Unknown'}</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{student?.track} · attempt {attempt.attempt_number}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1rem', color: 'var(--cyan)' }}>{scoreLabel}</span>
          <span style={{ fontSize: '0.64rem', fontWeight: 700, color: attempt.status === 'graded' ? '#34D399' : '#F59E0B', background: attempt.status === 'graded' ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${attempt.status === 'graded' ? '#34D39940' : '#F59E0B40'}`, borderRadius: '4px', padding: '0.1rem 0.45rem', textTransform: 'uppercase' }}>{attempt.status === 'graded' ? 'Graded' : 'Needs review'}</span>
        </div>
      </div>

      {needsGrading && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          {shortTextQuestions.map(q => (
            <div key={q.id}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>{q.prompt} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({q.points} pts max)</span></div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.55rem 0.75rem', marginBottom: '0.4rem', whiteSpace: 'pre-wrap' }}>{attempt.answers?.[q.id] || <em style={{ color: 'var(--muted)' }}>No answer</em>}</div>
              <input type="number" min="0" max={q.points} placeholder={`Points (0–${q.points})`} value={scores[q.id] ?? ''} onChange={e => setScores(s => ({ ...s, [q.id]: e.target.value }))}
                style={{ width: '160px', padding: '0.5rem 0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none', colorScheme: 'dark' }} />
            </div>
          ))}
          <button onClick={save} disabled={saving || done} style={{ alignSelf: 'flex-start', padding: '0.55rem 1.1rem', background: 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer' }}>{done ? '✓ Saved' : saving ? 'Saving…' : 'Save grade'}</button>
        </div>
      )}
    </div>
  );
}

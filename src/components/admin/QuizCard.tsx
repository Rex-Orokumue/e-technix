'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',     color: '#7A8FAD', bg: 'rgba(122,143,173,0.1)' },
  published: { label: 'Published', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  closed:    { label: 'Closed',    color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

export default function QuizCard({ quiz }: { quiz: any }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const meta = STATUS[quiz.status] ?? STATUS.draft;

  const duplicate = async () => {
    setBusy(true);
    await fetch(`/api/quizzes/${quiz.id}/duplicate`, { method: 'POST' });
    setBusy(false); router.refresh();
  };
  const del = async () => {
    setBusy(true);
    await fetch(`/api/quizzes/${quiz.id}`, { method: 'DELETE' });
    setBusy(false); setConfirming(false); router.refresh();
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.color}40`, borderRadius: '4px', padding: '0.1rem 0.45rem', textTransform: 'uppercase' }}>{meta.label}</span>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.title}</h3>
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
          {quiz.question_count ?? 0} questions · {quiz.attempt_count ?? 0} attempts · Phase {quiz.phase} Week {quiz.week}
          {quiz.tracks?.length ? ` · ${quiz.tracks.join(', ')}` : ' · All tracks'}
        </div>
        {(quiz.opens_at || quiz.closes_at) && (
          <div style={{ fontSize: '0.72rem', color: '#F59E0B', marginTop: '0.2rem' }}>
            ⏰ {quiz.opens_at ? `Opens ${new Date(quiz.opens_at).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}` : ''}
            {quiz.opens_at && quiz.closes_at ? ' – ' : ''}
            {quiz.closes_at ? `Closes ${new Date(quiz.closes_at).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}` : ''}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap' }}>
        <Link href={`/admin/quizzes/${quiz.id}`} style={btn('var(--cyan-border)', 'var(--cyan)')}>Edit</Link>
        <Link href={`/admin/quizzes/${quiz.id}/grade`} style={btn('var(--border)', 'var(--muted)')}>Grade</Link>
        <button onClick={duplicate} disabled={busy} style={btn('var(--border)', 'var(--muted)') as any}>Duplicate</button>
        {confirming ? (
          <>
            <button onClick={del} disabled={busy} style={btn('rgba(255,51,51,0.3)', '#FF5555') as any}>Confirm</button>
            <button onClick={() => setConfirming(false)} style={btn('var(--border)', 'var(--muted)') as any}>✕</button>
          </>
        ) : (
          <button onClick={() => setConfirming(true)} style={btn('var(--border)', 'var(--muted)') as any}>Delete</button>
        )}
      </div>
    </div>
  );
}

function btn(border: string, color: string): React.CSSProperties {
  return { padding: '0.4rem 0.8rem', background: 'transparent', border: `1px solid ${border}`, color, borderRadius: '7px', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none', cursor: 'pointer' };
}

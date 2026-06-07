'use client';

import { useEffect, useState } from 'react';
import type { GradeSummary } from '@/lib/grades';
import { GRADE_WEIGHTS } from '@/lib/grades';

const CONTRIBUTION_LABEL: Record<string, string> = {
  full:    'Full contribution',
  partial: 'Partial (×0.75)',
  minimal: 'Minimal (×0.5)',
};

const PARTICIPATION_LABELS = ['', 'No engagement', 'Distracted', 'Passive', 'Engaged', 'Active contributor'];

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const radius  = (size - 16) / 2;
  const circ    = 2 * Math.PI * radius;
  const filled  = (Math.min(score, 100) / 100) * circ;
  const color   = score >= 60 ? '#34D366' : score >= 40 ? '#F59E0B' : '#FF5555';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  );
}

function ComponentBar({ label, score, weight, pending, icon }: {
  label: string; score: number | null; weight: number; pending: boolean; icon: string;
}) {
  const pct   = score ?? 0;
  const color = score === null ? 'var(--muted)' : pct >= 60 ? '#34D366' : pct >= 40 ? '#F59E0B' : '#FF5555';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{label}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
            {Math.round(weight * 100)}% weight
          </span>
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color, fontFamily: 'var(--font-head)' }}>
          {pending ? '—' : `${score}%`}
        </span>
      </div>
      <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
        {!pending && (
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.5s ease' }} />
        )}
      </div>
      {pending && (
        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontStyle: 'italic' }}>Not yet scored</span>
      )}
    </div>
  );
}

export default function ProgressTab() {
  const [summary, setSummary] = useState<GradeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch('/api/grades/summary')
      .then(r => r.json())
      .then(d => { setSummary(d); setLoading(false); })
      .catch(() => { setError('Failed to load grades.'); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Loading your progress…</div>;
  if (error)   return <div style={{ color: '#FF5555', padding: '2rem' }}>{error}</div>;
  if (!summary) return null;

  const { overall, passed, attendance, assignments, participation, capstone, pending } = summary;

  const statusColor  = passed ? '#34D366' : overall >= 40 ? '#F59E0B' : '#FF5555';
  const statusLabel  = passed ? '✅ On track for Phase 2' : overall >= 40 ? '⚠️ At risk — needs improvement' : '❌ Below threshold';
  const statusBg     = passed ? 'rgba(52,211,102,0.08)' : overall >= 40 ? 'rgba(245,158,11,0.08)' : 'rgba(255,51,51,0.08)';
  const statusBorder = passed ? 'rgba(52,211,102,0.25)' : overall >= 40 ? 'rgba(245,158,11,0.25)' : 'rgba(255,51,51,0.25)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`
        .grade-detail-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .grade-assign-item { flex-direction: row; align-items: center; }
        @media (max-width: 480px) {
          .grade-assign-item { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* Header card — overall score */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ScoreRing score={overall} size={110} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', lineHeight: 1, color: overall >= 60 ? '#34D366' : overall >= 40 ? '#F59E0B' : '#FF5555' }}>{overall}%</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>overall</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.4rem' }}>
            Phase 1 Progress
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: statusBg, border: `1px solid ${statusBorder}`, borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.82rem', fontWeight: 700, color: statusColor, marginBottom: '0.75rem' }}>
            {statusLabel}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            You need <strong style={{ color: 'var(--text)' }}>60%</strong> overall to progress to Phase 2.
            {pending.length > 0 && ` Score shown is based on graded components only — ${pending.join(', ')} pending.`}
          </p>
        </div>
      </div>

      {/* Component breakdown */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Score Breakdown</h3>

        <ComponentBar label="Attendance"    score={attendance.score}    weight={GRADE_WEIGHTS.attendance}    pending={attendance.score === null}    icon="📅" />
        <ComponentBar label="Assignments"   score={assignments.score}   weight={GRADE_WEIGHTS.assignments}   pending={assignments.score === null}   icon="📝" />
        <ComponentBar label="Participation" score={participation.score} weight={GRADE_WEIGHTS.participation} pending={participation.score === null} icon="🎙️" />
        <ComponentBar label="Capstone"      score={capstone.score}      weight={GRADE_WEIGHTS.capstone}      pending={!capstone.graded}             icon="🏆" />

        {/* Gate line */}
        <div style={{ position: 'relative', marginTop: '0.5rem' }}>
          <div style={{ height: '1px', background: 'var(--border)' }} />
          <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', background: 'var(--surface)', paddingLeft: '0.5rem' }}>
            Gate: 60%
          </span>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grade-detail-grid" style={{ display: 'grid', gap: '1rem' }}>

        {/* Attendance detail */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>📅 Attendance</div>
          {attendance.total === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>No sessions have happened yet.</p>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', color: attendance.score !== null && attendance.score >= 60 ? '#34D366' : '#F59E0B', marginBottom: '0.25rem' }}>
                {attendance.attended}/{attendance.total}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>
                sessions attended · {attendance.score ?? 0}% rate
              </p>
            </>
          )}
        </div>

        {/* Participation detail */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>🎙️ Participation</div>
          {participation.count === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Not yet scored by your tutor.</p>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', color: participation.score !== null && participation.score >= 60 ? '#34D366' : '#F59E0B', marginBottom: '0.25rem' }}>
                {participation.score}%
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>
                across {participation.count} scored session{participation.count !== 1 ? 's' : ''}
              </p>
            </>
          )}
        </div>

        {/* Capstone detail */}
        {capstone.graded && capstone.rubric && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>🏆 Capstone Rubric</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Content & Depth',      val: capstone.rubric.content_score,      w: '35%' },
                { label: 'Presentation',         val: capstone.rubric.presentation_score, w: '25%' },
                { label: 'Delivery',             val: capstone.rubric.delivery_score,     w: '20%' },
                { label: 'Responding to Q&A',    val: capstone.rubric.qa_score,           w: '20%' },
              ].map(({ label, val, w }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text)' }}>{label}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)', marginLeft: '0.4rem' }}>({w})</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--cyan)' }}>{val}/10</span>
                </div>
              ))}
            </div>
            {capstone.rubric.notes && (
              <div style={{ marginTop: '0.75rem', padding: '0.65rem', background: 'rgba(0,200,255,0.04)', border: '1px solid var(--cyan-border)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Tutor notes</span>
                {capstone.rubric.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assignment scores */}
      {assignments.items.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>📝 Graded Assignments</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {assignments.items.map(item => {
              const mult      = item.contribution === 'partial' ? 0.75 : item.contribution === 'minimal' ? 0.5 : 1;
              const effective = Math.round(item.score * mult);
              return (
                <div key={item.id} className="grade-assign-item" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)', borderRadius: '9px' }}>
                  <div style={{ flex: 1 }}>
                    {item.code && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--cyan)', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '4px', padding: '0.1rem 0.4rem', marginRight: '0.5rem' }}>{item.code}</span>
                    )}
                    <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{item.title}</span>
                    {item.contribution !== 'full' && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '2px' }}>{CONTRIBUTION_LABEL[item.contribution]}</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1rem', color: effective >= 60 ? '#34D366' : '#F59E0B' }}>{effective}</div>
                    {item.contribution !== 'full' && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>raw: {item.score}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state — nothing graded yet */}
      {pending.length === 4 && (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Your grades will appear here as your tutor grades your work.<br />
            Keep attending sessions and submitting assignments!
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import AdminSubmissionStatusSelect from './AdminSubmissionStatusSelect';
import AdminDeleteSubmission from './AdminDeleteSubmission';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  submitted:         { label: 'Submitted',         color: '#7A8FAD', bg: 'rgba(122,143,173,0.1)' },
  reviewing:         { label: 'Reviewing',         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  approved:          { label: 'Approved',          color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  needs_corrections: { label: 'Needs Corrections', color: '#FF6B2B', bg: 'rgba(255,107,43,0.1)' },
};

interface Submission {
  id: string;
  status: string;
  drive_link: string;
  note?: string;
  admin_feedback?: string;
  edit_count: number;
  submitted_at: string;
  students: { full_name: string; email: string; track: string } | null;
  assignments: { title: string; assignment_code: string } | null;
}

export default function AdminSubmissionsView({ submissions }: { submissions: Submission[] }) {
  // Group by student name — exclude N/A placeholders
  const grouped: Record<string, Submission[]> = {};
  for (const sub of submissions.filter(s => s.status !== 'not_submitted')) {
    const key = sub.students?.full_name ?? 'Unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(sub);
  }

  // Default: collapse groups with all-approved, expand the rest
  const defaultOpen: Record<string, boolean> = {};
  for (const [name, subs] of Object.entries(grouped)) {
    defaultOpen[name] = subs.some(s => s.status === 'submitted' || s.status === 'reviewing');
  }
  const [open, setOpen] = useState<Record<string, boolean>>(defaultOpen);
  const toggle = (name: string) => setOpen(o => ({ ...o, [name]: !o[name] }));

  const studentNames = Object.keys(grouped).sort((a, b) => {
    // Put students with pending submissions first
    const aPending = grouped[a].some(s => s.status === 'submitted');
    const bPending = grouped[b].some(s => s.status === 'submitted');
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    return a.localeCompare(b);
  });

  if (!submissions.length) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📬</div>
        <p style={{ color: 'var(--muted)' }}>No submissions yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {studentNames.map(name => {
        const subs = grouped[name];
        const student = subs[0].students;
        const pending = subs.filter(s => s.status === 'submitted').length;
        const isOpen = open[name] ?? false;

        return (
          <div key={name} style={{ background: 'var(--surface)', border: `1px solid ${pending > 0 ? 'var(--cyan-border)' : 'var(--border)'}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* Student header — clickable to expand/collapse */}
            <button
              onClick={() => toggle(name)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: pending > 0 ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.04)', border: `1px solid ${pending > 0 ? 'var(--cyan-border)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.8rem', color: pending > 0 ? 'var(--cyan)' : 'var(--muted)', flexShrink: 0 }}>
                {name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {student?.track} · {subs.length} submission{subs.length !== 1 ? 's' : ''}
                  {pending > 0 && <span style={{ marginLeft: '0.5rem', color: 'var(--cyan)', fontWeight: 700 }}>· {pending} pending</span>}
                </div>
              </div>
              {/* Status dots */}
              <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                {subs.map(s => {
                  const m = STATUS_META[s.status] ?? STATUS_META.submitted;
                  return <span key={s.id} title={m.label} style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color, display: 'inline-block' }} />;
                })}
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '0.7rem', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Expanded submissions */}
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0' }}>
                {subs.map((sub, i) => {
                  const meta = STATUS_META[sub.status] ?? STATUS_META.submitted;
                  const assignment = sub.assignments;
                  return (
                    <div key={sub.id} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start', padding: '1rem 1.25rem', borderBottom: i < subs.length - 1 ? '1px solid var(--border)' : 'none', background: sub.status === 'submitted' ? 'rgba(0,200,255,0.02)' : 'transparent' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--cyan)', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '4px', padding: '0.1rem 0.45rem' }}>
                            {assignment?.assignment_code}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{assignment?.title}</span>
                          {sub.edit_count > 0 && (
                            <span style={{ fontSize: '0.65rem', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '999px', padding: '0.1rem 0.5rem' }}>
                              edited {sub.edit_count}×
                            </span>
                          )}
                        </div>
                        <a href={sub.drive_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--cyan)', textDecoration: 'none' }}>
                          ↗ View Submission
                        </a>
                        {sub.note && <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '4px', fontStyle: 'italic' }}>&ldquo;{sub.note}&rdquo;</div>}
                        {sub.admin_feedback && (
                          <div style={{ marginTop: '6px', padding: '0.5rem 0.7rem', background: 'rgba(255,107,43,0.05)', border: '1px solid rgba(255,107,43,0.15)', borderRadius: '6px', fontSize: '0.74rem', color: 'var(--muted)' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>Remarks</span>
                            {sub.admin_feedback}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.color}40`, borderRadius: '999px', padding: '0.2rem 0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{meta.label}</span>
                        <AdminSubmissionStatusSelect id={sub.id} currentStatus={sub.status} currentFeedback={sub.admin_feedback} />
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                          {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <AdminDeleteSubmission id={sub.id} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

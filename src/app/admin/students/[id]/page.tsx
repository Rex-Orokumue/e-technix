'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TRACKS } from '@/lib/tracks';

function generatePassword(length = 12) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#!$%';
  const all = upper + lower + digits + symbols;
  const mandatory = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  const rest = Array.from({ length: length - mandatory.length }, () =>
    all[Math.floor(Math.random() * all.length)]
  );
  return [...mandatory, ...rest].sort(() => Math.random() - 0.5).join('');
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  track: string;
  enrolled_at: string;
  is_active: boolean;
  bio?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  location?: string | null;
}

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<{ attendance: number; sessions: number; submitted: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState(() => generatePassword());
  const [resetCopied, setResetCopied] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetError, setResetError] = useState('');

  const [editingTrack, setEditingTrack] = useState(false);
  const [newTrack, setNewTrack] = useState('');
  const [trackSaving, setTrackSaving] = useState(false);
  const [trackMsg, setTrackMsg] = useState('');
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/admin/attendance-report').then(r => r.json()),
      fetch('/api/submissions').then(r => r.json()),
      fetch('/api/assignments').then(r => r.json()),
    ]).then(([students, report, submissions, assignments]) => {
      const s = (students as Student[]).find(s => s.id === id);
      setStudent(s ?? null);

      const attended = (report.attendance ?? []).filter((a: any) => a.student_id === id).length;
      const totalSessions = (report.sessions ?? []).length;
      const submitted = (submissions as any[]).filter(s => s.student_id === id).length;
      const totalAssignments = (assignments as any[]).length;

      setStats({ attendance: attended, sessions: totalSessions, submitted, total: totalAssignments });
      setLoading(false);
    });
  }, [id]);

  const handleTrackSave = async () => {
    if (!newTrack || newTrack === student?.track) { setEditingTrack(false); return; }
    setTrackSaving(true);
    setTrackError('');
    const res = await fetch(`/api/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track: newTrack }),
    });
    setTrackSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setStudent(s => s ? { ...s, track: updated.track } : s);
      setTrackMsg('Track updated.');
      setEditingTrack(false);
      setTimeout(() => setTrackMsg(''), 3000);
    } else {
      const d = await res.json();
      setTrackError(d.error || 'Failed to update track');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    setResetMsg('');
    setResetError('');
    const res = await fetch(`/api/admin/students/${id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setResetting(false);
    if (res.ok) {
      setResetMsg(`Password updated. New password: ${password}`);
      setPassword(generatePassword());
      setResetCopied(false);
    } else {
      const d = await res.json();
      setResetError(d.error || 'Failed to reset password');
    }
  };

  const copyResetPassword = () => {
    navigator.clipboard.writeText(password).then(() => {
      setResetCopied(true);
      setTimeout(() => setResetCopied(false), 2000);
    });
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700 as const, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.4rem', display: 'block' };

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading…</div>;
  if (!student) return <div style={{ color: '#FF5555', padding: '2rem' }}>Student not found.</div>;

  const attPct = stats && stats.sessions > 0 ? Math.round((stats.attendance / stats.sessions) * 100) : 0;

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>← Back to Students</button>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>{student.full_name}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{student.email}</p>
      </div>

      {/* Profile card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <div style={labelStyle}>Track</div>
          {editingTrack ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <select
                value={newTrack}
                onChange={e => setNewTrack(e.target.value)}
                style={{ padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--cyan-border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', cursor: 'pointer', colorScheme: 'dark' }}
              >
                {TRACKS.map(t => <option key={t} value={t} style={{ background: '#0f1829' }}>{t}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={handleTrackSave} disabled={trackSaving} style={{ padding: '0.3rem 0.75rem', background: 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem', border: 'none', borderRadius: '5px', cursor: trackSaving ? 'not-allowed' : 'pointer' }}>
                  {trackSaving ? '…' : 'Save'}
                </button>
                <button onClick={() => { setEditingTrack(false); setTrackError(''); }} style={{ padding: '0.3rem 0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.75rem', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
              </div>
              {trackError && <div style={{ fontSize: '0.75rem', color: '#FF5555' }}>{trackError}</div>}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '5px', padding: '0.2rem 0.6rem', fontSize: '0.78rem', color: 'var(--cyan)', fontWeight: 600 }}>{student.track}</span>
              <button onClick={() => { setNewTrack(student.track); setEditingTrack(true); setTrackMsg(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>✏️ Edit</button>
              {trackMsg && <span style={{ fontSize: '0.73rem', color: '#34D366' }}>{trackMsg}</span>}
            </div>
          )}
        </div>
        <div>
          <div style={labelStyle}>Status</div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: student.is_active ? '#34D366' : 'var(--muted)', background: student.is_active ? 'rgba(52,211,102,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${student.is_active ? 'rgba(52,211,102,0.25)' : 'var(--border)'}`, borderRadius: '999px', padding: '0.2rem 0.6rem' }}>
            {student.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div>
          <div style={labelStyle}>Enrolled</div>
          <div style={{ fontSize: '0.85rem' }}>{new Date(student.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Progress stats */}
      {stats && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Attendance */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <span style={{ ...labelStyle, marginBottom: 0 }}>Attendance</span>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem', color: attPct >= 80 ? '#34D366' : attPct >= 50 ? '#F59E0B' : '#FF5555' }}>{attPct}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${attPct}%`, borderRadius: '999px', background: attPct >= 80 ? '#34D366' : attPct >= 50 ? '#F59E0B' : '#FF5555', transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{stats.attendance} of {stats.sessions} sessions attended</div>
          </div>
          {/* Assignments */}
          {(() => {
            const assignPct = stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0;
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <span style={{ ...labelStyle, marginBottom: 0 }}>Assignments Submitted</span>
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--cyan)' }}>{stats.submitted}/{stats.total}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${assignPct}%`, borderRadius: '999px', background: 'var(--cyan)', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{assignPct}% completion rate</div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Student profile details */}
      {(student.bio || student.phone || student.location || student.linkedin_url || student.github_url || student.portfolio_url) && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Profile Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {student.bio && (
              <div>
                <div style={labelStyle}>Bio</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{student.bio}</p>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {student.phone && <div><div style={labelStyle}>Phone</div><div style={{ fontSize: '0.85rem' }}>{student.phone}</div></div>}
              {student.location && <div><div style={labelStyle}>Location</div><div style={{ fontSize: '0.85rem' }}>{student.location}</div></div>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {student.linkedin_url && <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--cyan)', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '6px', padding: '0.25rem 0.65rem', textDecoration: 'none' }}>🔗 LinkedIn</a>}
              {student.github_url && <a href={student.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.65rem', textDecoration: 'none' }}>🐙 GitHub</a>}
              {student.portfolio_url && <a href={student.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#A78BFA', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '6px', padding: '0.25rem 0.65rem', textDecoration: 'none' }}>🌐 Portfolio</a>}
            </div>
          </div>
        </div>
      )}

      {/* Password reset */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Reset Password</h2>
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>New Password (auto-generated)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: '0.05em' }}
                value={password}
                onChange={e => { setPassword(e.target.value); setResetCopied(false); }}
                minLength={6}
                required
                onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button type="button" onClick={copyResetPassword} style={{ padding: '0.75rem 0.9rem', background: resetCopied ? 'rgba(52,211,102,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${resetCopied ? 'rgba(52,211,102,0.4)' : 'var(--border)'}`, borderRadius: '8px', color: resetCopied ? '#34D366' : 'var(--muted)', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {resetCopied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button type="button" onClick={() => { setPassword(generatePassword()); setResetCopied(false); }} title="Generate new password" style={{ padding: '0.75rem 0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 }}>
                🔄
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: '0.4rem 0 0' }}>Copy before resetting — share the new password with the student.</p>
          </div>
          {resetMsg && <div style={{ padding: '0.5rem 1rem', background: 'rgba(52,211,102,0.08)', border: '1px solid rgba(52,211,102,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#34D366' }}>{resetMsg}</div>}
          {resetError && <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{resetError}</div>}
          <button type="submit" disabled={resetting} style={{ alignSelf: 'flex-start', padding: '0.65rem 1.4rem', background: resetting ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', cursor: resetting ? 'not-allowed' : 'pointer' }}>
            {resetting ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

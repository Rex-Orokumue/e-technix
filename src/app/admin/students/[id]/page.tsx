'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Student {
  id: string;
  full_name: string;
  email: string;
  track: string;
  enrolled_at: string;
  is_active: boolean;
}

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<{ attendance: number; sessions: number; submitted: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetError, setResetError] = useState('');

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
    if (res.ok) { setResetMsg('Password updated successfully.'); setPassword(''); }
    else { const d = await res.json(); setResetError(d.error || 'Failed to reset password'); }
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
          <span style={{ background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '5px', padding: '0.2rem 0.6rem', fontSize: '0.78rem', color: 'var(--cyan)', fontWeight: 600 }}>{student.track}</span>
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
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '2rem', color: attPct >= 80 ? '#34D366' : attPct >= 50 ? '#F59E0B' : '#FF5555' }}>{attPct}%</div>
            <div style={{ ...labelStyle, marginBottom: 0, marginTop: '0.3rem' }}>Attendance</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{stats.attendance} / {stats.sessions} sessions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '2rem', color: 'var(--cyan)' }}>{stats.submitted}/{stats.total}</div>
            <div style={{ ...labelStyle, marginBottom: 0, marginTop: '0.3rem' }}>Assignments</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>submitted</div>
          </div>
        </div>
      )}

      {/* Password reset */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Reset Password</h2>
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              style={inputStyle}
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
              onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
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

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';

interface Student { id: string; full_name: string; email: string; track: string; }
interface Session { id: string; phase: number; week: number; session_number: number; title: string; date: string; }
interface AttendanceRow { student_id: string; session_id: string; }

export default function AttendanceReportPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [trackFilter, setTrackFilter] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/attendance-report');
    const d = await res.json();
    setStudents(d.students ?? []);
    setSessions(d.sessions ?? []);
    setAttendance(new Set((d.attendance ?? []).map((a: AttendanceRow) => `${a.student_id}:${a.session_id}`)));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const attended = (sid: string, sessId: string) => attendance.has(`${sid}:${sessId}`);

  const toggle = async (student_id: string, session_id: string) => {
    const key = `${student_id}:${session_id}`;
    if (toggling) return;
    setToggling(key);
    const isMarked = attendance.has(key);

    // Optimistic update
    setAttendance(prev => {
      const next = new Set(prev);
      isMarked ? next.delete(key) : next.add(key);
      return next;
    });

    const res = await fetch('/api/admin/attendance-report', {
      method: isMarked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, session_id }),
    });

    if (!res.ok) {
      // Revert on failure
      setAttendance(prev => {
        const next = new Set(prev);
        isMarked ? next.add(key) : next.delete(key);
        return next;
      });
    }
    setToggling(null);
  };

  const filteredStudents = trackFilter ? students.filter(s => s.track === trackFilter) : students;
  const tracks = Array.from(new Set(students.map(s => s.track))).sort();

  const pct = (sid: string) => {
    if (!sessions.length) return 0;
    const count = sessions.filter(sess => attended(sid, sess.id)).length;
    return Math.round((count / sessions.length) * 100);
  };

  const optStyle = { background: '#0f1829', color: '#e2e8f0' };

  const exportCSV = () => {
    const headers = ['Student', 'Track', 'Attendance %', ...sessions.map(s => `S${s.session_number} (${s.date})`)];
    const rows = filteredStudents.map(student => [
      student.full_name,
      student.track,
      `${pct(student.id)}%`,
      ...sessions.map(sess => attended(student.id, sess.id) ? '1' : '0'),
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading…</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Attendance Report</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{filteredStudents.length} students · {sessions.length} completed session{sessions.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={trackFilter}
            onChange={e => setTrackFilter(e.target.value)}
            style={{ padding: '0.55rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="" style={optStyle}>All Tracks</option>
            {tracks.map(t => <option key={t} value={t} style={optStyle}>{t}</option>)}
          </select>
          <button
            onClick={exportCSV}
            style={{ padding: '0.55rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-head)', fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginBottom: '1.5rem' }}>Click any cell to manually mark or unmark attendance.</p>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <p style={{ color: 'var(--muted)' }}>No completed sessions yet. Sessions appear here once a recording URL is added.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem', whiteSpace: 'nowrap', position: 'sticky', left: 0, background: 'var(--surface)', zIndex: 1 }}>Student</th>
                <th style={{ padding: '0.75rem 0.6rem', textAlign: 'center', fontWeight: 700, color: '#34D366', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>%</th>
                {sessions.map(sess => (
                  <th key={sess.id} style={{ padding: '0.6rem 0.4rem', textAlign: 'center', fontWeight: 600, color: 'var(--muted)', fontSize: '0.65rem', minWidth: '48px', whiteSpace: 'nowrap' }}
                    title={`${sess.title} — ${sess.date}`}>
                    <div>S{sess.session_number}</div>
                    <div style={{ fontSize: '0.58rem', opacity: 0.7 }}>W{sess.week}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, i) => (
                <tr key={student.id} style={{ borderBottom: i < filteredStudents.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', position: 'sticky', left: 0, background: i % 2 === 0 ? 'var(--bg)' : 'rgba(7,13,26,0.97)', zIndex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem' }}>{student.full_name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{student.track}</div>
                  </td>
                  <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem',
                      color: pct(student.id) >= 80 ? '#34D366' : pct(student.id) >= 50 ? '#F59E0B' : sessions.length === 0 ? 'var(--muted)' : '#FF5555',
                    }}>{pct(student.id)}%</span>
                  </td>
                  {sessions.map(sess => {
                    const key = `${student.id}:${sess.id}`;
                    const isMarked = attendance.has(key);
                    const isToggling = toggling === key;
                    return (
                      <td key={sess.id} style={{ padding: '0.4rem', textAlign: 'center' }}>
                        <button
                          onClick={() => toggle(student.id, sess.id)}
                          disabled={!!toggling}
                          title={isMarked ? 'Click to unmark attendance' : 'Click to mark attendance'}
                          style={{
                            width: '32px', height: '32px', borderRadius: '6px', cursor: toggling ? 'wait' : 'pointer',
                            border: isMarked ? '1px solid rgba(52,211,102,0.35)' : '1px solid var(--border)',
                            background: isMarked ? 'rgba(52,211,102,0.1)' : 'transparent',
                            color: isMarked ? '#34D366' : 'rgba(255,255,255,0.2)',
                            fontSize: isToggling ? '0.6rem' : '0.85rem',
                            transition: 'all 0.15s',
                          }}
                        >
                          {isToggling ? '…' : isMarked ? '✓' : '–'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

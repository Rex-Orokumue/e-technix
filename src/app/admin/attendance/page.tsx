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
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/attendance-report');
    const d = await res.json();
    setStudents(d.students ?? []);
    const sess: Session[] = d.sessions ?? [];
    setSessions(sess);
    setAttendance(new Set((d.attendance ?? []).map((a: AttendanceRow) => `${a.student_id}:${a.session_id}`)));
    setLoading(false);
    // Auto-open the most recent week
    if (sess.length > 0) {
      const maxWeek = Math.max(...sess.map(s => s.week));
      setOpenWeeks(new Set([maxWeek]));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (student_id: string, session_id: string) => {
    const key = `${student_id}:${session_id}`;
    if (toggling) return;
    setToggling(key);
    const isMarked = attendance.has(key);
    setAttendance(prev => { const n = new Set(prev); isMarked ? n.delete(key) : n.add(key); return n; });
    const res = await fetch('/api/admin/attendance-report', {
      method: isMarked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, session_id }),
    });
    if (!res.ok) setAttendance(prev => { const n = new Set(prev); isMarked ? n.add(key) : n.delete(key); return n; });
    setToggling(null);
  };

  const toggleWeek = (week: number) =>
    setOpenWeeks(prev => { const n = new Set(prev); n.has(week) ? n.delete(week) : n.add(week); return n; });

  const filteredStudents = trackFilter ? students.filter(s => s.track === trackFilter) : students;
  const tracks = Array.from(new Set(students.map(s => s.track))).sort();

  const pct = (sid: string, weekSessions: Session[]) => {
    if (!weekSessions.length) return null;
    const count = weekSessions.filter(sess => attendance.has(`${sid}:${sess.id}`)).length;
    return Math.round((count / weekSessions.length) * 100);
  };

  const overallPct = (sid: string) => {
    if (!sessions.length) return 0;
    return Math.round(sessions.filter(sess => attendance.has(`${sid}:${sess.id}`)).length / sessions.length * 100);
  };

  const exportCSV = () => {
    const headers = ['Student', 'Track', 'Overall %', ...sessions.map(s => `W${s.week} S${s.session_number} (${s.date})`)];
    const rows = filteredStudents.map(student => [
      student.full_name, student.track, `${overallPct(student.id)}%`,
      ...sessions.map(sess => attendance.has(`${student.id}:${sess.id}`) ? '1' : '0'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `attendance-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  // Group sessions by week
  const weeks = Array.from(new Set(sessions.map(s => s.week))).sort((a, b) => a - b);
  const byWeek = (w: number) => sessions.filter(s => s.week === w);

  const optStyle = { background: '#0f1829', color: '#e2e8f0' };

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading…</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Attendance</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{filteredStudents.length} students · {sessions.length} sessions · {weeks.length} weeks</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={trackFilter} onChange={e => setTrackFilter(e.target.value)}
            style={{ padding: '0.55rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', cursor: 'pointer' }}>
            <option value="" style={optStyle}>All Tracks</option>
            {tracks.map(t => <option key={t} value={t} style={optStyle}>{t}</option>)}
          </select>
          <button onClick={exportCSV}
            style={{ padding: '0.55rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-head)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            ↓ Export CSV
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <p style={{ color: 'var(--muted)' }}>No sessions yet. Sessions appear here once a recording URL is added.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {weeks.map(week => {
            const weekSessions = byWeek(week);
            const isOpen = openWeeks.has(week);
            // Count how many students attended at least one session this week
            const presentCount = filteredStudents.filter(s =>
              weekSessions.some(sess => attendance.has(`${s.id}:${sess.id}`))
            ).length;

            return (
              <div key={week} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Week header — always visible, click to expand */}
                <button
                  onClick={() => toggleWeek(week)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                      Week {week}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {weekSessions.length} session{weekSessions.length !== 1 ? 's' : ''}
                      {weekSessions[0]?.date ? ` · ${weekSessions[0].date}` : ''}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: presentCount > 0 ? '#34D366' : 'var(--muted)', background: presentCount > 0 ? 'rgba(52,211,102,0.08)' : 'transparent', border: `1px solid ${presentCount > 0 ? 'rgba(52,211,102,0.2)' : 'transparent'}`, borderRadius: '4px', padding: '0.1rem 0.4rem', whiteSpace: 'nowrap' }}>
                      {presentCount}/{filteredStudents.length} present
                    </span>
                  </div>
                  <span style={{ color: 'var(--muted)', fontSize: '0.9rem', flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>

                {/* Expanded attendance grid */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as any}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '480px' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>Student</th>
                            {weekSessions.map(sess => (
                              <th key={sess.id} style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 600, color: 'var(--muted)', fontSize: '0.68rem', whiteSpace: 'nowrap', minWidth: '80px' }}
                                title={`${sess.title} — ${sess.date}`}>
                                <div>S{sess.session_number}</div>
                                <div style={{ fontSize: '0.6rem', opacity: 0.6, fontWeight: 400 }}>{sess.date}</div>
                              </th>
                            ))}
                            <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#34D366', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Week %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student, i) => {
                            const weekPct = pct(student.id, weekSessions);
                            return (
                              <tr key={student.id} style={{ borderBottom: i < filteredStudents.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                                <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}>
                                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem' }}>{student.full_name}</div>
                                  <div style={{ fontSize: '0.66rem', color: 'var(--muted)' }}>{student.track}</div>
                                </td>
                                {weekSessions.map(sess => {
                                  const key = `${student.id}:${sess.id}`;
                                  const isMarked = attendance.has(key);
                                  const isToggling = toggling === key;
                                  return (
                                    <td key={sess.id} style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>
                                      <button
                                        onClick={() => toggle(student.id, sess.id)}
                                        disabled={!!toggling}
                                        title={isMarked ? 'Click to unmark' : 'Click to mark'}
                                        style={{
                                          width: '34px', height: '34px', borderRadius: '7px',
                                          cursor: toggling ? 'wait' : 'pointer',
                                          border: isMarked ? '1px solid rgba(52,211,102,0.35)' : '1px solid var(--border)',
                                          background: isMarked ? 'rgba(52,211,102,0.1)' : 'transparent',
                                          color: isMarked ? '#34D366' : 'rgba(255,255,255,0.2)',
                                          fontSize: isToggling ? '0.6rem' : '0.9rem',
                                          transition: 'all 0.15s',
                                        }}>
                                        {isToggling ? '…' : isMarked ? '✓' : '–'}
                                      </button>
                                    </td>
                                  );
                                })}
                                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                                  <span style={{
                                    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.78rem',
                                    color: weekPct == null ? 'var(--muted)' : weekPct >= 80 ? '#34D366' : weekPct >= 50 ? '#F59E0B' : '#FF5555',
                                  }}>{weekPct != null ? `${weekPct}%` : '—'}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/client';

type Tab = 'sessions' | 'resources' | 'assignments' | 'reviews';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  submitted:         { label: 'Submitted',         color: '#7A8FAD', bg: 'rgba(122,143,173,0.1)' },
  reviewing:         { label: 'Reviewing',         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  approved:          { label: 'Approved',          color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  needs_corrections: { label: 'Needs Corrections', color: '#FF6B2B', bg: 'rgba(255,107,43,0.1)' },
};

const RESOURCE_TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  document: { icon: '📄', color: '#00C8FF', bg: 'rgba(0,200,255,0.1)' },
  video:    { icon: '🎥', color: '#FF6B2B', bg: 'rgba(255,107,43,0.1)' },
  link:     { icon: '🔗', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
  notion:   { icon: '📝', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
};

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
const WHATSAPP_NUMBER = '2348120288390';

export default function HubPage() {
  const [tab, setTab] = useState<Tab>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<{ message: string } | null>(null);

  // Attendance state
  const [attendanceCodes, setAttendanceCodes] = useState<Record<string, string>>({});
  const [attendanceMarked, setAttendanceMarked] = useState<Record<string, boolean>>({});
  const [attendanceErrors, setAttendanceErrors] = useState<Record<string, string>>({});

  // Assignment submit
  const [aForm, setAForm] = useState({ assignment_id: '', drive_link: '', note: '' });
  const [aSubmitting, setASubmitting] = useState(false);
  const [aSuccess, setASuccess] = useState('');
  const [aError, setAError] = useState('');

  // Review form
  const [rForm, setRForm] = useState({ session_id: '', rating: 0, feedback: '' });
  const [rSubmitting, setRSubmitting] = useState(false);
  const [rSuccess, setRSuccess] = useState('');
  const [rError, setRError] = useState('');

  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    let studentData: any = null;
    if (user) {
      const { data: s } = await supabase.from('students').select('*').eq('id', user.id).single();
      studentData = s;
      setStudent(s);
    }
    const track = studentData?.track ? `?track=${encodeURIComponent(studentData.track)}` : '';
    const [s, r, a, sub, ann] = await Promise.all([
      fetch(`/api/sessions${track}`).then(r => r.json()),
      fetch(`/api/resources${track}`).then(r => r.json()),
      fetch(`/api/assignments${track}`).then(r => r.json()),
      fetch('/api/submissions').then(r => r.json()),
      fetch('/api/announcements').then(r => r.json()),
    ]);
    setSessions(Array.isArray(s) ? s : []);
    setResources(Array.isArray(r) ? r : []);
    setAssignments(Array.isArray(a) ? a : []);
    setSubmissions(Array.isArray(sub) ? sub : []);
    setAnnouncement(ann && ann.message ? ann : null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  // Folder open state: "p1" = Phase 1, "p1w2" = Phase 1 Week 2
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ p1: true, p2: true });
  const toggleFolder = (key: string) => setOpenFolders(prev => ({ ...prev, [key]: !prev[key] }));

  // Build phase → week → items tree
  const buildTree = <T extends { phase: number; week: number }>(items: T[]) => {
    const tree: Record<number, Record<number, T[]>> = {};
    for (const item of items) {
      if (!tree[item.phase]) tree[item.phase] = {};
      if (!tree[item.phase][item.week]) tree[item.phase][item.week] = [];
      tree[item.phase][item.week].push(item);
    }
    return tree;
  };

  // Group by phase + week (kept for sessions tab)
  const groupByPhaseWeek = <T extends { phase: number; week: number }>(items: T[]) => {
    const g: Record<string, T[]> = {};
    for (const item of items) {
      const key = `Phase ${item.phase} — Week ${item.week}`;
      if (!g[key]) g[key] = [];
      g[key].push(item);
    }
    return g;
  };

  const folderBtnStyle = (open: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '0.75rem 1rem', cursor: 'pointer',
    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem',
    color: 'var(--text)', textAlign: 'left',
  });
  const weekFolderStyle = (open: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    width: '100%', background: 'transparent', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '0.6rem 0.9rem', cursor: 'pointer',
    fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.8rem',
    color: 'var(--muted)', textAlign: 'left',
  });

  const upcomingSession = sessions.find(s => !s.youtube_url && s.meet_link);
  // Always evaluate against GMT+1 (WAT) regardless of student's device timezone
  const nowGMT1 = new Date(Date.now() + 60 * 60 * 1000);
  const todayGMT1 = nowGMT1.toISOString().slice(0, 10);
  const currentMinsGMT1 = nowGMT1.getUTCHours() * 60 + nowGMT1.getUTCMinutes();
  const SESSION_START_MINS = 19 * 60;        // 7:00 PM GMT+1
  const SESSION_END_MINS = 21 * 60;          // 9:00 PM GMT+1
  const SESSION_JOIN_MINS = 19 * 60 - 15;   // 6:45 PM GMT+1 — 15 mins before
  const isLiveToday = upcomingSession
    ? upcomingSession.date === todayGMT1 && currentMinsGMT1 >= SESSION_START_MINS && currentMinsGMT1 < SESSION_END_MINS
    : false;
  const canJoin = upcomingSession
    ? upcomingSession.date === todayGMT1 && currentMinsGMT1 >= SESSION_JOIN_MINS && currentMinsGMT1 < SESSION_END_MINS
    : false;

  const markAttendance = async (sessionId: string) => {
    const code = attendanceCodes[sessionId]?.trim();
    if (!code) return;
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, code }),
    });
    const data = await res.json();
    if (res.ok) {
      setAttendanceMarked(p => ({ ...p, [sessionId]: true }));
      setAttendanceErrors(p => ({ ...p, [sessionId]: '' }));
    } else {
      setAttendanceErrors(p => ({ ...p, [sessionId]: data.error }));
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setASubmitting(true);
    setAError('');
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aForm),
    });
    const data = await res.json();
    setASubmitting(false);
    if (res.ok) {
      setASuccess('Assignment submitted successfully!');
      setAForm({ assignment_id: '', drive_link: '', note: '' });
      // Also notify via WhatsApp
      const assignment = assignments.find(a => a.id === aForm.assignment_id);
      const msg = `📚 *Assignment Submission*\n\n*Student:* ${student?.full_name}\n*Track:* ${student?.track}\n*Assignment:* ${assignment?.assignment_code} — ${assignment?.title}\n*Link:* ${aForm.drive_link}${aForm.note ? `\n*Note:* ${aForm.note}` : ''}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      load();
    } else {
      setAError(data.error || 'Failed to submit');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setRSubmitting(true);
    setRError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rForm),
    });
    const data = await res.json();
    setRSubmitting(false);
    if (res.ok) {
      setRSuccess('Review submitted! Thank you.');
      setRForm({ session_id: '', rating: 0, feedback: '' });
    } else {
      setRError(data.error || 'Failed to submit review');
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
  };
  const labelStyle = {
    fontSize: '0.75rem', fontWeight: 600 as const, color: 'var(--muted)',
    letterSpacing: '0.05em', textTransform: 'uppercase' as const,
    marginBottom: '0.4rem', display: 'block',
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'sessions',    label: 'Past Sessions',  icon: '🎬' },
    { id: 'resources',   label: 'Resources',      icon: '📚' },
    { id: 'assignments', label: 'Assignments',    icon: '📝' },
    { id: 'reviews',     label: 'Leave a Review', icon: '⭐' },
  ];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px', minHeight: '100vh' }}>

        {/* Announcement banner */}
        {announcement && (
          <div style={{ background: 'rgba(255,107,43,0.08)', borderBottom: '1px solid rgba(255,107,43,0.25)', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>📢</span>
            <p style={{ fontSize: '0.88rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>{announcement.message}</p>
          </div>
        )}

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, rgba(0,200,255,0.06) 0%, rgba(255,107,43,0.04) 100%)', borderBottom: '1px solid var(--border)', padding: '4rem 2.5rem 3rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              <span style={{ width: '24px', height: '2px', background: 'var(--cyan)', borderRadius: '1px' }} />
              Student Hub
            </div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
              {student ? `Welcome back, ${student.full_name.split(' ')[0]}` : 'Your Learning'} <span style={{ color: 'var(--cyan)' }}>Dashboard</span>
            </h1>
            {student && <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 0 }}>Track: <strong style={{ color: 'var(--text)' }}>{student.track}</strong></p>}

            {/* Upcoming session */}
            {upcomingSession && (
              <div style={{ marginTop: '2rem', background: 'var(--surface)', border: '1px solid var(--cyan-border)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isLiveToday ? 'rgba(52,211,102,0.12)' : 'rgba(0,200,255,0.08)', border: `1px solid ${isLiveToday ? 'rgba(52,211,102,0.25)' : 'var(--cyan-border)'}`, borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: isLiveToday ? '#34D366' : 'var(--cyan)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLiveToday ? '#34D366' : 'var(--cyan)', display: 'inline-block' }} />
                      {isLiveToday ? 'Live Now' : 'Upcoming'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{upcomingSession.title}</div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--muted)' }}>{upcomingSession.date}{upcomingSession.description && ` · ${upcomingSession.description}`}</div>
                  </div>
                  {upcomingSession.meet_link && (
                    canJoin ? (
                      <a href={upcomingSession.meet_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--cyan)', color: '#070D1A', padding: '0.75rem 1.5rem', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', flexShrink: 0 }}>
                        🎥 Join Session
                      </a>
                    ) : (
                      <div title="Link opens 15 minutes before 7:00 PM" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,200,255,0.08)', color: 'var(--muted)', padding: '0.75rem 1.5rem', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0, cursor: 'not-allowed', border: '1px solid var(--border)' }}>
                        🔒 Join Session
                      </div>
                    )
                  )}
                </div>

                {/* Attendance for live session — only on the day of */}
                {isLiveToday && upcomingSession.attendance_code && (!upcomingSession.attendance_code_expires_at || new Date(upcomingSession.attendance_code_expires_at) > new Date()) && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', background: 'rgba(52,211,102,0.04)' }}>
                    {attendanceMarked[upcomingSession.id] ? (
                      <div style={{ fontSize: '0.82rem', color: '#34D366', fontWeight: 600 }}>✓ Attendance marked for this session</div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginRight: '0.25rem' }}>Mark your attendance:</span>
                        <input
                          style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', outline: 'none', maxWidth: '180px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                          placeholder="Enter code (ETX-...)"
                          value={attendanceCodes[upcomingSession.id] ?? ''}
                          onChange={e => setAttendanceCodes(p => ({ ...p, [upcomingSession.id]: e.target.value }))}
                          onFocus={e => (e.target.style.borderColor = 'rgba(52,211,102,0.4)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                        />
                        <button onClick={() => markAttendance(upcomingSession.id)} style={{ padding: '0.5rem 1rem', background: 'rgba(52,211,102,0.12)', border: '1px solid rgba(52,211,102,0.25)', borderRadius: '7px', color: '#34D366', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          Mark Attendance
                        </button>
                        {attendanceErrors[upcomingSession.id] && <span style={{ fontSize: '0.78rem', color: '#FF5555' }}>{attendanceErrors[upcomingSession.id]}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: '68px', zIndex: 50 }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2.5rem', display: 'flex', overflowX: 'auto' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '1rem 1.25rem', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--cyan)' : 'transparent'}`, color: tab === t.id ? 'var(--cyan)' : 'var(--muted)', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2.5rem 6rem' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Loading…</div>
          ) : (

            <>
              {/* SESSIONS */}
              {tab === 'sessions' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.4rem' }}>Past Sessions</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Watch replays and mark your attendance for each session.</p>

                  {sessions.filter(s => s.youtube_url).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎬</div>
                      <p style={{ color: 'var(--muted)' }}>No recorded sessions yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {Object.entries(buildTree(sessions.filter(s => s.youtube_url))).map(([phase, weeks]) => {
                        const phaseKey = `sp${phase}`;
                        const phaseOpen = openFolders[phaseKey] !== false;
                        return (
                          <div key={phase}>
                            <button style={folderBtnStyle(phaseOpen)} onClick={() => toggleFolder(phaseKey)}>
                              <span style={{ fontSize: '1rem' }}>{phaseOpen ? '📂' : '📁'}</span>
                              <span style={{ flex: 1 }}>Phase {phase}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{phaseOpen ? '▲' : '▼'}</span>
                            </button>
                            {phaseOpen && (
                              <div style={{ marginLeft: '1.25rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {Object.entries(weeks).map(([week, items]) => {
                                  const weekKey = `sp${phase}w${week}`;
                                  const weekOpen = openFolders[weekKey] !== false;
                                  return (
                                    <div key={week}>
                                      <button style={weekFolderStyle(weekOpen)} onClick={() => toggleFolder(weekKey)}>
                                        <span>{weekOpen ? '📂' : '📁'}</span>
                                        <span style={{ flex: 1 }}>Week {week}</span>
                                        <span style={{ fontSize: '0.7rem' }}>{(items as any[]).length} session{(items as any[]).length !== 1 ? 's' : ''} {weekOpen ? '▲' : '▼'}</span>
                                      </button>
                                      {weekOpen && (
                                        <div style={{ marginLeft: '1.25rem', marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                          {(items as any[]).map((session: any) => {
                                            const isMarked = attendanceMarked[session.id];
                                            const codeActive = session.attendance_code && (!session.attendance_code_expires_at || new Date(session.attendance_code_expires_at) > new Date());
                                            return (
                                              <div key={session.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                                                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                                  <div style={{ width: '44px', height: '44px', borderRadius: '9px', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--cyan)', flexShrink: 0 }}>
                                                    {String(session.session_number).padStart(2, '0')}
                                                  </div>
                                                  <div style={{ flex: 1 }}>
                                                    <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.92rem', marginBottom: '3px' }}>{session.title}</h3>
                                                    <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>{session.date}{session.duration && ` · ${session.duration}`}</div>
                                                    {session.topics?.length > 0 && (
                                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                                        {session.topics.map((t: string) => (
                                                          <span key={t} style={{ fontSize: '0.68rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.1rem 0.4rem', color: 'var(--muted)' }}>{t}</span>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
                                                    <a href={session.youtube_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FF0000', color: '#fff', padding: '0.5rem 0.9rem', borderRadius: '7px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none' }}>▶ Watch</a>
                                                    <button onClick={() => { setTab('reviews'); setRForm(f => ({ ...f, session_id: session.id })); }} style={{ padding: '0.5rem 0.9rem', borderRadius: '7px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>⭐ Review</button>
                                                  </div>
                                                </div>
                                                {codeActive && (
                                                  <div style={{ borderTop: '1px solid var(--border)', padding: '0.85rem 1.5rem', background: 'rgba(52,211,102,0.04)' }}>
                                                    {isMarked ? (
                                                      <div style={{ fontSize: '0.82rem', color: '#34D366', fontWeight: 600 }}>✓ Attendance marked</div>
                                                    ) : (
                                                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <input style={{ ...inputStyle, maxWidth: '180px', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                                                          placeholder="Enter code (ETX-...)"
                                                          value={attendanceCodes[session.id] ?? ''}
                                                          onChange={e => setAttendanceCodes(p => ({ ...p, [session.id]: e.target.value }))}
                                                          onFocus={e => (e.target.style.borderColor = 'rgba(52,211,102,0.4)')}
                                                          onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                                                        <button onClick={() => markAttendance(session.id)} style={{ padding: '0.5rem 1rem', background: 'rgba(52,211,102,0.12)', border: '1px solid rgba(52,211,102,0.25)', borderRadius: '7px', color: '#34D366', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                                                          Mark Attendance
                                                        </button>
                                                        {attendanceErrors[session.id] && <span style={{ fontSize: '0.78rem', color: '#FF5555' }}>{attendanceErrors[session.id]}</span>}
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* RESOURCES */}
              {tab === 'resources' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.4rem' }}>Resources</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>All documents, videos, and links for your track, organised by phase and week.</p>

                  {resources.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                      <p style={{ color: 'var(--muted)' }}>No resources yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {Object.entries(buildTree(resources)).map(([phase, weeks]) => {
                        const phaseKey = `p${phase}`;
                        const phaseOpen = openFolders[phaseKey] !== false;
                        return (
                          <div key={phase}>
                            <button style={folderBtnStyle(phaseOpen)} onClick={() => toggleFolder(phaseKey)}>
                              <span style={{ fontSize: '1rem' }}>{phaseOpen ? '📂' : '📁'}</span>
                              <span style={{ flex: 1 }}>Phase {phase}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{phaseOpen ? '▲' : '▼'}</span>
                            </button>
                            {phaseOpen && (
                              <div style={{ marginLeft: '1.25rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {Object.entries(weeks).map(([week, items]) => {
                                  const weekKey = `p${phase}w${week}`;
                                  const weekOpen = openFolders[weekKey] !== false;
                                  return (
                                    <div key={week}>
                                      <button style={weekFolderStyle(weekOpen)} onClick={() => toggleFolder(weekKey)}>
                                        <span>{weekOpen ? '📂' : '📁'}</span>
                                        <span style={{ flex: 1 }}>Week {week}</span>
                                        <span style={{ fontSize: '0.7rem' }}>{(items as any[]).length} item{(items as any[]).length !== 1 ? 's' : ''} {weekOpen ? '▲' : '▼'}</span>
                                      </button>
                                      {weekOpen && (
                                        <div style={{ marginLeft: '1.25rem', marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                          {(items as any[]).map((r: any) => {
                                            const meta = RESOURCE_TYPE_META[r.type] ?? RESOURCE_TYPE_META.link;
                                            return (
                                              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', textDecoration: 'none', transition: 'border-color 0.2s' }}
                                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
                                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                                                <div style={{ width: '34px', height: '34px', borderRadius: '7px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{meta.icon}</div>
                                                <div style={{ flex: 1 }}>
                                                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '2px' }}>{r.title}</div>
                                                  {r.description && <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{r.description}</div>}
                                                </div>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)', flexShrink: 0 }}>
                                                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                                                </svg>
                                              </a>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ASSIGNMENTS */}
              {tab === 'assignments' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.4rem' }}>Assignments</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Your track assignments, organised by phase and week.</p>

                  {/* Assignment folder tree */}
                  {assignments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                      {Object.entries(buildTree(assignments)).map(([phase, weeks]) => {
                        const phaseKey = `ap${phase}`;
                        const phaseOpen = openFolders[phaseKey] !== false;
                        return (
                          <div key={phase}>
                            <button style={folderBtnStyle(phaseOpen)} onClick={() => toggleFolder(phaseKey)}>
                              <span style={{ fontSize: '1rem' }}>{phaseOpen ? '📂' : '📁'}</span>
                              <span style={{ flex: 1 }}>Phase {phase}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{phaseOpen ? '▲' : '▼'}</span>
                            </button>
                            {phaseOpen && (
                              <div style={{ marginLeft: '1.25rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {Object.entries(weeks).map(([week, weekItems]) => {
                                  const weekKey = `ap${phase}w${week}`;
                                  const weekOpen = openFolders[weekKey] !== false;
                                  return (
                                    <div key={week}>
                                      <button style={weekFolderStyle(weekOpen)} onClick={() => toggleFolder(weekKey)}>
                                        <span>{weekOpen ? '📂' : '📁'}</span>
                                        <span style={{ flex: 1 }}>Week {week}</span>
                                        <span style={{ fontSize: '0.7rem' }}>{(weekItems as any[]).length} assignment{(weekItems as any[]).length !== 1 ? 's' : ''} {weekOpen ? '▲' : '▼'}</span>
                                      </button>
                                      {weekOpen && (
                                        <div style={{ marginLeft: '1.25rem', marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                          {(weekItems as any[]).map((a: any) => {
                                            const sub = submissions.find(s => s.assignment_id === a.id);
                                            const statusMeta = sub ? STATUS_META[sub.status] : null;
                                            return (
                                              <div key={a.id} style={{ background: 'var(--surface)', border: `1px solid ${a.status === 'active' ? 'var(--cyan-border)' : 'var(--border)'}`, borderRadius: '12px', padding: '1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.7rem', color: 'var(--cyan)', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '4px', padding: '0.15rem 0.5rem' }}>{a.assignment_code}</span>
                                                    <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{a.title}</h3>
                                                  </div>
                                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    {statusMeta && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: statusMeta.color, background: statusMeta.bg, border: `1px solid ${statusMeta.color}40`, borderRadius: '999px', padding: '0.2rem 0.7rem', textTransform: 'uppercase' }}>{statusMeta.label}</span>}
                                                    {a.due_date && <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Due: {a.due_date}</span>}
                                                  </div>
                                                </div>
                                                <p style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: a.guidelines?.length ? '0.6rem' : 0 }}>{a.description}</p>
                                                {a.guidelines?.length > 0 && (
                                                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                                    {a.guidelines.map((g: string) => <li key={g} style={{ fontSize: '0.77rem', color: 'var(--muted)', marginBottom: '3px' }}>{g}</li>)}
                                                  </ul>
                                                )}
                                                {sub?.admin_feedback && (
                                                  <div style={{ marginTop: '0.6rem', padding: '0.7rem', background: 'rgba(255,107,43,0.06)', border: '1px solid rgba(255,107,43,0.2)', borderRadius: '8px', fontSize: '0.81rem', color: 'var(--text)' }}>
                                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Instructor Feedback</span>
                                                    {sub.admin_feedback}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Submit form */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginTop: '1.5rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>Submit an Assignment</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Save your work to Google Drive, set sharing to &ldquo;Anyone with the link&rdquo;, then submit.</p>
                    {aSuccess ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📬</div>
                        <p style={{ color: '#34D366', fontWeight: 600 }}>{aSuccess}</p>
                        <button onClick={() => setASuccess('')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '0.5rem 1rem', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', marginTop: '1rem' }}>Submit another</button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div>
                          <label style={labelStyle}>Assignment *</label>
                          <select style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }} value={aForm.assignment_id} onChange={e => setAForm(f => ({ ...f, assignment_id: e.target.value }))} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')}>
                            <option value="" style={{ background: '#0f1829', color: '#94a3b8' }}>Select assignment</option>
                            {assignments.filter(a => a.status === 'active').map(a => (
                              <option key={a.id} value={a.id} style={{ background: '#0f1829', color: '#e2e8f0' }}>{a.assignment_code} — {a.title}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Google Drive Link *</label>
                          <input style={inputStyle} placeholder="https://drive.google.com/..." value={aForm.drive_link} onChange={e => setAForm(f => ({ ...f, drive_link: e.target.value }))} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                        </div>
                        <div>
                          <label style={labelStyle}>Note (optional)</label>
                          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', lineHeight: 1.6 }} placeholder="Anything you'd like to add…" value={aForm.note} onChange={e => setAForm(f => ({ ...f, note: e.target.value }))} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                        </div>
                        {aError && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{aError}</div>}
                        <button type="submit" disabled={aSubmitting} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem 2rem', background: aSubmitting ? 'rgba(37,211,102,0.2)' : '#25D366', color: '#fff', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', border: 'none', borderRadius: '9px', cursor: aSubmitting ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
                          {aSubmitting ? 'Submitting…' : '📤 Submit Assignment'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* REVIEWS */}
              {tab === 'reviews' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.4rem' }}>Leave a Review</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Your feedback helps improve every session.</p>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
                    {rSuccess ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
                        <p style={{ color: '#34D366', fontWeight: 600 }}>{rSuccess}</p>
                        <button onClick={() => setRSuccess('')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '0.5rem 1rem', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', marginTop: '1rem' }}>Review another session</button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                          <label style={labelStyle}>Session *</label>
                          <select style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }} value={rForm.session_id} onChange={e => setRForm(f => ({ ...f, session_id: e.target.value }))} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')}>
                            <option value="" style={{ background: '#0f1829', color: '#94a3b8' }}>Select a session</option>
                            {sessions.filter(s => s.youtube_url).map(s => (
                              <option key={s.id} value={s.id} style={{ background: '#0f1829', color: '#e2e8f0' }}>{s.title}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Rating *</label>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {[1,2,3,4,5].map(star => (
                              <button key={star} type="button" onClick={() => setRForm(f => ({ ...f, rating: star }))} style={{ background: 'transparent', border: 'none', fontSize: '2rem', cursor: 'pointer', opacity: rForm.rating >= star ? 1 : 0.25, transition: 'opacity 0.15s, transform 0.15s', transform: rForm.rating >= star ? 'scale(1.1)' : 'scale(1)', padding: 0 }}>⭐</button>
                            ))}
                            {rForm.rating > 0 && <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>{STAR_LABELS[rForm.rating]}</span>}
                          </div>
                        </div>
                        <div>
                          <label style={labelStyle}>Feedback *</label>
                          <textarea style={{ ...inputStyle, minHeight: '110px', resize: 'vertical', lineHeight: 1.6 }} placeholder="What did you learn? What could be improved? Was the pace right?" value={rForm.feedback} onChange={e => setRForm(f => ({ ...f, feedback: e.target.value }))} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                        </div>
                        {rError && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{rError}</div>}
                        <button type="submit" disabled={rSubmitting || !rForm.session_id || !rForm.rating || !rForm.feedback} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem 2rem', background: (rSubmitting || !rForm.session_id || !rForm.rating || !rForm.feedback) ? 'rgba(37,211,102,0.2)' : '#25D366', color: '#fff', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', border: 'none', borderRadius: '9px', cursor: (rSubmitting || !rForm.session_id || !rForm.rating || !rForm.feedback) ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
                          {rSubmitting ? 'Sending…' : '⭐ Submit Review'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

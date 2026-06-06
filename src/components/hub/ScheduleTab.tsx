'use client';

import { useMemo } from 'react';

interface Session {
  id: string;
  phase: number;
  week: number;
  session_number: number;
  title: string;
  date: string;
  start_time?: string;
  duration?: string;
  description?: string;
  topics?: string[];
  youtube_url?: string | null;
  meet_link?: string | null;
}

function parseTimeMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period} GMT+1`;
}

function getStatus(session: Session, todayGMT1: string, currentMinsGMT1: number, attended: boolean) {
  if (session.youtube_url) return attended ? 'attended' : 'past';
  if (session.date < todayGMT1) return attended ? 'attended' : 'missed';
  if (session.date === todayGMT1) {
    const startMins = parseTimeMins(session.start_time ?? '19:00');
    const endMins = startMins + 120;
    if (currentMinsGMT1 >= endMins) return attended ? 'attended' : 'missed';
    if (currentMinsGMT1 >= startMins) return 'live';
    return 'today';
  }
  return 'upcoming';
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  past:     { label: 'Recorded',  color: '#7A8FAD', bg: 'rgba(122,143,173,0.1)',  border: 'rgba(122,143,173,0.2)' },
  attended: { label: 'Attended',  color: '#34D366', bg: 'rgba(52,211,102,0.1)',   border: 'rgba(52,211,102,0.25)' },
  missed:   { label: 'Missed',    color: '#FF5555', bg: 'rgba(255,51,51,0.08)',   border: 'rgba(255,51,51,0.2)' },
  live:     { label: 'In Session',color: '#34D366', bg: 'rgba(52,211,102,0.12)', border: 'rgba(52,211,102,0.3)' },
  today:    { label: 'Today',     color: '#00C8FF', bg: 'rgba(0,200,255,0.08)',   border: 'rgba(0,200,255,0.25)' },
  upcoming: { label: 'Upcoming',  color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
};

export default function ScheduleTab({
  sessions,
  todayGMT1,
  currentMinsGMT1,
  attendedSessionIds = new Set(),
}: {
  sessions: Session[];
  todayGMT1: string;
  currentMinsGMT1: number;
  attendedSessionIds?: Set<string>;
}) {
  const sorted = useMemo(
    () => [...sessions].sort((a, b) => a.date.localeCompare(b.date) || a.session_number - b.session_number),
    [sessions]
  );

  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
        <p style={{ color: 'var(--muted)' }}>No sessions scheduled yet.</p>
      </div>
    );
  }

  // Group by month
  const byMonth: Record<string, Session[]> = {};
  for (const s of sorted) {
    const month = new Date(s.date + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(s);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {Object.entries(byMonth).map(([month, items]) => (
        <div key={month}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
            {month}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map(session => {
              const status = getStatus(session, todayGMT1, currentMinsGMT1, attendedSessionIds.has(session.id));
              const ss = STATUS_STYLE[status];
              const isPast = status === 'past' || status === 'missed'; // attended stays full opacity
              const dateObj = new Date(session.date + 'T12:00:00Z');
              const dayLabel = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

              return (
                <div key={session.id} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap',
                  padding: '0.9rem 1rem', borderRadius: '12px',
                  background: status === 'live' ? 'rgba(52,211,102,0.04)' : status === 'today' ? 'rgba(0,200,255,0.04)' : 'var(--surface)',
                  border: `1px solid ${status === 'live' || status === 'today' ? ss.border : 'var(--border)'}`,
                  opacity: isPast ? 0.7 : 1,
                }}>
                  {/* Date column */}
                  <div style={{ textAlign: 'center', minWidth: '52px', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1, color: isPast ? 'var(--muted)' : 'var(--text)' }}>
                      {dateObj.getUTCDate()}
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {dateObj.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ width: '1px', alignSelf: 'stretch', background: 'var(--border)', flexShrink: 0 }} />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '3px' }}>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem' }}>{session.title}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`, borderRadius: '999px', padding: '0.15rem 0.55rem', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>{ss.label}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: session.topics?.length ? '0.4rem' : 0 }}>
                      Phase {session.phase} · Week {session.week} · Session {session.session_number} · {formatTime(session.start_time ?? '19:00')}{session.duration ? ` · ${session.duration}` : ''}
                    </div>
                    {session.topics && session.topics.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {session.topics.map(t => (
                          <span key={t} style={{ fontSize: '0.65rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.1rem 0.4rem', color: 'var(--muted)' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div style={{ flexShrink: 0, marginLeft: 'auto' }}>
                    {status === 'past' && session.youtube_url && (
                      <a href={session.youtube_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#FF0000', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none' }}>▶ Watch</a>
                    )}
                    {(status === 'live' || status === 'today') && session.meet_link && (
                      <a href={status === 'live' ? session.meet_link : '#'} target="_blank" rel="noopener noreferrer" onClick={status === 'today' ? e => e.preventDefault() : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: status === 'live' ? '#34D366' : 'rgba(0,200,255,0.1)', color: status === 'live' ? '#070D1A' : 'var(--muted)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none', cursor: status === 'today' ? 'not-allowed' : 'pointer', border: status === 'today' ? '1px solid var(--border)' : 'none' }}>
                        🎥 {status === 'live' ? 'Join' : 'Soon'}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

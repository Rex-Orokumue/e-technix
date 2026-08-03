export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminSessionCard from '@/components/admin/AdminSessionCard';
import { TRACKS, TRACK_META } from '@/lib/tracks';

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track: selectedTrack } = await searchParams;

  const supabase = createAdminClient();
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .order('phase').order('week').order('session_number');

  const todayGMT1 = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
  const withTrack = sessions ?? [];
  const all = !selectedTrack
    ? withTrack
    : selectedTrack === 'general'
    ? withTrack.filter(s => !s.tracks || s.tracks.length === 0)
    : withTrack.filter(s => !s.tracks || s.tracks.length === 0 || s.tracks.includes(selectedTrack));
  const upcoming = all.filter(s => s.date >= todayGMT1).sort((a, b) => a.date.localeCompare(b.date));
  const past = all.filter(s => s.date < todayGMT1);

  // Past sessions keep the phase/week grouping
  const grouped: Record<string, typeof sessions> = {};
  for (const s of past) {
    const key = `Phase ${s.phase} — Week ${s.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(s);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Sessions</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
            {selectedTrack ? `${all.length} of ${withTrack.length}` : withTrack.length} sessions recorded
          </p>
        </div>
        <Link href="/admin/sessions/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.65rem 1.25rem', background: 'var(--cyan)', color: '#070D1A',
          borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700,
          fontSize: '0.85rem', textDecoration: 'none', transition: 'opacity 0.2s',
        }}>
          + Add Session
        </Link>
      </div>

      {/* Floating sticky button */}
      <Link href="/admin/sessions/new" style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50,
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.75rem 1.4rem', background: 'var(--cyan)', color: '#070D1A',
        borderRadius: '999px', fontFamily: 'var(--font-head)', fontWeight: 700,
        fontSize: '0.85rem', textDecoration: 'none',
        boxShadow: '0 4px 24px rgba(0,200,255,0.35)',
      }}>
        + Add Session
      </Link>

      {/* Track filter tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
        {[
          { key: undefined, label: 'All', icon: '📚' },
          { key: 'general', label: 'General', icon: '🌍' },
          ...TRACKS.map(t => ({ key: t, label: t, icon: TRACK_META[t]?.icon ?? '' })),
        ].map(tab => {
          const isActive = (selectedTrack ?? undefined) === tab.key;
          return (
            <Link
              key={tab.label}
              href={tab.key ? `/admin/sessions?track=${encodeURIComponent(tab.key)}` : '/admin/sessions'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.85rem', borderRadius: '999px', textDecoration: 'none',
                fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap',
                background: isActive ? 'var(--cyan-dim)' : 'var(--surface)',
                border: `1px solid ${isActive ? 'var(--cyan-border)' : 'var(--border)'}`,
                color: isActive ? 'var(--cyan)' : 'var(--muted)',
              }}
            >
              {tab.icon} {tab.label}
            </Link>
          );
        })}
      </div>

      {all.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎬</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {withTrack.length === 0 ? 'No sessions yet. Add your first session.' : 'No sessions for this track yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>📅 Upcoming</h2>
            {upcoming.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No upcoming sessions.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcoming.map(session => <AdminSessionCard key={session.id} session={session} />)}
              </div>
            )}
          </div>

          {/* Past */}
          {Object.keys(grouped).length > 0 && (
            <div>
              <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>🗂 Past Sessions</h2>
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', opacity: 0.7 }}>{group}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items?.map(session => <AdminSessionCard key={session.id} session={session} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

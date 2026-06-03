import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminSessionCard from '@/components/admin/AdminSessionCard';

export default async function AdminSessionsPage() {
  const supabase = createAdminClient();
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .order('phase').order('week').order('session_number');

  const grouped: Record<string, typeof sessions> = {};
  for (const s of sessions ?? []) {
    const key = `Phase ${s.phase} — Week ${s.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(s);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Sessions</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{sessions?.length ?? 0} sessions recorded</p>
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

      {Object.keys(grouped).length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎬</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No sessions yet. Add your first session.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, items]) => (
          <div key={group} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem',
            }}>{group}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items?.map(session => (
                <AdminSessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

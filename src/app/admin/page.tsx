import { createAdminClient } from '@/lib/supabase/admin';

async function getStats() {
  const supabase = createAdminClient();
  const [students, sessions, assignments, pending] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }),
    supabase.from('sessions').select('id', { count: 'exact', head: true }),
    supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('assignment_submissions').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
  ]);
  return {
    students: students.count ?? 0,
    sessions: sessions.count ?? 0,
    assignments: assignments.count ?? 0,
    pending: pending.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: 'Enrolled Students', value: stats.students, icon: '👥', color: 'var(--cyan)' },
    { label: 'Sessions Recorded', value: stats.sessions, icon: '🎬', color: 'var(--orange)' },
    { label: 'Active Assignments', value: stats.assignments, icon: '📝', color: '#A78BFA' },
    { label: 'Pending Reviews', value: stats.pending, icon: '📬', color: '#34D399', alert: stats.pending > 0 },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Welcome back. Here&apos;s what&apos;s happening with your programme.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: 'var(--surface)', border: `1px solid ${card.alert ? 'rgba(255,107,43,0.3)' : 'var(--border)'}`,
            borderRadius: '14px', padding: '1.5rem',
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>{card.icon}</div>
            <div style={{
              fontFamily: 'var(--font-head)', fontWeight: 800,
              fontSize: '2.2rem', color: card.alert ? 'var(--orange)' : card.color,
              lineHeight: 1, marginBottom: '0.4rem',
            }}>
              {card.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 }}>{card.label}</div>
            {card.alert && (
              <div style={{
                marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--orange)',
                fontWeight: 600,
              }}>
                Needs attention ↗
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '1.75rem',
      }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {[
            { href: '/admin/sessions/new', label: '+ Add Session', primary: true },
            { href: '/admin/resources/new', label: '+ Add Resource', primary: false },
            { href: '/admin/assignments/new', label: '+ Add Assignment', primary: false },
            { href: '/admin/students/new', label: '+ Enrol Student', primary: false },
            { href: '/admin/submissions', label: 'Review Submissions', primary: false },
          ].map(action => (
            <a key={action.href} href={action.href} style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '0.6rem 1.25rem', borderRadius: '8px',
              background: action.primary ? 'var(--cyan)' : 'transparent',
              color: action.primary ? '#070D1A' : 'var(--muted)',
              border: action.primary ? 'none' : '1px solid var(--border)',
              fontFamily: 'var(--font-head)', fontWeight: 700,
              fontSize: '0.83rem', textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!action.primary) {
                e.currentTarget.style.borderColor = 'var(--border-bright)';
                e.currentTarget.style.color = 'var(--text)';
              } else {
                e.currentTarget.style.opacity = '0.85';
              }
            }}
            onMouseLeave={e => {
              if (!action.primary) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--muted)';
              } else {
                e.currentTarget.style.opacity = '1';
              }
            }}>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminQuickActions from '@/components/admin/AdminQuickActions';

async function getStats() {
  const supabase = createAdminClient();
  const [students, sessions, assignments, pending, reviews] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }),
    supabase.from('sessions').select('id', { count: 'exact', head: true }),
    supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('assignment_submissions').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('session_reviews').select('id', { count: 'exact', head: true }),
  ]);
  return {
    students: students.count ?? 0,
    sessions: sessions.count ?? 0,
    assignments: assignments.count ?? 0,
    pending: pending.count ?? 0,
    reviews: reviews.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards: { label: string; value: number; icon: string; color: string; alert?: boolean; href: string; sub?: string }[] = [
    { label: 'Enrolled Students',      value: stats.students,   icon: '👥', color: 'var(--cyan)',    href: '/admin/students' },
    { label: 'Sessions Recorded',      value: stats.sessions,   icon: '🎬', color: 'var(--orange)',  href: '/admin/sessions' },
    { label: 'Active Assignments',      value: stats.assignments, icon: '📝', color: '#A78BFA',       href: '/admin/assignments' },
    { label: 'Pending Submissions',     value: stats.pending,    icon: '📬', color: '#34D399', alert: stats.pending > 0, href: '/admin/submissions', sub: stats.pending > 0 ? 'Needs review — click to open' : undefined },
    { label: 'Session Reviews',         value: stats.reviews,    icon: '⭐', color: '#F59E0B',       href: '/admin/reviews', sub: stats.reviews > 0 ? 'View all feedback' : undefined },
    { label: 'Phase 1 Grading',         value: stats.students,   icon: '📊', color: '#A78BFA',       href: '/admin/grades',   sub: 'Grade attendance, assignments & capstone' },
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

      <style>{`.dash-card:hover { border-color: var(--border-bright) !important; } .dash-card-alert:hover { border-color: rgba(255,107,43,0.6) !important; }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {cards.map(card => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--surface)',
              border: `1px solid ${card.alert ? 'rgba(255,107,43,0.35)' : 'var(--border)'}`,
              borderRadius: '14px', padding: '1.5rem', cursor: 'pointer', transition: 'border-color 0.2s',
            }} className={card.alert ? 'dash-card-alert' : 'dash-card'}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>{card.icon}</div>
              <div style={{
                fontFamily: 'var(--font-head)', fontWeight: 800,
                fontSize: '2.2rem', color: card.alert ? 'var(--orange)' : card.color,
                lineHeight: 1, marginBottom: '0.4rem',
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 }}>{card.label}</div>
              {card.sub && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: card.alert ? 'var(--orange)' : 'var(--muted)', fontWeight: 600 }}>
                  {card.sub} ↗
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>
          Quick Actions
        </h2>
        <AdminQuickActions />
      </div>
    </div>
  );
}

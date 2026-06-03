import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';

const navItems = [
  { href: '/admin',             label: 'Dashboard',   icon: '📊' },
  { href: '/admin/sessions',    label: 'Sessions',    icon: '🎬' },
  { href: '/admin/resources',   label: 'Resources',   icon: '📚' },
  { href: '/admin/assignments', label: 'Assignments', icon: '📝' },
  { href: '/admin/submissions', label: 'Submissions', icon: '📬' },
  { href: '/admin/students',    label: 'Students',    icon: '👥' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect('/admin/login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      }} className="admin-sidebar">
        {/* Logo */}
        <div style={{
          padding: '1.5rem 1.5rem 1rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            fontFamily: 'var(--font-head)', fontSize: '1.2rem',
            fontWeight: 800, letterSpacing: '-0.02em',
          }}>
            <span style={{ color: 'var(--cyan)' }}>e-</span>technix
            <span style={{
              width: '6px', height: '6px', background: 'var(--orange)',
              borderRadius: '50%', display: 'inline-block',
              marginBottom: '3px', marginLeft: '2px',
            }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Admin Dashboard
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.6rem 0.75rem', borderRadius: '8px',
              color: 'var(--muted)', textDecoration: 'none',
              fontSize: '0.875rem', fontWeight: 500,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface2)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--muted)';
            }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border)' }}>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: '220px', padding: '2.5rem', minHeight: '100vh' }} className="admin-main">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { width: 100% !important; height: auto !important; position: static !important; flex-direction: row !important; }
          .admin-main { margin-left: 0 !important; padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}

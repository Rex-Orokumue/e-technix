import AdminNav from '@/components/admin/AdminNav';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar — desktop */}
      <aside style={{
        width: '220px', flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      }} className="admin-sidebar">

        {/* Logo */}
        <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--cyan)' }}>e-</span>technix
            <span style={{ width: '6px', height: '6px', background: 'var(--orange)', borderRadius: '50%', display: 'inline-block', marginBottom: '3px', marginLeft: '2px' }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Admin Dashboard
          </div>
        </div>

        <AdminNav />

        {/* Bottom actions */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.55rem 0.75rem', borderRadius: '8px',
            color: 'var(--muted)', textDecoration: 'none',
            fontSize: '0.82rem', fontWeight: 500,
            border: '1px solid var(--border)',
          }}>
            <span>🌐</span> View Website
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="admin-topbar" style={{ display: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--cyan)' }}>e-</span>technix
            <span style={{ width: '6px', height: '6px', background: 'var(--orange)', borderRadius: '50%', display: 'inline-block', marginBottom: '3px', marginLeft: '2px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/" style={{ fontSize: '0.75rem', color: 'var(--muted)', textDecoration: 'none', padding: '0.4rem 0.75rem', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 600 }}>
              🌐 Site
            </Link>
            <AdminLogoutButton compact />
          </div>
        </div>
        {/* Mobile nav — horizontal scroll */}
        <div style={{ overflowX: 'auto', background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 0.5rem' }}>
          <AdminNav mobile />
        </div>
      </div>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: '220px', padding: '2.5rem', minHeight: '100vh' }} className="admin-main">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
          .admin-topbar { display: block !important; width: 100%; position: sticky; top: 0; z-index: 50; }
          .admin-main { margin-left: 0 !important; padding: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
}

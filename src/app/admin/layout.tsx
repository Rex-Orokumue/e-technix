import AdminNav from '@/components/admin/AdminNav';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

        <AdminNav />

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

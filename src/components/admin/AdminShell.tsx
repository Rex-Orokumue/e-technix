'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin',               label: 'Dashboard',     icon: '📊' },
  { href: '/admin/sessions',      label: 'Sessions',      icon: '🎬' },
  { href: '/admin/resources',     label: 'Resources',     icon: '📚' },
  { href: '/admin/assignments',   label: 'Assignments',   icon: '📝' },
  { href: '/admin/submissions',   label: 'Submissions',   icon: '📬' },
  { href: '/admin/quizzes',       label: 'Quizzes',       icon: '🧠' },
  { href: '/admin/reviews',       label: 'Reviews',       icon: '⭐' },
  { href: '/admin/students',      label: 'Students',      icon: '👥' },
  { href: '/admin/attendance',    label: 'Attendance',    icon: '✅' },
  { href: '/admin/announcements', label: 'Announcements', icon: '📢' },
  { href: '/admin/chat',          label: 'Chat',          icon: '💬' },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {navItems.map(item => {
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.65rem 0.85rem', borderRadius: '8px',
            color: active ? 'var(--cyan)' : 'var(--muted)',
            background: active ? 'var(--cyan-dim)' : 'transparent',
            border: active ? '1px solid var(--cyan-border)' : '1px solid transparent',
            textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
            transition: 'background 0.15s, color 0.15s',
          }}>
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/';
  };
  return (
    <button onClick={handleLogout} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem',
      padding: '0.65rem 0.85rem', borderRadius: '8px',
      background: 'transparent', border: 'none',
      color: 'var(--muted)', cursor: 'pointer',
      fontSize: '0.9rem', fontWeight: 600,
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,43,0.08)'; e.currentTarget.style.color = 'var(--orange)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}>
      <span>🚪</span> Logout
    </button>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Close sidebar on route change
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span style={{ color: 'var(--cyan)' }}>e-</span>technix
          <span style={{ width: '6px', height: '6px', background: 'var(--orange)', borderRadius: '50%', display: 'inline-block', marginBottom: '3px', marginLeft: '2px' }} />
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '3px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Admin Dashboard
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        <NavLinks onNavigate={onNavigate} />
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <Link href="/" onClick={onNavigate} style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.65rem 0.85rem', borderRadius: '8px',
          color: 'var(--muted)', textDecoration: 'none',
          fontSize: '0.9rem', fontWeight: 600, border: '1px solid var(--border)',
        }}>
          <span>🌐</span> View Website
        </Link>
        <LogoutButton />
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Desktop sidebar ── */}
      <aside style={{
        width: '230px', flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      }} className="admin-sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="admin-topbar-mobile" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1.25rem', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span style={{ color: 'var(--cyan)' }}>e-</span>technix
          <span style={{ width: '6px', height: '6px', background: 'var(--orange)', borderRadius: '50%', display: 'inline-block', marginBottom: '3px', marginLeft: '2px' }} />
        </div>
        <button onClick={() => setOpen(o => !o)} style={{
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all 0.25s', transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
          <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all 0.25s', opacity: open ? 0 : 1 }} />
          <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all 0.25s', transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </div>

      {/* ── Mobile slide-in sidebar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 70,
        width: '270px',
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }} className="admin-sidebar-mobile">
        {/* Close button inside sidebar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 0.75rem 0' }}>
          <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>✕</button>
        </div>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </div>

      {/* ── Backdrop ── */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 65,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
        }} className="admin-backdrop" />
      )}

      {/* ── Main content ── */}
      <main style={{ flex: 1, marginLeft: '230px', padding: '2.5rem', minHeight: '100vh' }} className="admin-main">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-topbar-mobile { display: flex !important; }
          .admin-sidebar-mobile { display: flex !important; }
          .admin-main { margin-left: 0 !important; padding: 1.25rem !important; padding-top: 5rem !important; }
        }
      `}</style>
    </div>
  );
}

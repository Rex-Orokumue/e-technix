'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Tab = 'sessions' | 'schedule' | 'resources' | 'assignments' | 'reviews' | 'chat' | 'profile';

const navItems: { id: Tab; label: string; icon: string }[] = [
  { id: 'schedule',    label: 'Schedule',       icon: '📅' },
  { id: 'sessions',    label: 'Past Sessions',  icon: '🎬' },
  { id: 'resources',   label: 'Resources',      icon: '📚' },
  { id: 'assignments', label: 'Assignments',    icon: '📝' },
  { id: 'reviews',     label: 'Leave a Review', icon: '⭐' },
  { id: 'chat',        label: 'Chat',           icon: '💬' },
  { id: 'profile',     label: 'My Profile',     icon: '👤' },
];

interface Props {
  tab: Tab;
  setTab: (t: Tab) => void;
  student: { full_name: string; track: string } | null;
  children: React.ReactNode;
}

function NavItems({ tab, setTab, onNavigate }: { tab: Tab; setTab: (t: Tab) => void; onNavigate?: () => void }) {
  return (
    <>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => { setTab(item.id); onNavigate?.(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
            background: tab === item.id ? 'var(--cyan-dim)' : 'transparent',
            border: tab === item.id ? '1px solid var(--cyan-border)' : '1px solid transparent',
            color: tab === item.id ? 'var(--cyan)' : 'var(--muted)',
            fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600,
            cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, color 0.15s',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </>
  );
}

function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem',
        padding: '0.65rem 0.85rem', borderRadius: '8px',
        background: 'transparent', border: 'none',
        color: 'var(--muted)', cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,43,0.08)'; e.currentTarget.style.color = 'var(--orange)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
    >
      <span>🚪</span> Sign Out
    </button>
  );
}

export default function HubShell({ tab, setTab, student, children }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [tab]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            <span style={{ color: 'var(--cyan)' }}>e-</span>technix
            <span style={{ width: '6px', height: '6px', background: 'var(--orange)', borderRadius: '50%', display: 'inline-block', marginBottom: '3px', marginLeft: '2px' }} />
          </div>
        </Link>
        {student && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {student.full_name}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {student.track}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        <NavItems tab={tab} setTab={setTab} onNavigate={onNavigate} />
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <Link href="/" onClick={onNavigate} style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.65rem 0.85rem', borderRadius: '8px',
          color: 'var(--muted)', textDecoration: 'none',
          fontSize: '0.88rem', fontWeight: 600, border: '1px solid var(--border)',
        }}>
          <span>🌐</span> Homepage
        </Link>
        <SignOutButton />
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Desktop sidebar */}
      <aside style={{
        width: '230px', flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      }} className="hub-sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="hub-topbar-mobile" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1.25rem', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span style={{ color: 'var(--cyan)' }}>e-</span>technix
          <span style={{ width: '6px', height: '6px', background: 'var(--orange)', borderRadius: '50%', display: 'inline-block', marginBottom: '3px', marginLeft: '2px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {student && <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{student.full_name.split(' ')[0]}</span>}
          <button
            onClick={() => setOpen(o => !o)}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all 0.25s', transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all 0.25s', opacity: open ? 0 : 1 }} />
            <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all 0.25s', transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile slide-in sidebar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 70,
        width: '270px',
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }} className="hub-sidebar-mobile">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 0.75rem 0' }}>
          <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>✕</button>
        </div>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </div>

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 65, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} />
      )}

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: '230px', minHeight: '100vh' }} className="hub-main">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .hub-sidebar-desktop { display: none !important; }
          .hub-topbar-mobile { display: flex !important; }
          .hub-sidebar-mobile { display: flex !important; }
          .hub-main { margin-left: 0 !important; padding-top: 56px; }
        }
      `}</style>
    </div>
  );
}

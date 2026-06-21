'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3, Calendar, Clapperboard, BookOpen, PencilLine,
  Brain, Star, MessageSquare, User, Globe, LogOut, Menu, X,
  type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Tab = 'sessions' | 'schedule' | 'resources' | 'assignments' | 'quizzes' | 'reviews' | 'chat' | 'profile' | 'progress';

const navItems: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'progress',    label: 'My Progress',    Icon: BarChart3 },
  { id: 'schedule',    label: 'Schedule',       Icon: Calendar },
  { id: 'sessions',    label: 'Past Sessions',  Icon: Clapperboard },
  { id: 'resources',   label: 'Resources',      Icon: BookOpen },
  { id: 'assignments', label: 'Assignments',    Icon: PencilLine },
  { id: 'quizzes',     label: 'Quizzes',        Icon: Brain },
  { id: 'reviews',     label: 'Leave a Review', Icon: Star },
  { id: 'chat',        label: 'Chat',           Icon: MessageSquare },
  { id: 'profile',     label: 'My Profile',     Icon: User },
];

interface Props {
  tab: Tab;
  setTab: (t: Tab) => void;
  student: { full_name: string; track: string } | null;
  children: React.ReactNode;
}

export type { Tab };

function Wordmark({ size = '1.2rem' }: { size?: string }) {
  return (
    <div style={{ fontFamily: 'var(--font-head)', fontSize: size, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ color: 'var(--cyan)' }}>e-</span>technix
      <span style={{ width: '6px', height: '6px', background: 'var(--orange)', borderRadius: '50%', display: 'inline-block', marginBottom: '3px', marginLeft: '2px' }} />
    </div>
  );
}

function NavItems({ tab, setTab, onNavigate }: { tab: Tab; setTab: (t: Tab) => void; onNavigate?: () => void }) {
  return (
    <>
      {navItems.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            onClick={() => { setTab(id); onNavigate?.(); }}
            className="hub-nav-item"
            data-active={active}
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px',
              background: active ? 'var(--cyan-dim)' : 'transparent',
              color: active ? 'var(--cyan)' : 'var(--muted)',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: active ? 700 : 500,
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {active && <span style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: '2px', background: 'var(--cyan)', borderRadius: '2px' }} />}
            <Icon size={17} strokeWidth={active ? 2.4 : 2} />
            {label}
          </button>
        );
      })}
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
      className="hub-signout"
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.6rem 0.85rem', borderRadius: '8px',
        background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 500,
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      <LogOut size={17} strokeWidth={2} /> Sign Out
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
      {/* Brand + student */}
      <div style={{ padding: '1.5rem 1.25rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Wordmark /></Link>
        {student && (
          <div style={{ marginTop: '1.25rem', padding: '0.85rem', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="eyebrow" style={{ fontSize: '0.6rem', marginBottom: '0.4rem' }}>Enrolled</div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {student.full_name}
            </div>
            <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--cyan)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {student.track}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.85rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        <div className="eyebrow" style={{ fontSize: '0.6rem', padding: '0 0.85rem', marginBottom: '0.6rem' }}>Workspace</div>
        <NavItems tab={tab} setTab={setTab} onNavigate={onNavigate} />
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <Link href="/" onClick={onNavigate} className="hub-nav-item" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.6rem 0.85rem', borderRadius: '8px',
          color: 'var(--muted)', textDecoration: 'none',
          fontSize: '0.88rem', fontWeight: 500, fontFamily: 'var(--font-body)',
        }}>
          <Globe size={17} strokeWidth={2} /> Homepage
        </Link>
        <SignOutButton />
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Desktop sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0,
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
        <Wordmark size="1.1rem" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {student && <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{student.full_name.split(' ')[0]}</span>}
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
            style={{ background: 'transparent', border: '1px solid var(--border-bright)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: 'var(--text)', display: 'flex' }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-in sidebar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 70,
        width: '280px',
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }} className="hub-sidebar-mobile">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </div>

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 65, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} />
      )}

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: '240px', minHeight: '100vh' }} className="hub-main">
        {children}
      </main>

      <style>{`
        .hub-nav-item:hover { background: var(--border) !important; color: var(--text) !important; }
        .hub-nav-item[data-active="true"]:hover { background: var(--cyan-dim) !important; color: var(--cyan) !important; }
        .hub-signout:hover { background: rgba(255,107,43,0.08) !important; color: var(--orange) !important; }
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

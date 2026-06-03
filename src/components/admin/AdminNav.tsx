'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin',             label: 'Dashboard',   icon: '📊' },
  { href: '/admin/sessions',    label: 'Sessions',    icon: '🎬' },
  { href: '/admin/resources',   label: 'Resources',   icon: '📚' },
  { href: '/admin/assignments', label: 'Assignments', icon: '📝' },
  { href: '/admin/submissions', label: 'Submissions', icon: '📬' },
  { href: '/admin/students',    label: 'Students',    icon: '👥' },
];

export default function AdminNav({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem 0', whiteSpace: 'nowrap' }}>
        {navItems.map(item => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.45rem 0.85rem', borderRadius: '7px',
              color: active ? 'var(--cyan)' : 'var(--muted)',
              background: active ? 'var(--cyan-dim)' : 'transparent',
              border: active ? '1px solid var(--cyan-border)' : '1px solid transparent',
              textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600,
              flexShrink: 0,
            }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {navItems.map(item => {
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.6rem 0.75rem', borderRadius: '8px',
            color: active ? 'var(--cyan)' : 'var(--muted)',
            background: active ? 'var(--cyan-dim)' : 'transparent',
            textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            if (!active) {
              e.currentTarget.style.background = 'var(--surface2)';
              e.currentTarget.style.color = 'var(--text)';
            }
          }}
          onMouseLeave={e => {
            if (!active) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--muted)';
            }
          }}>
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

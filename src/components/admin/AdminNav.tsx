'use client';

import Link from 'next/link';

const navItems = [
  { href: '/admin',             label: 'Dashboard',   icon: '📊' },
  { href: '/admin/sessions',    label: 'Sessions',    icon: '🎬' },
  { href: '/admin/resources',   label: 'Resources',   icon: '📚' },
  { href: '/admin/assignments', label: 'Assignments', icon: '📝' },
  { href: '/admin/submissions', label: 'Submissions', icon: '📬' },
  { href: '/admin/students',    label: 'Students',    icon: '👥' },
];

export default function AdminNav() {
  return (
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
  );
}

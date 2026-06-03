'use client';

import { useRouter } from 'next/navigation';

export default function AdminLogoutButton({ compact }: { compact?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  if (compact) {
    return (
      <button onClick={handleLogout} style={{
        fontSize: '0.75rem', color: 'var(--muted)', background: 'transparent',
        border: '1px solid var(--border)', borderRadius: '6px',
        padding: '0.4rem 0.75rem', cursor: 'pointer', fontWeight: 600,
      }}>
        🚪 Logout
      </button>
    );
  }

  return (
    <button onClick={handleLogout} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem',
      padding: '0.6rem 0.75rem', borderRadius: '8px',
      background: 'transparent', border: 'none',
      color: 'var(--muted)', cursor: 'pointer',
      fontSize: '0.875rem', fontWeight: 500,
      transition: 'background 0.15s, color 0.15s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(255,107,43,0.08)';
      e.currentTarget.style.color = 'var(--orange)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--muted)';
    }}>
      <span style={{ fontSize: '1rem' }}>🚪</span> Logout
    </button>
  );
}

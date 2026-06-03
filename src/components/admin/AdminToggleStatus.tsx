'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminToggleStatus({ id, currentStatus, endpoint }: { id: string; currentStatus: string; endpoint: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isActive = currentStatus === 'active';

  const toggle = async () => {
    setLoading(true);
    await fetch(`${endpoint}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: isActive ? 'closed' : 'active' }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button onClick={toggle} disabled={loading} style={{
      padding: '0.35rem 0.85rem', borderRadius: '999px', cursor: loading ? 'not-allowed' : 'pointer',
      background: isActive ? 'rgba(52,211,102,0.1)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${isActive ? 'rgba(52,211,102,0.3)' : 'var(--border)'}`,
      color: isActive ? '#34D366' : 'var(--muted)',
      fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.72rem',
      letterSpacing: '0.04em', flexShrink: 0,
    }}>
      {loading ? '…' : isActive ? '● Open' : '○ Closed'}
    </button>
  );
}

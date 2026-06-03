'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDeleteButton({ endpoint, label = 'Delete' }: { endpoint: string; label?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    setLoading(true);
    await fetch(endpoint, { method: 'DELETE' });
    setLoading(false);
    router.refresh();
  };

  return (
    <button onClick={handleDelete} disabled={loading} style={{
      padding: '0.35rem 0.75rem', borderRadius: '5px',
      background: 'transparent', border: '1px solid var(--border)',
      color: 'var(--muted)', cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.73rem',
      flexShrink: 0,
    }}>
      {loading ? '…' : label}
    </button>
  );
}

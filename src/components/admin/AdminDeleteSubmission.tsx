'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDeleteSubmission({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' });
    setDeleting(false);
    router.refresh();
  };

  if (confirm) {
    return (
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ padding: '0.25rem 0.6rem', background: 'rgba(255,51,51,0.12)', border: '1px solid rgba(255,51,51,0.35)', borderRadius: '5px', color: '#FF5555', fontSize: '0.7rem', fontFamily: 'var(--font-head)', fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer' }}
        >
          {deleting ? '…' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          style={{ padding: '0.25rem 0.6rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--muted)', fontSize: '0.7rem', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      style={{ padding: '0.25rem 0.6rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--muted)', fontSize: '0.7rem', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
    >
      Delete
    </button>
  );
}

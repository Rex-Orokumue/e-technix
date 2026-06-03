'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const OPTIONS = [
  { value: 'submitted',         label: 'Submitted' },
  { value: 'reviewing',         label: 'Reviewing' },
  { value: 'approved',          label: 'Approved' },
  { value: 'needs_corrections', label: 'Needs Corrections' },
];

export default function AdminSubmissionStatusSelect({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleChange = async (newStatus: string) => {
    setStatus(newStatus);
    setSaving(true);
    await fetch(`/api/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setSaving(false);
    router.refresh();
  };

  return (
    <select
      value={status}
      onChange={e => handleChange(e.target.value)}
      disabled={saving}
      style={{
        padding: '0.35rem 0.6rem', background: 'var(--surface2)',
        border: '1px solid var(--border)', borderRadius: '6px',
        color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.78rem',
        cursor: 'pointer', outline: 'none',
      }}
    >
      {OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

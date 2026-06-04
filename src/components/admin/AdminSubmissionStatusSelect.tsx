'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const OPTIONS = [
  { value: 'submitted',         label: 'Submitted' },
  { value: 'reviewing',         label: 'Reviewing' },
  { value: 'approved',          label: 'Approved' },
  { value: 'needs_corrections', label: 'Needs Corrections' },
];

export default function AdminSubmissionStatusSelect({
  id,
  currentStatus,
  currentFeedback,
}: {
  id: string;
  currentStatus: string;
  currentFeedback?: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [feedback, setFeedback] = useState(currentFeedback ?? '');
  const [showFeedback, setShowFeedback] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const save = async (overrideStatus?: string) => {
    setSaving(true);
    await fetch(`/api/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: overrideStatus ?? status, admin_feedback: feedback || null }),
    });
    setSaving(false);
    setShowFeedback(false);
    router.refresh();
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    // Auto-save status change immediately; feedback is saved separately
    setSaving(true);
    fetch(`/api/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, admin_feedback: feedback || null }),
    }).then(() => { setSaving(false); router.refresh(); });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
      <select
        value={status}
        onChange={e => handleStatusChange(e.target.value)}
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

      <button
        onClick={() => setShowFeedback(v => !v)}
        style={{
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: '5px', color: 'var(--muted)', fontSize: '0.7rem',
          padding: '0.2rem 0.55rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
        }}
      >
        {showFeedback ? 'Hide remarks' : (feedback ? '✏️ Edit remarks' : '+ Add remarks')}
      </button>

      {showFeedback && (
        <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Remarks for the student…"
            rows={3}
            style={{
              width: '100%', padding: '0.5rem 0.65rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              borderRadius: '6px', color: 'var(--text)', fontFamily: 'var(--font-body)',
              fontSize: '0.78rem', resize: 'vertical', outline: 'none', lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => save()}
            disabled={saving}
            style={{
              padding: '0.35rem 0.75rem', background: 'var(--cyan)', color: '#070D1A',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem',
              border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-end',
            }}
          >
            {saving ? 'Saving…' : 'Save Remarks'}
          </button>
        </div>
      )}
    </div>
  );
}

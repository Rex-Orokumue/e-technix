'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const OPTIONS = [
  { value: 'submitted',         label: 'Submitted' },
  { value: 'reviewing',         label: 'Reviewing' },
  { value: 'approved',          label: 'Approved' },
  { value: 'needs_corrections', label: 'Needs Corrections' },
];

// Presets shown based on current status
const PRESETS: Record<string, string[]> = {
  approved: [
    'Great work! Keep it up. 🎉',
    'Well done — clean and solid submission.',
    'Excellent! All requirements met.',
    'Good job, you\'re on the right track.',
    'Outstanding work this week!',
  ],
  needs_corrections: [
    'Good effort, but a few things need fixing.',
    'Please review the requirements and resubmit.',
    'The shared link isn\'t working — check permissions and resubmit.',
    'Missing some key requirements. Check the guidelines.',
    'Almost there! Make the corrections and resubmit.',
    'Wrong file submitted — please upload the correct one.',
  ],
  reviewing: [
    'Submission received, currently reviewing.',
    'Got it — will review shortly.',
  ],
  submitted: [
    'Submission received ✅',
    'Late submission noted.',
  ],
};

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

  const save = async (overrideFeedback?: string, overrideStatus?: string) => {
    setSaving(true);
    await fetch(`/api/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: overrideStatus ?? status,
        admin_feedback: (overrideFeedback !== undefined ? overrideFeedback : feedback) || null,
      }),
    });
    setSaving(false);
    setShowFeedback(false);
    router.refresh();
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setSaving(true);
    fetch(`/api/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, admin_feedback: feedback || null }),
    }).then(() => { setSaving(false); router.refresh(); });
  };

  const sendPreset = (text: string) => {
    setFeedback(text);
    save(text);
  };

  const presets = PRESETS[status] ?? [];

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
        <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

          {/* Preset chips */}
          {presets.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Quick send
              </div>
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => sendPreset(p)}
                  disabled={saving}
                  style={{
                    padding: '0.4rem 0.65rem', textAlign: 'left', cursor: saving ? 'not-allowed' : 'pointer',
                    background: feedback === p ? 'rgba(0,200,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${feedback === p ? 'var(--cyan-border)' : 'var(--border)'}`,
                    borderRadius: '6px', color: feedback === p ? 'var(--cyan)' : 'var(--muted)',
                    fontFamily: 'var(--font-body)', fontSize: '0.74rem', lineHeight: 1.4,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (feedback !== p) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--text)'; } }}
                  onMouseLeave={e => { if (feedback !== p) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; } }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or type custom</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Custom textarea */}
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Write a custom remark…"
            rows={3}
            style={{
              width: '100%', padding: '0.5rem 0.65rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              borderRadius: '6px', color: 'var(--text)', fontFamily: 'var(--font-body)',
              fontSize: '0.78rem', resize: 'vertical', outline: 'none', lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            onClick={() => save()}
            disabled={saving || !feedback.trim()}
            style={{
              padding: '0.35rem 0.75rem', background: feedback.trim() ? 'var(--cyan)' : 'rgba(0,200,255,0.2)',
              color: feedback.trim() ? '#070D1A' : 'var(--muted)',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem',
              border: 'none', borderRadius: '6px',
              cursor: (saving || !feedback.trim()) ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-end',
            }}
          >
            {saving ? 'Saving…' : 'Send Remark'}
          </button>
        </div>
      )}
    </div>
  );
}

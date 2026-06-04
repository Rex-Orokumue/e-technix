'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STAR_COLOR = ['', '#FF5555', '#F59E0B', '#F59E0B', '#34D366', '#34D366'];

interface Props {
  reviewId: string; // "studentId_sessionId"
  studentName: string;
  track: string;
  rating: number;
  feedback: string;
  adminReply: string | null;
  isLast: boolean;
}

export default function AdminReviewCard({ reviewId, studentName, track, rating, feedback, adminReply, isLast }: Props) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState(adminReply ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const saveReply = async () => {
    setSaving(true);
    await fetch(`/api/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_reply: replyText.trim() || null }),
    });
    setSaving(false);
    setShowReply(false);
    router.refresh();
  };

  const deleteReview = async () => {
    setDeleting(true);
    await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
    setDeleting(false);
    router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.75rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font-body)',
    fontSize: '0.82rem', outline: 'none', resize: 'vertical', lineHeight: 1.5,
  };

  return (
    <div style={{ paddingTop: '0.85rem', paddingBottom: '0.85rem', borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Rating */}
        <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '40px' }}>
          <div style={{ fontSize: '1.1rem', color: STAR_COLOR[rating] }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: '1px' }}>{rating}/5</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem' }}>{studentName}</span>
            {track && <span style={{ fontSize: '0.65rem', color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>{track}</span>}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, margin: 0, marginBottom: adminReply ? '0.6rem' : 0 }}>{feedback}</p>

          {/* Existing admin reply */}
          {adminReply && !showReply && (
            <div style={{ marginTop: '0.6rem', padding: '0.6rem 0.75rem', background: 'rgba(0,200,255,0.05)', border: '1px solid var(--cyan-border)', borderRadius: '7px' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Your reply</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{adminReply}</p>
            </div>
          )}

          {/* Reply form */}
          {showReply && (
            <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <textarea
                rows={3}
                style={inputStyle}
                placeholder="Write a reply to this review…"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={saveReply} disabled={saving} style={{ padding: '0.4rem 0.9rem', background: 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.78rem', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Saving…' : 'Save Reply'}
                </button>
                <button onClick={() => { setShowReply(false); setReplyText(adminReply ?? ''); }} style={{ padding: '0.4rem 0.9rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.78rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                {replyText.trim() && (
                  <button onClick={() => setReplyText('')} style={{ padding: '0.4rem 0.9rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.78rem', borderRadius: '6px', cursor: 'pointer' }}>Clear reply</button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
          {!showReply && (
            <button onClick={() => setShowReply(true)} style={{ padding: '0.3rem 0.6rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--muted)', fontSize: '0.72rem', cursor: 'pointer' }} title="Reply">
              {adminReply ? '✏️ Edit reply' : '↩ Reply'}
            </button>
          )}
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{ padding: '0.3rem 0.6rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--muted)', fontSize: '0.72rem', cursor: 'pointer' }} title="Delete">
              🗑
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button onClick={deleteReview} disabled={deleting} style={{ padding: '0.3rem 0.55rem', background: 'rgba(255,51,51,0.12)', border: '1px solid rgba(255,51,51,0.35)', borderRadius: '5px', color: '#FF5555', fontSize: '0.72rem', fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer' }}>
                {deleting ? '…' : 'Delete'}
              </button>
              <button onClick={() => setConfirmDelete(false)} style={{ padding: '0.3rem 0.55rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--muted)', fontSize: '0.72rem', cursor: 'pointer' }}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STAR_COLOR = ['', '#FF5555', '#F59E0B', '#F59E0B', '#34D366', '#34D366'];

interface Props {
  reviewId: string;
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
    fontSize: '0.82rem', outline: 'none', resize: 'vertical' as const, lineHeight: 1.5,
  };

  const actionBtn = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '0.35rem 0.75rem',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--muted)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'var(--font-head)',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    ...extra,
  });

  return (
    <>
      <style>{`
        .arc-card { padding: 0.85rem 0; border-bottom: 1px solid var(--border); }
        .arc-card.last { border-bottom: none; }
        .arc-row { display: flex; gap: 0.85rem; align-items: flex-start; }
        .arc-stars { flex-shrink: 0; text-align: center; min-width: 38px; }
        .arc-body { flex: 1; min-width: 0; }
        .arc-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 4px; }
        .arc-actions { display: flex; gap: 0.35rem; flex-shrink: 0; align-items: flex-start; }
        /* On mobile: move actions row below the body */
        @media (max-width: 540px) {
          .arc-actions { display: none; }
          .arc-actions-mobile { display: flex !important; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.6rem; }
        }
        @media (min-width: 541px) {
          .arc-actions-mobile { display: none; }
        }
      `}</style>

      <div className={`arc-card${isLast ? ' last' : ''}`}>
        <div className="arc-row">
          {/* Stars */}
          <div className="arc-stars">
            <div style={{ fontSize: '1rem', color: STAR_COLOR[rating] }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: '1px' }}>{rating}/5</div>
          </div>

          {/* Content */}
          <div className="arc-body">
            <div className="arc-meta">
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem' }}>{studentName}</span>
              {track && <span style={{ fontSize: '0.65rem', color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>{track}</span>}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{feedback}</p>

            {/* Existing reply */}
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
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={saveReply} disabled={saving} style={{ padding: '0.4rem 0.9rem', background: 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.78rem', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer' }}>
                    {saving ? 'Saving…' : 'Save Reply'}
                  </button>
                  <button onClick={() => { setShowReply(false); setReplyText(adminReply ?? ''); }} style={actionBtn()}>Cancel</button>
                  {replyText.trim() && (
                    <button onClick={() => setReplyText('')} style={actionBtn()}>Clear reply</button>
                  )}
                </div>
              </div>
            )}

            {/* Actions row — mobile only (shown below content) */}
            <div className="arc-actions-mobile" style={{ display: 'none' }}>
              <ActionButtons
                showReply={showReply} adminReply={adminReply} confirmDelete={confirmDelete} deleting={deleting}
                onReply={() => setShowReply(true)}
                onDelete={deleteReview}
                onConfirm={() => setConfirmDelete(true)}
                onCancelDelete={() => setConfirmDelete(false)}
              />
            </div>
          </div>

          {/* Actions — desktop (right side) */}
          <div className="arc-actions">
            <ActionButtons
              showReply={showReply} adminReply={adminReply} confirmDelete={confirmDelete} deleting={deleting}
              onReply={() => setShowReply(true)}
              onDelete={deleteReview}
              onConfirm={() => setConfirmDelete(true)}
              onCancelDelete={() => setConfirmDelete(false)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ActionButtons({ showReply, adminReply, confirmDelete, deleting, onReply, onDelete, onConfirm, onCancelDelete }: {
  showReply: boolean; adminReply: string | null; confirmDelete: boolean; deleting: boolean;
  onReply: () => void; onDelete: () => void; onConfirm: () => void; onCancelDelete: () => void;
}) {
  const btn = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '0.3rem 0.65rem', background: 'transparent', border: '1px solid var(--border)',
    borderRadius: '5px', color: 'var(--muted)', fontSize: '0.73rem', cursor: 'pointer',
    fontFamily: 'var(--font-head)', fontWeight: 600, whiteSpace: 'nowrap' as const, ...extra,
  });

  return (
    <>
      {!showReply && (
        <button onClick={onReply} style={btn()} title="Reply">
          {adminReply ? '✏️ Edit reply' : '↩ Reply'}
        </button>
      )}
      {!confirmDelete ? (
        <button onClick={onConfirm} style={btn()} title="Delete">🗑</button>
      ) : (
        <>
          <button onClick={onDelete} disabled={deleting} style={btn({ background: 'rgba(255,51,51,0.12)', border: '1px solid rgba(255,51,51,0.35)', color: '#FF5555', fontWeight: 700 })}>
            {deleting ? '…' : 'Delete'}
          </button>
          <button onClick={onCancelDelete} style={btn()}>Cancel</button>
        </>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Session {
  id: string;
  phase: number;
  week: number;
  session_number: number;
  title: string;
  date: string;
  duration?: string;
  youtube_url?: string;
  meet_link?: string;
  attendance_code?: string;
  attendance_code_expires_at?: string;
}

export default function AdminSessionCard({ session }: { session: Session }) {
  const router = useRouter();
  const [generatingCode, setGeneratingCode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const codeActive = session.attendance_code &&
    (!session.attendance_code_expires_at || new Date(session.attendance_code_expires_at) > new Date());

  const generateAttendanceCode = async () => {
    setGeneratingCode(true);
    const code = `ETX-S${session.session_number}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const expires = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // 3 hours
    await fetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance_code: code, attendance_code_expires_at: expires }),
    });
    setGeneratingCode(false);
    router.refresh();
  };

  const expireCode = async () => {
    await fetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance_code: null, attendance_code_expires_at: null }),
    });
    router.refresh();
  };

  const deleteSession = async () => {
    if (!confirm('Delete this session? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/api/sessions/${session.id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '1.25rem',
      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '9px', flexShrink: 0,
        background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--cyan)',
      }}>
        {String(session.session_number).padStart(2, '0')}
      </div>

      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.92rem', marginBottom: '3px' }}>
          {session.title}
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
          {session.date} {session.duration && `· ${session.duration}`}
        </div>
        {codeActive && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px',
            background: 'rgba(52,211,102,0.1)', border: '1px solid rgba(52,211,102,0.25)',
            borderRadius: '5px', padding: '0.15rem 0.5rem',
            fontSize: '0.72rem', fontWeight: 700, color: '#34D366',
            letterSpacing: '0.04em',
          }}>
            🟢 Code: {session.attendance_code}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {codeActive ? (
          <button onClick={expireCode} style={{
            padding: '0.45rem 0.85rem', borderRadius: '6px', cursor: 'pointer',
            background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.2)',
            color: '#FF5555', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.75rem',
          }}>
            Expire Code
          </button>
        ) : (
          <button onClick={generateAttendanceCode} disabled={generatingCode} style={{
            padding: '0.45rem 0.85rem', borderRadius: '6px', cursor: 'pointer',
            background: 'rgba(52,211,102,0.08)', border: '1px solid rgba(52,211,102,0.2)',
            color: '#34D366', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.75rem',
          }}>
            {generatingCode ? '…' : 'Gen Code'}
          </button>
        )}
        <Link href={`/admin/sessions/${session.id}`} style={{
          padding: '0.45rem 0.85rem', borderRadius: '6px', cursor: 'pointer',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          color: 'var(--muted)', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.75rem',
          textDecoration: 'none',
        }}>
          Edit
        </Link>
        <button onClick={deleteSession} disabled={deleting} style={{
          padding: '0.45rem 0.85rem', borderRadius: '6px', cursor: 'pointer',
          background: 'transparent', border: '1px solid var(--border)',
          color: 'var(--muted)', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.75rem',
        }}>
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Announcement {
  id: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('/hub');
  const [pushSending, setPushSending] = useState(false);
  const [pushResult, setPushResult] = useState('');

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;
    setPushSending(true);
    setPushResult('');
    const res = await fetch('/api/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: pushTitle.trim(), body: pushBody.trim(), url: pushUrl || '/hub' }),
    });
    setPushSending(false);
    if (res.ok) {
      const d = await res.json();
      setPushResult(`✓ Sent to ${d.sent} of ${d.total} subscribed student${d.total !== 1 ? 's' : ''}`);
      setPushTitle(''); setPushBody(''); setPushUrl('/hub');
    } else {
      const d = await res.json().catch(() => ({}));
      setPushResult(`✗ ${d.error ?? 'Failed to send'}`);
    }
  };

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/announcements-all');
    if (res.ok) setAnnouncements(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSaving(true);
    setError('');
    // Deactivate all existing first
    for (const a of announcements.filter(a => a.is_active)) {
      await fetch(`/api/announcements/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      });
    }
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim(), is_active: true }),
    });
    setSaving(false);
    if (res.ok) { setMessage(''); load(); router.refresh(); }
    else { const d = await res.json(); setError(d.error || 'Failed to post'); }
  };

  const toggle = async (a: Announcement) => {
    await fetch(`/api/announcements/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !a.is_active }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    load();
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700 as const, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.4rem', display: 'block' };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Announcements</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Post a banner that appears at the top of every student&apos;s hub.</p>
      </div>

      {/* Post form */}
      <form onSubmit={handlePost} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>New Announcement</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }}
            placeholder='e.g. "Session tonight is cancelled. See WhatsApp for the rescheduled date."'
            value={message}
            onChange={e => setMessage(e.target.value)}
            onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        {error && <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}
        <button type="submit" disabled={saving || !message.trim()} style={{ alignSelf: 'flex-start', padding: '0.65rem 1.5rem', background: saving ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Posting…' : 'Post Announcement'}
        </button>
      </form>

      {/* Push notification form */}
      <form onSubmit={handlePush} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🔔</span>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem' }}>Send Push Notification</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Sends a browser push to all students who have notifications enabled.</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} placeholder="e.g. Class tonight!" value={pushTitle} onChange={e => setPushTitle(e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
          <div>
            <label style={labelStyle}>Link (optional)</label>
            <input style={inputStyle} placeholder="/hub" value={pushUrl} onChange={e => setPushUrl(e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Message *</label>
          <textarea style={{ ...inputStyle, minHeight: '65px', resize: 'vertical', lineHeight: 1.6 }} placeholder="Session starts at 7PM tonight. Don't be late!" value={pushBody} onChange={e => setPushBody(e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        </div>
        {pushResult && (
          <div style={{ padding: '0.5rem 1rem', background: pushResult.startsWith('✓') ? 'rgba(52,211,102,0.08)' : 'rgba(255,51,51,0.08)', border: `1px solid ${pushResult.startsWith('✓') ? 'rgba(52,211,102,0.25)' : 'rgba(255,51,51,0.25)'}`, borderRadius: '7px', fontSize: '0.82rem', color: pushResult.startsWith('✓') ? '#34D366' : '#FF5555' }}>
            {pushResult}
          </div>
        )}
        <button type="submit" disabled={pushSending || !pushTitle.trim() || !pushBody.trim()} style={{ alignSelf: 'flex-start', padding: '0.65rem 1.5rem', background: pushSending ? 'rgba(167,139,250,0.3)' : '#A78BFA', color: '#fff', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', cursor: pushSending ? 'not-allowed' : 'pointer' }}>
          {pushSending ? 'Sending…' : '🔔 Send Push'}
        </button>
      </form>

      {/* Existing announcements */}
      <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>History</h2>
      {loading ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Loading…</p>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <p style={{ color: 'var(--muted)' }}>No announcements yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {announcements.map(a => (
            <div key={a.id} style={{ background: 'var(--surface)', border: `1px solid ${a.is_active ? 'var(--cyan-border)' : 'var(--border)'}`, borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                {a.is_active && (
                  <span style={{ display: 'inline-block', marginBottom: '0.4rem', fontSize: '0.68rem', fontWeight: 700, background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', color: 'var(--cyan)', borderRadius: '4px', padding: '0.1rem 0.45rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live</span>
                )}
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.3rem' }}>{a.message}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{new Date(a.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => toggle(a)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-head)', fontWeight: 600, border: '1px solid var(--border)', background: 'transparent', color: a.is_active ? '#FF5555' : '#34D366' }}>
                  {a.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => remove(a.id)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-head)', fontWeight: 600, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

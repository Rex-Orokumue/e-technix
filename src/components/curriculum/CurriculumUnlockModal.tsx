'use client';
import { useState } from 'react';

interface Props {
  tracks: { code: string; name: string }[];
  onUnlocked: (name: string) => void;
  onClose: () => void;
}

const input: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.7rem 0.9rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  outline: 'none',
};
const label: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.35rem',
  display: 'block',
};

export default function CurriculumUnlockModal({ tracks, onUnlocked, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [track, setTrack] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/curriculum/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, track_interest: track || null }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong. Please try again.');
      else onUnlocked(data.name ?? name);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
            Unlock the full curriculum
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.4rem', marginBottom: 0, lineHeight: 1.55 }}>
            See every session and download the full prospectus PDF. Tell us where to send it.
          </p>
        </div>

        <div>
          <label style={label}>Your name *</label>
          <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
        </div>

        <div>
          <label style={label}>Email address *</label>
          <input
            style={input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            required
          />
        </div>

        <div>
          <label style={label}>Which track interests you? (optional)</label>
          <select style={{ ...input, cursor: 'pointer' }} value={track} onChange={(e) => setTrack(e.target.value)}>
            <option value="">— Not sure yet —</option>
            {tracks.map((t) => (
              <option key={t.code} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div
            style={{
              padding: '0.6rem 0.85rem',
              background: 'rgba(255,51,51,0.08)',
              border: '1px solid rgba(255,51,51,0.25)',
              borderRadius: '7px',
              fontSize: '0.82rem',
              color: '#FF5555',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
          <button
            type="submit"
            disabled={busy}
            style={{
              flex: 1,
              padding: '0.8rem',
              background: 'var(--cyan)',
              color: '#070D1A',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Unlocking…' : 'Unlock & continue'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.8rem 1.1rem',
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontFamily: 'var(--font-head)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>

        <p style={{ fontSize: '0.7rem', color: 'var(--muted)', margin: 0, textAlign: 'center' }}>
          No spam. We&apos;ll only contact you about the programme.
        </p>
      </form>
    </div>
  );
}

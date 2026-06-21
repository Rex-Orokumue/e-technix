'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TRACKS } from '@/lib/tracks';

function generatePassword(length = 12) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#!$%';
  const all = upper + lower + digits + symbols;
  // Ensure at least one of each category
  const mandatory = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  const rest = Array.from({ length: length - mandatory.length }, () =>
    all[Math.floor(Math.random() * all.length)]
  );
  return [...mandatory, ...rest].sort(() => Math.random() - 0.5).join('');
}

export default function NewStudentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', track: '', password: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Auto-generate a password on mount
  useEffect(() => {
    set('password', generatePassword());
  }, []);

  const regenerate = () => {
    setCopied(false);
    set('password', generatePassword());
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(form.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSuccess(`${form.full_name} enrolled. Share these credentials:\nEmail: ${form.email}\nPassword: ${form.password}`);
      setForm({ full_name: '', email: '', track: '', password: generatePassword() });
      setCopied(false);
    } else {
      const d = await res.json();
      setError(d.error || 'Failed to enrol student');
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' };
  const labelStyle: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' };

  return (
    <div style={{ maxWidth: '500px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>← Back</button>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Enrol Student</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input style={inputStyle} placeholder="John Doe" value={form.full_name} onChange={e => set('full_name', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        </div>
        <div>
          <label style={labelStyle}>Email Address *</label>
          <input type="email" style={inputStyle} placeholder="john@example.com" value={form.email} onChange={e => set('email', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        </div>
        <div>
          <label style={labelStyle}>Track *</label>
          <select style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }} value={form.track} onChange={e => set('track', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')}>
            <option value="" style={{ background: '#0f1829', color: '#94a3b8' }}>Select track</option>
            {TRACKS.map(t => <option key={t} value={t} style={{ background: '#0f1829', color: '#e2e8f0' }}>{t}</option>)}
          </select>
        </div>

        {/* Auto-generated password */}
        <div>
          <label style={labelStyle}>Password (auto-generated)</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '0.05em' }}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <button type="button" onClick={copyPassword} style={{ padding: '0.75rem 0.9rem', background: copied ? 'rgba(52,211,102,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(52,211,102,0.4)' : 'var(--border)'}`, borderRadius: '8px', color: copied ? '#34D366' : 'var(--muted)', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
            <button type="button" onClick={regenerate} title="Generate new password" style={{ padding: '0.75rem 0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 }}>
              🔄
            </button>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.4rem', margin: '0.4rem 0 0' }}>
            Copy this before enrolling — share it with the student directly.
          </p>
        </div>

        {error && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}
        {success && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(52,211,102,0.08)', border: '1px solid rgba(52,211,102,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#34D366', whiteSpace: 'pre-line' }}>
            ✓ {success}
          </div>
        )}

        <button type="submit" disabled={saving} style={{ padding: '0.9rem', background: saving ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', border: 'none', borderRadius: '9px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Enrolling…' : 'Enrol Student'}
        </button>
      </form>
    </div>
  );
}

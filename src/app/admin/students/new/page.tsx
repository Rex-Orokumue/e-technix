'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TRACKS = ['Data Analytics', 'Web App Development', 'Mobile & Desktop Apps', 'AI & Agentic Systems', 'Product Design (UI/UX)', 'Business Development'];

export default function NewStudentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', track: '', password: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

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
      setSuccess(`${form.full_name} has been enrolled. They can log in at /hub/login with their email and password.`);
      setForm({ full_name: '', email: '', track: '', password: '' });
    } else {
      const d = await res.json();
      setError(d.error || 'Failed to enrol student');
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700 as const, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.4rem', display: 'block' };

  return (
    <div style={{ maxWidth: '500px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>← Back</button>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Enrol Student</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
          The student will receive an email invite to set up their hub access.
        </p>
      </div>
      <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div><label style={labelStyle}>Full Name *</label>
          <input style={inputStyle} placeholder="John Doe" value={form.full_name} onChange={e => set('full_name', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        <div><label style={labelStyle}>Email Address *</label>
          <input type="email" style={inputStyle} placeholder="john@example.com" value={form.email} onChange={e => set('email', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        <div><label style={labelStyle}>Password *</label>
          <input type="password" style={inputStyle} placeholder="Set a password for the student" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        <div><label style={labelStyle}>Track *</label>
          <select style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }} value={form.track} onChange={e => set('track', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')}>
            <option value="" style={{ background: '#0f1829', color: '#94a3b8' }}>Select track</option>
            {TRACKS.map(t => <option key={t} value={t} style={{ background: '#0f1829', color: '#e2e8f0' }}>{t}</option>)}
          </select></div>
        {error && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}
        {success && <div style={{ padding: '0.75rem 1rem', background: 'rgba(52,211,102,0.08)', border: '1px solid rgba(52,211,102,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#34D366' }}>✓ {success}</div>}
        <button type="submit" disabled={saving} style={{ padding: '0.9rem', background: saving ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', border: 'none', borderRadius: '9px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Enrolling…' : 'Enrol & Send Invite'}
        </button>
      </form>
    </div>
  );
}

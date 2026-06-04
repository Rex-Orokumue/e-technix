'use client';

import { useState } from 'react';

interface Student {
  id: string;
  full_name: string;
  email: string;
  track: string;
  enrolled_at: string;
  bio?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  location?: string | null;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem',
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
  borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)',
  fontSize: '0.9rem', outline: 'none',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)',
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block',
};

export default function ProfileTab({ student, onSave }: { student: Student; onSave: (s: Student) => void }) {
  const [form, setForm] = useState({
    bio: student.bio ?? '',
    phone: student.phone ?? '',
    linkedin_url: student.linkedin_url ?? '',
    github_url: student.github_url ?? '',
    portfolio_url: student.portfolio_url ?? '',
    location: student.location ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/students/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      onSave(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Failed to save');
    }
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.4rem' }}>My Profile</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Add personal details so your cohort can connect with you.</p>

      {/* Read-only info */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <div style={labelStyle}>Full Name</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{student.full_name}</div>
        </div>
        <div>
          <div style={labelStyle}>Email</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{student.email}</div>
        </div>
        <div>
          <div style={labelStyle}>Track</div>
          <span style={{ background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '5px', padding: '0.2rem 0.6rem', fontSize: '0.78rem', color: 'var(--cyan)', fontWeight: 600 }}>{student.track}</span>
        </div>
        <div>
          <div style={labelStyle}>Enrolled</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{new Date(student.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Editable fields */}
      <form onSubmit={handleSave} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <label style={labelStyle}>Bio</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }}
            placeholder="Tell your cohort a bit about yourself…"
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} placeholder="+234 800 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input style={inputStyle} placeholder="Lagos, Nigeria" value={form.location} onChange={e => set('location', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>LinkedIn URL</label>
          <input style={inputStyle} placeholder="https://linkedin.com/in/yourname" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        </div>
        <div>
          <label style={labelStyle}>GitHub URL</label>
          <input style={inputStyle} placeholder="https://github.com/yourname" value={form.github_url} onChange={e => set('github_url', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        </div>
        <div>
          <label style={labelStyle}>Portfolio / Website</label>
          <input style={inputStyle} placeholder="https://yourportfolio.com" value={form.portfolio_url} onChange={e => set('portfolio_url', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        </div>

        {error && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}
        {saved && <div style={{ padding: '0.6rem 1rem', background: 'rgba(52,211,102,0.08)', border: '1px solid rgba(52,211,102,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#34D366' }}>Profile saved successfully!</div>}

        <button type="submit" disabled={saving} style={{ alignSelf: 'flex-start', padding: '0.75rem 1.75rem', background: saving ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', border: 'none', borderRadius: '9px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

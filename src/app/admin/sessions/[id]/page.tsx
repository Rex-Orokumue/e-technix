'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TrackPicker from '@/components/admin/TrackPicker';

export default function EditSessionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [tracks, setTracks] = useState<string[] | null>(null);
  const [form, setForm] = useState({
    phase: '1', week: '1', session_number: '1',
    title: '', date: '', duration: '', youtube_url: '', meet_link: '', description: '',
  });

  useEffect(() => {
    fetch('/api/sessions').then(r => r.json()).then(sessions => {
      const s = sessions.find((s: { id: string }) => s.id === id);
      if (s) {
        setForm({
          phase: String(s.phase), week: String(s.week), session_number: String(s.session_number),
          title: s.title ?? '', date: s.date ?? '', duration: s.duration ?? '',
          youtube_url: s.youtube_url ?? '', meet_link: s.meet_link ?? '', description: s.description ?? '',
        });
        setTopicsInput((s.topics ?? []).join('\n'));
        setTracks(s.tracks ?? null);
      }
      setLoading(false);
    });
  }, [id]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const topics = topicsInput.split('\n').map(t => t.trim()).filter(Boolean);
    const res = await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        phase: parseInt(form.phase),
        week: parseInt(form.week),
        session_number: parseInt(form.session_number),
        topics,
        tracks: tracks && tracks.length > 0 ? tracks : null,
      }),
    });
    setSaving(false);
    if (res.ok) { router.push('/admin/sessions'); router.refresh(); }
    else { const d = await res.json(); setError(d.error || 'Failed to save'); }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)',
    fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
  };
  const labelStyle = {
    fontSize: '0.72rem', fontWeight: 700 as const, color: 'var(--muted)',
    letterSpacing: '0.06em', textTransform: 'uppercase' as const,
    marginBottom: '0.4rem', display: 'block',
  };

  if (loading) return <div style={{ color: 'var(--muted)', padding: '3rem' }}>Loading…</div>;

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>← Back</button>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Edit Session</h1>
      </div>
      <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          {[{ key: 'phase', label: 'Phase' }, { key: 'week', label: 'Week' }, { key: 'session_number', label: 'Session #' }].map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input type="number" min="1" style={inputStyle} value={form[f.key as keyof typeof form]}
                onChange={e => set(f.key, e.target.value)} required
                onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          ))}
        </div>
        <div><label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required
            onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><label style={labelStyle}>Date *</label>
            <input type="date" style={inputStyle} value={form.date} onChange={e => set('date', e.target.value)} required
              onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
          <div><label style={labelStyle}>Duration</label>
            <input style={inputStyle} value={form.duration} onChange={e => set('duration', e.target.value)}
              onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        </div>
        <div><label style={labelStyle}>YouTube URL</label>
          <input style={inputStyle} value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)}
            onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        <div><label style={labelStyle}>Google Meet Link</label>
          <input style={inputStyle} value={form.meet_link} onChange={e => set('meet_link', e.target.value)}
            onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        <div><label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }}
            value={form.description} onChange={e => set('description', e.target.value)}
            onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        <div><label style={labelStyle}>Topics (one per line)</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }}
            value={topicsInput} onChange={e => setTopicsInput(e.target.value)}
            onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        <div>
          <label style={labelStyle}>Visible to</label>
          <TrackPicker value={tracks} onChange={setTracks} />
        </div>
        {error && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}
        <button type="submit" disabled={saving} style={{ padding: '0.9rem', background: saving ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', border: 'none', borderRadius: '9px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TrackPicker from '@/components/admin/TrackPicker';

export default function EditResourcePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tracks, setTracks] = useState<string[] | null>(null);
  const [form, setForm] = useState({ phase: '1', week: '1', title: '', description: '', url: '', type: 'document', sort_order: '0' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch('/api/resources')
      .then(r => r.json())
      .then((items: any[]) => {
        const r = items.find(r => r.id === id);
        if (!r) return;
        setForm({
          phase: String(r.phase ?? 1),
          week: String(r.week ?? 1),
          title: r.title ?? '',
          description: r.description ?? '',
          url: r.url ?? '',
          type: r.type ?? 'document',
          sort_order: String(r.sort_order ?? 0),
        });
        setTracks(r.tracks ?? null);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch(`/api/resources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        phase: parseInt(form.phase),
        week: parseInt(form.week),
        sort_order: parseInt(form.sort_order),
        tracks: tracks && tracks.length > 0 ? tracks : null,
      }),
    });
    setSaving(false);
    if (res.ok) { router.push('/admin/resources'); router.refresh(); }
    else { const d = await res.json(); setError(d.error || 'Failed to save'); }
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', colorScheme: 'dark' as const };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700 as const, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.4rem', display: 'block' };
  const optStyle = { background: '#0f1829', color: '#e2e8f0' };

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading…</div>;

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>← Back</button>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Edit Resource</h1>
      </div>
      <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><label style={labelStyle}>Phase</label>
            <input type="number" min="1" style={inputStyle} value={form.phase} onChange={e => set('phase', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
          <div><label style={labelStyle}>Week</label>
            <input type="number" min="1" style={inputStyle} value={form.week} onChange={e => set('week', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        </div>

        <div><label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>

        <div><label style={labelStyle}>Description</label>
          <input style={inputStyle} value={form.description} onChange={e => set('description', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>

        <div><label style={labelStyle}>URL *</label>
          <input style={inputStyle} value={form.url} onChange={e => set('url', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>

        <div><label style={labelStyle}>Type *</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type} onChange={e => set('type', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')}>
            <option value="document" style={optStyle}>Document</option>
            <option value="video" style={optStyle}>Video</option>
            <option value="link" style={optStyle}>External Link</option>
            <option value="notion" style={optStyle}>Notion</option>
          </select></div>

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

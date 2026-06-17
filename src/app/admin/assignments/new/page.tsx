'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TrackPicker from '@/components/admin/TrackPicker';
import AiTemplateEditor, { emptyTemplate, type AiTemplate } from '@/components/admin/AiTemplateEditor';

export default function NewAssignmentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [guidelinesInput, setGuidelinesInput] = useState('');
  const [tracks, setTracks] = useState<string[] | null>(null);
  const [aiTemplate, setAiTemplate] = useState<AiTemplate>(emptyTemplate);
  const [form, setForm] = useState({ phase: '1', week: '1', assignment_code: '', title: '', description: '', due_date: '' });

  useEffect(() => {
    fetch('/api/assignments').then(r => r.json()).then((assignments: any[]) => {
      if (!Array.isArray(assignments) || assignments.length === 0) {
        setForm(f => ({ ...f, assignment_code: 'A01' }));
        return;
      }
      const max = assignments.reduce((best, a) => {
        const n = parseInt((a.assignment_code ?? '').replace(/\D/g, ''), 10);
        return isNaN(n) ? best : Math.max(best, n);
      }, 0);
      setForm(f => ({ ...f, assignment_code: `A${String(max + 1).padStart(2, '0')}` }));
    }).catch(() => {});
  }, []);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const guidelines = guidelinesInput.split('\n').map(g => g.trim()).filter(Boolean);
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        phase: parseInt(form.phase),
        week: parseInt(form.week),
        guidelines,
        tracks: tracks && tracks.length > 0 ? tracks : null,
        ai_template: aiTemplate.enabled ? aiTemplate : null,
      }),
    });
    setSaving(false);
    if (res.ok) { router.push('/admin/assignments'); router.refresh(); }
    else { const d = await res.json(); setError(d.error || 'Failed to save'); }
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', colorScheme: 'dark' as const };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700 as const, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.4rem', display: 'block' };

  return (
    <div style={{ maxWidth: '650px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>← Back</button>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Add Assignment</h1>
      </div>
      <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div><label style={labelStyle}>Phase</label>
            <input type="number" min="1" style={inputStyle} value={form.phase} onChange={e => set('phase', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
          <div><label style={labelStyle}>Week</label>
            <input type="number" min="1" style={inputStyle} value={form.week} onChange={e => set('week', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
          <div><label style={labelStyle}>Code</label>
            <input style={inputStyle} placeholder="A01" value={form.assignment_code} onChange={e => set('assignment_code', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        </div>

        <div><label style={labelStyle}>Title *</label>
          <input style={inputStyle} placeholder="Assignment 1 — Introduce Yourself" value={form.title} onChange={e => set('title', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>

        <div><label style={labelStyle}>Description *</label>
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', lineHeight: 1.6 }} placeholder="What students need to do…" value={form.description} onChange={e => set('description', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>

        <div><label style={labelStyle}>Guidelines (one per line)</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }} placeholder={'Minimum 300 words\nShare Google Drive link\nSet sharing to Anyone with the link'} value={guidelinesInput} onChange={e => setGuidelinesInput(e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>

        <div><label style={labelStyle}>Due Date</label>
          <input type="date" style={inputStyle} value={form.due_date} onChange={e => set('due_date', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>

        <div>
          <label style={labelStyle}>Visible to</label>
          <TrackPicker value={tracks} onChange={setTracks} />
        </div>

        <div>
          <label style={labelStyle}>AI Assistant</label>
          <AiTemplateEditor value={aiTemplate} onChange={setAiTemplate} />
        </div>

        {error && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}
        <button type="submit" disabled={saving} style={{ padding: '0.9rem', background: saving ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', border: 'none', borderRadius: '9px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save Assignment'}
        </button>
      </form>
    </div>
  );
}

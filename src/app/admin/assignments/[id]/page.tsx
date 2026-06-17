'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TrackPicker from '@/components/admin/TrackPicker';
import AiTemplateEditor, { emptyTemplate, type AiTemplate } from '@/components/admin/AiTemplateEditor';

export default function EditAssignmentPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [guidelinesInput, setGuidelinesInput] = useState('');
  const [tracks, setTracks] = useState<string[] | null>(null);
  const [aiTemplate, setAiTemplate] = useState<AiTemplate>(emptyTemplate);
  const [form, setForm] = useState({ phase: '1', week: '1', assignment_code: '', title: '', description: '', due_date: '', status: 'active' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch('/api/assignments')
      .then(r => r.json())
      .then((items: any[]) => {
        const a = items.find(a => a.id === id);
        if (!a) return;
        setForm({
          phase: String(a.phase ?? 1),
          week: String(a.week ?? 1),
          assignment_code: a.assignment_code ?? '',
          title: a.title ?? '',
          description: a.description ?? '',
          due_date: a.due_date ?? '',
          status: a.status ?? 'active',
        });
        setGuidelinesInput(Array.isArray(a.guidelines) ? a.guidelines.join('\n') : '');
        setTracks(a.tracks ?? null);
        if (a.ai_template) setAiTemplate({ ...emptyTemplate, ...a.ai_template });
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const guidelines = guidelinesInput.split('\n').map(g => g.trim()).filter(Boolean);
    const res = await fetch(`/api/assignments/${id}`, {
      method: 'PATCH',
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

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Loading…</div>;

  return (
    <div style={{ maxWidth: '650px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>← Back</button>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Edit Assignment</h1>
      </div>
      <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div><label style={labelStyle}>Phase</label>
            <input type="number" min="1" style={inputStyle} value={form.phase} onChange={e => set('phase', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
          <div><label style={labelStyle}>Week</label>
            <input type="number" min="1" style={inputStyle} value={form.week} onChange={e => set('week', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
          <div><label style={labelStyle}>Code</label>
            <input style={inputStyle} value={form.assignment_code} onChange={e => set('assignment_code', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>
        </div>

        <div><label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>

        <div><label style={labelStyle}>Description *</label>
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', lineHeight: 1.6 }} value={form.description} onChange={e => set('description', e.target.value)} required onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>

        <div><label style={labelStyle}>Guidelines (one per line)</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }} value={guidelinesInput} onChange={e => setGuidelinesInput(e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} /></div>

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

        {/* Open / Closed toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: form.status === 'closed' ? 'rgba(122,143,173,0.08)' : 'rgba(52,211,102,0.06)', border: `1px solid ${form.status === 'closed' ? 'rgba(122,143,173,0.25)' : 'rgba(52,211,102,0.2)'}`, borderRadius: '10px', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', color: form.status === 'closed' ? '#7A8FAD' : '#34D366', marginBottom: '2px' }}>
              {form.status === 'closed' ? '🔒 Closed — no new submissions' : '✅ Open — accepting submissions'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
              {form.status === 'closed' ? 'Students cannot submit or edit this assignment.' : 'Students can submit until the due date (or end of that day).'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => set('status', form.status === 'closed' ? 'active' : 'closed')}
            style={{ padding: '0.5rem 1.1rem', background: form.status === 'closed' ? 'rgba(52,211,102,0.12)' : 'rgba(122,143,173,0.12)', border: `1px solid ${form.status === 'closed' ? 'rgba(52,211,102,0.3)' : 'rgba(122,143,173,0.3)'}`, color: form.status === 'closed' ? '#34D366' : '#7A8FAD', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', borderRadius: '7px', cursor: 'pointer', flexShrink: 0 }}
          >
            {form.status === 'closed' ? 'Reopen' : 'Close Assignment'}
          </button>
        </div>

        {error && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}
        <button type="submit" disabled={saving} style={{ padding: '0.9rem', background: saving ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', border: 'none', borderRadius: '9px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

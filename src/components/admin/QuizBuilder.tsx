'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TrackPicker from '@/components/admin/TrackPicker';
import type { Quiz, QuizQuestion, QuestionType } from '@/lib/quiz';

const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none', colorScheme: 'dark' };
const labelStyle: React.CSSProperties = { fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' };

export default function QuizBuilder({ quiz, questions: initialQuestions }: { quiz?: Quiz; questions?: QuizQuestion[] }) {
  const router = useRouter();
  const editing = !!quiz;

  const [tracks, setTracks] = useState<string[] | null>(quiz?.tracks ?? null);
  const [meta, setMeta] = useState({
    title: quiz?.title ?? '',
    description: quiz?.description ?? '',
    phase: String(quiz?.phase ?? 1),
    week: String(quiz?.week ?? 1),
    session_id: quiz?.session_id ?? '',
    time_limit_mins: quiz?.time_limit_mins ? String(quiz.time_limit_mins) : '',
    max_attempts: String(quiz?.max_attempts ?? 1),
    shuffle_questions: quiz?.shuffle_questions ?? false,
    status: quiz?.status ?? 'draft',
    due_date: quiz?.due_date ?? '',
  });
  const set = (k: string, v: any) => setMeta(m => ({ ...m, [k]: v }));

  const [sessions, setSessions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    fetch('/api/sessions').then(r => r.json()).then(d => setSessions(Array.isArray(d) ? d : []));
  }, []);

  const buildBody = () => ({
    title: meta.title,
    description: meta.description || null,
    tracks: tracks && tracks.length > 0 ? tracks : null,
    phase: parseInt(meta.phase) || 1,
    week: parseInt(meta.week) || 1,
    session_id: meta.session_id || null,
    time_limit_mins: meta.time_limit_mins ? parseInt(meta.time_limit_mins) : null,
    max_attempts: parseInt(meta.max_attempts) || 1,
    shuffle_questions: meta.shuffle_questions,
    status: meta.status,
    due_date: meta.due_date || null,
  });

  const createQuiz = async () => {
    if (!meta.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildBody()) });
    setSaving(false);
    if (res.ok) { const created = await res.json(); router.push(`/admin/quizzes/${created.id}`); }
    else { const d = await res.json(); setError(d.error || 'Failed to create'); }
  };

  const saveMeta = async () => {
    if (!quiz) return;
    setSaving(true); setError('');
    const res = await fetch(`/api/quizzes/${quiz.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildBody()) });
    setSaving(false);
    if (res.ok) { setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1500); router.refresh(); }
    else { const d = await res.json(); setError(d.error || 'Failed to save'); }
  };

  const addQuestion = async (type: QuestionType) => {
    if (!quiz) return;
    const base: any = {
      type, prompt: '', points: 1, position: questions.length,
      options: type === 'mcq' ? ['', ''] : null,
      correct_answer: type === 'mcq' ? 0 : type === 'true_false' ? true : null,
      explanation: null, image_url: null,
    };
    const res = await fetch(`/api/quizzes/${quiz.id}/questions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(base) });
    if (res.ok) { const q = await res.json(); setQuestions(prev => [...prev, q]); }
  };

  const updateQuestion = (id: string, patch: Partial<QuizQuestion>) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));

  const saveQuestion = async (q: QuizQuestion) => {
    await fetch(`/api/quiz-questions/${q.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      type: q.type, prompt: q.prompt, points: q.points, options: q.options, correct_answer: q.correct_answer, explanation: q.explanation, image_url: q.image_url, position: q.position,
    }) });
  };

  const deleteQuestion = async (id: string) => {
    await fetch(`/api/quiz-questions/${id}`, { method: 'DELETE' });
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= questions.length) return;
    const a = questions[idx], b = questions[j];
    updateQuestion(a.id, { position: b.position });
    updateQuestion(b.id, { position: a.position });
    const reordered = [...questions];
    [reordered[idx], reordered[j]] = [reordered[j], reordered[idx]];
    setQuestions(reordered.map((q, i) => ({ ...q, position: i })));
    await Promise.all([
      fetch(`/api/quiz-questions/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: b.position }) }),
      fetch(`/api/quiz-questions/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: a.position }) }),
    ]);
  };

  return (
    <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metadata */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div><label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={meta.title} onChange={e => set('title', e.target.value)} placeholder="Quiz 1 — Fundamentals" /></div>

        <div><label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical', lineHeight: 1.5 }} value={meta.description} onChange={e => set('description', e.target.value)} placeholder="Short intro shown to students" /></div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '1rem' }}>
          <div><label style={labelStyle}>Phase</label><input type="number" min="1" style={inputStyle} value={meta.phase} onChange={e => set('phase', e.target.value)} /></div>
          <div><label style={labelStyle}>Week</label><input type="number" min="1" style={inputStyle} value={meta.week} onChange={e => set('week', e.target.value)} /></div>
          <div><label style={labelStyle}>Max attempts</label><input type="number" min="1" style={inputStyle} value={meta.max_attempts} onChange={e => set('max_attempts', e.target.value)} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div><label style={labelStyle}>Time limit (mins, optional)</label><input type="number" min="1" style={inputStyle} value={meta.time_limit_mins} onChange={e => set('time_limit_mins', e.target.value)} placeholder="No limit" /></div>
          <div><label style={labelStyle}>Due date (optional)</label><input type="date" style={inputStyle} value={meta.due_date} onChange={e => set('due_date', e.target.value)} /></div>
        </div>

        <div><label style={labelStyle}>Link to session (optional)</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={meta.session_id} onChange={e => set('session_id', e.target.value)}>
            <option value="" style={{ background: '#0f1829' }}>None</option>
            {sessions.map(s => <option key={s.id} value={s.id} style={{ background: '#0f1829' }}>{s.title}</option>)}
          </select></div>

        <div><label style={labelStyle}>Status</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={meta.status} onChange={e => set('status', e.target.value)}>
            <option value="draft" style={{ background: '#0f1829' }}>Draft (hidden from students)</option>
            <option value="published" style={{ background: '#0f1829' }}>Published (students can take)</option>
            <option value="closed" style={{ background: '#0f1829' }}>Closed (no new attempts)</option>
          </select></div>

        <div><label style={labelStyle}>Visible to</label><TrackPicker value={tracks} onChange={setTracks} /></div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
          <input type="checkbox" checked={meta.shuffle_questions} onChange={e => set('shuffle_questions', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--cyan)', cursor: 'pointer' }} />
          <span style={{ fontSize: '0.82rem', color: meta.shuffle_questions ? 'var(--text)' : 'var(--muted)' }}>🔀 Shuffle question order per student</span>
        </label>

        {error && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}

        {editing ? (
          <button onClick={saveMeta} disabled={saving} style={primaryBtn(saving)}>{saving ? 'Saving…' : savedFlash ? '✓ Saved' : 'Save Quiz Details'}</button>
        ) : (
          <button onClick={createQuiz} disabled={saving} style={primaryBtn(saving)}>{saving ? 'Creating…' : 'Create Quiz & Add Questions'}</button>
        )}
      </div>

      {/* Questions (edit mode only) */}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Questions ({questions.length})</h2>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button onClick={() => addQuestion('mcq')} style={addBtn}>+ Multiple choice</button>
              <button onClick={() => addQuestion('true_false')} style={addBtn}>+ True / False</button>
              <button onClick={() => addQuestion('short_text')} style={addBtn}>+ Short text</button>
            </div>
          </div>

          {questions.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No questions yet. Add one above.</p>}

          {questions.map((q, idx) => (
            <QuestionEditor key={q.id} q={q} idx={idx} total={questions.length}
              onChange={patch => updateQuestion(q.id, patch)}
              onSave={() => saveQuestion(q)}
              onDelete={() => deleteQuestion(q.id)}
              onMove={dir => move(idx, dir)} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionEditor({ q, idx, total, onChange, onSave, onDelete, onMove }: {
  q: QuizQuestion; idx: number; total: number;
  onChange: (p: Partial<QuizQuestion>) => void; onSave: () => void; onDelete: () => void; onMove: (d: -1 | 1) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const typeLabel = q.type === 'mcq' ? 'Multiple choice' : q.type === 'true_false' ? 'True / False' : 'Short text';

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/chat/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (res.ok) { const d = await res.json(); onChange({ image_url: d.url }); }
  };

  const setOption = (i: number, v: string) => {
    const opts = [...(q.options ?? [])]; opts[i] = v; onChange({ options: opts });
  };
  const addOption = () => onChange({ options: [...(q.options ?? []), ''] });
  const removeOption = (i: number) => {
    const opts = (q.options ?? []).filter((_, j) => j !== i);
    let correct = Number(q.correct_answer);
    if (correct >= opts.length) correct = Math.max(0, opts.length - 1);
    onChange({ options: opts, correct_answer: correct });
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--cyan)', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '4px', padding: '0.15rem 0.5rem', textTransform: 'uppercase' }}>Q{idx + 1} · {typeLabel}</span>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button onClick={() => onMove(-1)} disabled={idx === 0} style={iconBtn}>↑</button>
          <button onClick={() => onMove(1)} disabled={idx === total - 1} style={iconBtn}>↓</button>
          <button onClick={onDelete} style={{ ...iconBtn, color: '#FF5555' }}>🗑</button>
        </div>
      </div>

      <textarea style={{ ...inputStyle, minHeight: '50px', resize: 'vertical' }} placeholder="Question prompt" value={q.prompt} onChange={e => onChange({ prompt: e.target.value })} onBlur={onSave} />

      {/* Image */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {q.image_url && <img src={q.image_url} alt="" style={{ maxHeight: '70px', borderRadius: '6px', border: '1px solid var(--border)' }} />}
        <label style={{ ...addBtn, cursor: 'pointer' }}>
          {uploading ? 'Uploading…' : q.image_url ? 'Replace image' : '+ Image'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f).then(onSave); }} />
        </label>
        {q.image_url && <button onClick={() => { onChange({ image_url: null }); onSave(); }} style={{ ...iconBtn, color: '#FF5555' }}>Remove</button>}
      </div>

      {/* Type-specific answer config */}
      {q.type === 'mcq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(q.options ?? []).map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="radio" name={`correct-${q.id}`} checked={Number(q.correct_answer) === i} onChange={() => { onChange({ correct_answer: i }); onSave(); }} style={{ accentColor: 'var(--cyan)' }} title="Mark correct" />
              <input style={{ ...inputStyle, flex: 1 }} placeholder={`Option ${i + 1}`} value={opt} onChange={e => setOption(i, e.target.value)} onBlur={onSave} />
              {(q.options?.length ?? 0) > 2 && <button onClick={() => { removeOption(i); onSave(); }} style={{ ...iconBtn, color: '#FF5555' }}>✕</button>}
            </div>
          ))}
          <button onClick={addOption} style={{ ...addBtn, alignSelf: 'flex-start' }}>+ Add option</button>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Select the radio next to the correct answer.</span>
        </div>
      )}

      {q.type === 'true_false' && (
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {[true, false].map(v => (
            <label key={String(v)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="radio" name={`tf-${q.id}`} checked={Boolean(q.correct_answer) === v} onChange={() => { onChange({ correct_answer: v }); onSave(); }} style={{ accentColor: 'var(--cyan)' }} />
              {v ? 'True' : 'False'}
            </label>
          ))}
        </div>
      )}

      {q.type === 'short_text' && (
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Short-text answers are graded manually after submission.</span>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        <div><label style={labelStyle}>Points</label><input type="number" min="0" style={inputStyle} value={q.points} onChange={e => onChange({ points: parseInt(e.target.value) || 0 })} onBlur={onSave} /></div>
        <div><label style={labelStyle}>Explanation (shown after answering)</label><input style={inputStyle} value={q.explanation ?? ''} onChange={e => onChange({ explanation: e.target.value })} onBlur={onSave} placeholder="Why this is the answer" /></div>
      </div>
    </div>
  );
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return { padding: '0.85rem', background: disabled ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', border: 'none', borderRadius: '9px', cursor: disabled ? 'not-allowed' : 'pointer' };
}
const addBtn: React.CSSProperties = { padding: '0.45rem 0.85rem', background: 'transparent', border: '1px dashed var(--cyan-border)', color: 'var(--cyan)', borderRadius: '7px', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.76rem', cursor: 'pointer' };
const iconBtn: React.CSSProperties = { padding: '0.3rem 0.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' };

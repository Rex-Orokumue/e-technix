'use client';
import { useState } from 'react';

interface AiField { key: string; label: string; }
interface AiInput { key: string; label: string; type?: 'text' | 'textarea'; required?: boolean; }
interface AiTemplate {
  enabled: boolean;
  layout: 'prose' | 'grid' | 'ladder' | 'table';
  intro?: string;
  fields?: AiField[];
  studentInputs?: AiInput[];
  coachingPrompt?: string;
}

const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.84rem', outline: 'none', lineHeight: 1.5 };
const primaryBtn = (on: boolean): React.CSSProperties => ({ padding: '0.55rem 1rem', background: on ? 'var(--cyan)' : 'rgba(0,200,255,0.15)', color: on ? '#070D1A' : 'var(--muted)', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', cursor: on ? 'pointer' : 'not-allowed' });
const errBox: React.CSSProperties = { padding: '0.55rem 0.85rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.8rem', color: '#FF5555' };

// Minimum words a student must write in a step before moving on — forces a real answer.
const MIN_WORDS = 8;
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export default function AssignmentAssistant({ assignment, onSubmitted }: { assignment: any; onSubmitted: () => void }) {
  const tpl: AiTemplate = assignment.ai_template;
  const isLadder = tpl.layout === 'ladder';
  const orderedFields = tpl.fields ?? [];

  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // one-shot modes
  const [prose, setProse] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string> | null>(null);
  // ladder step-by-step mode
  const [stepValues, setStepValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({}); // student typed in this step (not AI)
  const [stepIndex, setStepIndex] = useState(0); // how many steps generated
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const studentInputs = tpl.studentInputs ?? [];
  const required = studentInputs.filter(i => i.required);
  const canStart = required.every(i => (inputs[i.key] ?? '').trim().length > 0);

  // ── one-shot (prose / grid / table) ──
  const generate = async () => {
    if (!canStart || busy) return;
    setBusy(true); setError(''); setProse(null); setFields(null);
    try {
      const res = await fetch('/api/ai/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignment_id: assignment.id, studentInputs: inputs }) });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Failed to generate');
      else if (data.prose != null) setProse(data.prose);
      else if (data.fields) setFields(normalizeFields(tpl, data.fields));
      else if (data.raw != null) setProse(data.raw);
    } catch { setError('Connection error. Please try again.'); }
    finally { setBusy(false); }
  };

  // ── ladder: generate ONE next step from prior edited steps ──
  const generateStep = async () => {
    if (busy) return;
    const target = orderedFields[stepIndex];
    if (!target) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: assignment.id, studentInputs: inputs, priorFields: stepValues, targetFieldKey: target.key }),
      });
      const data = await res.json();
      const text = String(data.field ?? '').trim();
      if (!res.ok) setError(data.error ?? 'Failed to generate');
      else if (!text) setError('The assistant returned an empty step — please try again.');
      else { setStepValues(v => ({ ...v, [target.key]: text })); setTouched(t => ({ ...t, [target.key]: false })); setStepIndex(i => i + 1); }
    } catch { setError('Connection error. Please try again.'); }
    finally { setBusy(false); }
  };

  // Regenerate the LAST generated step in place (keeps it on screen), built from
  // the steps before it (using the student's current edits). Does NOT change stepIndex.
  const regenLastStep = async () => {
    if (busy || stepIndex === 0) return;
    const idx = stepIndex - 1;
    const target = orderedFields[idx];
    if (!target) return;
    const prior: Record<string, string> = {};
    for (let j = 0; j < idx; j++) {
      const k = orderedFields[j].key;
      prior[k] = stepValues[k] ?? '';
    }
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: assignment.id, studentInputs: inputs, priorFields: prior, targetFieldKey: target.key }),
      });
      const data = await res.json();
      const text = String(data.field ?? '').trim();
      if (!res.ok) setError(data.error ?? 'Failed to regenerate');
      else if (!text) setError('The assistant returned nothing — keep your current text or try again.');
      else { setStepValues(v => ({ ...v, [target.key]: text })); setTouched(t => ({ ...t, [target.key]: false })); }
    } catch { setError('Connection error. Please try again.'); }
    finally { setBusy(false); }
  };

  const serialize = () => {
    if (prose != null) return prose.trim();
    if (isLadder) return orderedFields.slice(0, stepIndex).map(f => `${f.label}:\n${stepValues[f.key] ?? ''}`).join('\n\n').trim();
    if (fields) return orderedFields.map(f => `${f.label}:\n${fields[f.key] ?? ''}`).join('\n\n').trim();
    return '';
  };

  const submit = async () => {
    const text = serialize();
    if (!text || submitting) return;
    setSubmitting(true); setSubmitError('');
    try {
      const res = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignment_id: assignment.id, drive_link: '', note: text }) });
      const data = await res.json();
      if (res.ok) onSubmitted();
      else setSubmitError(data.error || 'Failed to submit');
    } catch { setSubmitError('Connection error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (!tpl?.enabled) return null;

  // The most-recent step must be answered/edited (non-empty AND changed from the
  // AI's text) before the student can move on or submit — forces engagement.
  const lastKey = stepIndex > 0 ? orderedFields[stepIndex - 1]?.key : undefined;
  const lastVal = lastKey ? (stepValues[lastKey] ?? '').trim() : '';
  const lastWords = wordCount(lastVal);
  const lastEdited = !lastKey || (!!touched[lastKey] && lastWords >= MIN_WORDS);
  const canAdvance = stepIndex === 0 ? canStart : lastEdited;

  const ladderDone = isLadder && stepIndex >= orderedFields.length && orderedFields.length > 0;
  const oneShotReady = !isLadder && (prose != null || fields);
  const canSubmit = (ladderDone && lastEdited) || oneShotReady;

  return (
    <div style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: 'rgba(0,200,255,0.08)', border: '1px dashed var(--cyan-border)', borderRadius: '8px', color: 'var(--cyan)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>✨ Use AI Assistant</button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tpl.intro && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0, wordBreak: 'break-word' }}>{tpl.intro}</p>}

          {/* Student inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {studentInputs.map(inp => (
              <div key={inp.key}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>{inp.label}{inp.required ? ' *' : ''}</label>
                {inp.type === 'textarea'
                  ? <textarea value={inputs[inp.key] ?? ''} onChange={e => setInputs(s => ({ ...s, [inp.key]: e.target.value }))} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} disabled={isLadder && stepIndex > 0} />
                  : <input value={inputs[inp.key] ?? ''} onChange={e => setInputs(s => ({ ...s, [inp.key]: e.target.value }))} style={inputStyle} disabled={isLadder && stepIndex > 0} />}
              </div>
            ))}
          </div>
          {!canStart && <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: 0 }}>Fill in the required fields above to begin.</p>}
          {error && <div style={errBox}>{error}</div>}

          {/* ── LADDER: step-by-step ── */}
          {isLadder ? (
            <>
              {orderedFields.slice(0, stepIndex).map((f, i) => (
                <div key={f.key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', wordBreak: 'break-word' }}>{i + 1}. {f.label}</div>
                  <textarea value={stepValues[f.key] ?? ''} onChange={e => { setStepValues(v => ({ ...v, [f.key]: e.target.value })); setTouched(t => ({ ...t, [f.key]: true })); }} style={{ ...inputStyle, minHeight: '64px', resize: 'vertical', fontSize: '0.8rem' }} />
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {stepIndex < orderedFields.length && (
                  <button onClick={generateStep} disabled={!canAdvance || busy} style={primaryBtn(canAdvance && !busy)}>
                    {busy ? 'Thinking…' : stepIndex === 0 ? `Start: ${orderedFields[0]?.label}` : `Next step: ${orderedFields[stepIndex]?.label}`}
                  </button>
                )}
                {stepIndex > 0 && (
                  <button onClick={regenLastStep} disabled={busy} style={{ padding: '0.55rem 0.9rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.8rem', cursor: busy ? 'not-allowed' : 'pointer' }} title="Have the AI rewrite the most recent step">↻ Regenerate &ldquo;{orderedFields[stepIndex - 1]?.label}&rdquo;</button>
                )}
                <button onClick={() => setOpen(false)} style={{ padding: '0.55rem 0.9rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Close</button>
              </div>
              {stepIndex > 0 && !lastEdited && (
                <p style={{ fontSize: '0.74rem', color: '#F59E0B', margin: 0, fontWeight: 600 }}>✏️ Expand this step in your own words before you continue — at least {MIN_WORDS} words ({lastWords}/{MIN_WORDS} so far).</p>
              )}
              {stepIndex > 0 && lastEdited && stepIndex < orderedFields.length && (
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: 0 }}>Each step builds on what you keep. &ldquo;Regenerate&rdquo; only rewrites the most recent step.</p>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={generate} disabled={!canStart || busy} style={primaryBtn(canStart && !busy)}>{busy ? 'Generating…' : oneShotReady ? 'Regenerate' : 'Generate draft'}</button>
                <button onClick={() => setOpen(false)} style={{ padding: '0.55rem 0.9rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Close</button>
              </div>
              {prose != null && <textarea value={prose} onChange={e => setProse(e.target.value)} style={{ ...inputStyle, minHeight: '180px', resize: 'vertical' }} />}
              {fields && <LayoutView layout={tpl.layout} fields={orderedFields} values={fields} onChange={(k, v) => setFields(f => ({ ...(f ?? {}), [k]: v }))} />}
            </>
          )}

          {/* Submit */}
          {canSubmit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: 0 }}>Review and edit everything above — then submit it as your work.</p>
              {submitError && <div style={errBox}>{submitError}</div>}
              <button onClick={submit} disabled={submitting} style={{ alignSelf: 'flex-start', padding: '0.6rem 1.2rem', background: submitting ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Submitting…' : '📤 Submit this assignment'}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function normalizeFields(tpl: AiTemplate, raw: Record<string, any>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of tpl.fields ?? []) out[f.key] = raw[f.key] != null ? String(raw[f.key]) : '';
  return out;
}

function LayoutView({ layout, fields, values, onChange }: { layout: string; fields: AiField[]; values: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const box = (f: AiField) => (
    <div key={f.key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem', minWidth: 0 }}>
      <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', wordBreak: 'break-word' }}>{f.label}</div>
      <textarea value={values[f.key] ?? ''} onChange={e => onChange(f.key, e.target.value)} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', fontSize: '0.8rem' }} />
    </div>
  );
  if (layout === 'grid') return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem' }}>{fields.map(box)}</div>;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{fields.map(box)}</div>;
}

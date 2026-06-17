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

export default function AssignmentAssistant({ assignment, onUseDraft }: { assignment: any; onUseDraft: (text: string) => void }) {
  const tpl: AiTemplate = assignment.ai_template;
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [prose, setProse] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string> | null>(null);

  const studentInputs = tpl.studentInputs ?? [];
  const required = studentInputs.filter(i => i.required);
  const canGenerate = required.every(i => (inputs[i.key] ?? '').trim().length > 0);

  const generate = async () => {
    if (!canGenerate || busy) return;
    setBusy(true); setError(''); setProse(null); setFields(null);
    try {
      const res = await fetch('/api/ai/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignment_id: assignment.id, studentInputs: inputs }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to generate'); }
      else if (data.prose != null) setProse(data.prose);
      else if (data.fields) setFields(normalizeFields(tpl, data.fields));
      else if (data.raw != null) setProse(data.raw);
    } catch { setError('Connection error. Please try again.'); }
    finally { setBusy(false); }
  };

  const useDraft = () => {
    let text = '';
    if (prose != null) text = prose;
    else if (fields) text = (tpl.fields ?? []).map(f => `${f.label}:\n${fields[f.key] ?? ''}`).join('\n\n');
    onUseDraft(text.trim());
  };

  if (!tpl?.enabled) return null;

  return (
    <div style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: 'rgba(0,200,255,0.08)', border: '1px dashed var(--cyan-border)', borderRadius: '8px', color: 'var(--cyan)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>✨ Use AI Assistant</button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tpl.intro && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0, wordBreak: 'break-word' }}>{tpl.intro}</p>}

          {/* Student inputs — required before generating */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {studentInputs.map(inp => (
              <div key={inp.key}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>{inp.label}{inp.required ? ' *' : ''}</label>
                {inp.type === 'textarea'
                  ? <textarea value={inputs[inp.key] ?? ''} onChange={e => setInputs(s => ({ ...s, [inp.key]: e.target.value }))} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                  : <input value={inputs[inp.key] ?? ''} onChange={e => setInputs(s => ({ ...s, [inp.key]: e.target.value }))} style={inputStyle} />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={generate} disabled={!canGenerate || busy} style={{ padding: '0.55rem 1rem', background: (canGenerate && !busy) ? 'var(--cyan)' : 'rgba(0,200,255,0.15)', color: (canGenerate && !busy) ? '#070D1A' : 'var(--muted)', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', cursor: (canGenerate && !busy) ? 'pointer' : 'not-allowed' }}>{busy ? 'Generating…' : (prose != null || fields) ? 'Regenerate' : 'Generate draft'}</button>
            <button onClick={() => setOpen(false)} style={{ padding: '0.55rem 0.9rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Close</button>
          </div>
          {!canGenerate && <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: 0 }}>Fill in the required fields above to generate a draft.</p>}
          {error && <div style={{ padding: '0.55rem 0.85rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.8rem', color: '#FF5555' }}>{error}</div>}

          {/* Output */}
          {prose != null && (
            <textarea value={prose} onChange={e => setProse(e.target.value)} style={{ ...inputStyle, minHeight: '180px', resize: 'vertical' }} />
          )}
          {fields && <LayoutView layout={tpl.layout} fields={tpl.fields ?? []} values={fields} onChange={(k, v) => setFields(f => ({ ...(f ?? {}), [k]: v }))} />}

          {(prose != null || fields) && (
            <button onClick={useDraft} style={{ alignSelf: 'flex-start', padding: '0.55rem 1rem', background: 'var(--cyan)', color: '#070D1A', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Use this as my submission</button>
          )}
        </div>
      )}
    </div>
  );
}

// Ensure every template field has a string value (AI may omit some)
function normalizeFields(tpl: AiTemplate, raw: Record<string, any>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of tpl.fields ?? []) out[f.key] = raw[f.key] != null ? String(raw[f.key]) : '';
  return out;
}

function LayoutView({ layout, fields, values, onChange }: { layout: string; fields: AiField[]; values: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const box = (f: AiField, n?: number) => (
    <div key={f.key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem', minWidth: 0 }}>
      <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', wordBreak: 'break-word' }}>{n != null ? `${n}. ` : ''}{f.label}</div>
      <textarea value={values[f.key] ?? ''} onChange={e => onChange(f.key, e.target.value)} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', fontSize: '0.8rem' }} />
    </div>
  );

  if (layout === 'grid') {
    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem' }}>{fields.map(f => box(f))}</div>;
  }
  if (layout === 'ladder') {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{fields.map((f, i) => box(f, i + 1))}</div>;
  }
  // table / default → stacked rows
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{fields.map(f => box(f))}</div>;
}

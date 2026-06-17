'use client';

export interface AiField { key: string; label: string; }
export interface AiInput { key: string; label: string; type?: 'text' | 'textarea'; required?: boolean; }
export interface AiTemplate {
  enabled: boolean;
  layout: 'prose' | 'grid' | 'ladder' | 'table';
  intro: string;
  fields: AiField[];
  studentInputs: AiInput[];
  coachingPrompt: string;
}

export const emptyTemplate: AiTemplate = {
  enabled: false, layout: 'prose', intro: '', fields: [], studentInputs: [], coachingPrompt: '',
};

const BMC_PRESET: AiTemplate = {
  enabled: true,
  layout: 'grid',
  intro: 'Enter a business and the assistant will draft its Business Model Canvas. Edit every box before submitting.',
  coachingPrompt: 'Draft a Business Model Canvas for the business the student describes. Keep each box concise (bullet-style phrases). Base it strictly on the description/URL the student gave; where you lack information, write a short prompt telling them what to research and add.',
  fields: [
    { key: 'keyPartnerships', label: 'Key Partnerships' },
    { key: 'keyActivities', label: 'Key Activities' },
    { key: 'keyResources', label: 'Key Resources' },
    { key: 'valuePropositions', label: 'Value Propositions' },
    { key: 'customerRelationships', label: 'Customer Relationships' },
    { key: 'channels', label: 'Channels' },
    { key: 'customerSegments', label: 'Customer Segments' },
    { key: 'costStructure', label: 'Cost Structure' },
    { key: 'revenueStreams', label: 'Revenue Streams' },
  ],
  studentInputs: [
    { key: 'businessName', label: 'Business name', type: 'text', required: true },
    { key: 'description', label: 'Describe the business (what it does, who it serves)', type: 'textarea', required: true },
    { key: 'url', label: 'Website (optional)', type: 'text', required: false },
  ],
};

const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.84rem', outline: 'none' };
const labelStyle: React.CSSProperties = { fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'block' };
const smallBtn: React.CSSProperties = { padding: '0.35rem 0.7rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '6px', fontSize: '0.74rem', fontFamily: 'var(--font-head)', fontWeight: 600, cursor: 'pointer' };

export default function AiTemplateEditor({ value, onChange }: { value: AiTemplate; onChange: (t: AiTemplate) => void }) {
  const t = value;
  const set = (patch: Partial<AiTemplate>) => onChange({ ...t, ...patch });

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'rgba(255,255,255,0.02)' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
        <input type="checkbox" checked={t.enabled} onChange={e => set({ enabled: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: 'var(--cyan)' }} />
        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: t.enabled ? 'var(--text)' : 'var(--muted)' }}>✨ Enable AI Assistant for this assignment</span>
      </label>

      {t.enabled && (
        <>
          <button type="button" onClick={() => onChange({ ...BMC_PRESET })} style={{ ...smallBtn, alignSelf: 'flex-start', borderColor: 'var(--cyan-border)', color: 'var(--cyan)' }}>Load BMC preset</button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Layout</label>
              <select value={t.layout} onChange={e => set({ layout: e.target.value as AiTemplate['layout'] })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="prose" style={{ background: '#0f1829' }}>Prose (guided writing)</option>
                <option value="grid" style={{ background: '#0f1829' }}>Grid (canvas, e.g. BMC)</option>
                <option value="ladder" style={{ background: '#0f1829' }}>Ladder (steps, e.g. 5 Whys)</option>
                <option value="table" style={{ background: '#0f1829' }}>Table (columns, e.g. SCAMPER)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Intro (shown to student)</label>
            <input style={inputStyle} value={t.intro} onChange={e => set({ intro: e.target.value })} placeholder="One line about what this tool does" />
          </div>

          <div>
            <label style={labelStyle}>Coaching prompt (instructs the AI)</label>
            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={t.coachingPrompt} onChange={e => set({ coachingPrompt: e.target.value })} placeholder="How should the AI guide this deliverable? For external-tool builds (Notion/Sheets/Slides) say 'give guidance only, do not produce the artifact'." />
          </div>

          {/* Output fields (not for prose) */}
          {t.layout !== 'prose' && (
            <div>
              <label style={labelStyle}>Output fields (the labeled sections the AI fills)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {t.fields.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.4rem' }}>
                    <input style={{ ...inputStyle, flex: '0 0 30%' }} placeholder="key" value={f.key} onChange={e => { const fields = [...t.fields]; fields[i] = { ...f, key: e.target.value }; set({ fields }); }} />
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="Label" value={f.label} onChange={e => { const fields = [...t.fields]; fields[i] = { ...f, label: e.target.value }; set({ fields }); }} />
                    <button type="button" onClick={() => set({ fields: t.fields.filter((_, j) => j !== i) })} style={{ ...smallBtn, color: '#FF5555' }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => set({ fields: [...t.fields, { key: '', label: '' }] })} style={{ ...smallBtn, alignSelf: 'flex-start' }}>+ Add field</button>
              </div>
            </div>
          )}

          {/* Student inputs */}
          <div>
            <label style={labelStyle}>Student inputs (required before drafting)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {t.studentInputs.map((inp, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <input style={{ ...inputStyle, flex: '0 0 28%' }} placeholder="key" value={inp.key} onChange={e => { const si = [...t.studentInputs]; si[i] = { ...inp, key: e.target.value }; set({ studentInputs: si }); }} />
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="Label" value={inp.label} onChange={e => { const si = [...t.studentInputs]; si[i] = { ...inp, label: e.target.value }; set({ studentInputs: si }); }} />
                  <select value={inp.type ?? 'text'} onChange={e => { const si = [...t.studentInputs]; si[i] = { ...inp, type: e.target.value as 'text' | 'textarea' }; set({ studentInputs: si }); }} style={{ ...inputStyle, flex: '0 0 110px', cursor: 'pointer' }}>
                    <option value="text" style={{ background: '#0f1829' }}>text</option>
                    <option value="textarea" style={{ background: '#0f1829' }}>textarea</option>
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: 'var(--muted)' }}>
                    <input type="checkbox" checked={!!inp.required} onChange={e => { const si = [...t.studentInputs]; si[i] = { ...inp, required: e.target.checked }; set({ studentInputs: si }); }} style={{ accentColor: 'var(--cyan)' }} /> req
                  </label>
                  <button type="button" onClick={() => set({ studentInputs: t.studentInputs.filter((_, j) => j !== i) })} style={{ ...smallBtn, color: '#FF5555' }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={() => set({ studentInputs: [...t.studentInputs, { key: '', label: '', type: 'text', required: true }] })} style={{ ...smallBtn, alignSelf: 'flex-start' }}>+ Add input</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

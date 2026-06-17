'use client';
import { useState, useRef, useEffect } from 'react';

interface Msg { role: 'user' | 'model'; text: string; }

export default function AiTutor({ sessions, defaultSessionId }: { sessions: { id: string; title: string }[]; defaultSessionId?: string }) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(defaultSessionId ?? sessions[0]?.id ?? '');
  const [messages, setMessages] = useState<Msg[]>([{ role: 'model', text: "Hi! I'm your AI tutor. Ask me anything about this week's topic — I'll help you understand it." }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user' as const, text }];
    setMessages(next); setInput(''); setBusy(true);
    try {
      const res = await fetch('/api/ai/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, messages: next }) });
      const data = await res.json();
      setMessages(m => [...m, { role: 'model', text: res.ok ? data.reply : (data.error ?? 'Something went wrong.') }]);
    } catch {
      setMessages(m => [...m, { role: 'model', text: 'Connection error. Please try again.' }]);
    } finally { setBusy(false); }
  };

  return (
    <>
      <style>{`
        .tutor-fab { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--cyan); color: #070D1A; border: none; font-size: 22px; cursor: pointer; z-index: 40; box-shadow: 0 8px 24px rgba(0,200,255,0.35); }
        .tutor-panel { position: fixed; bottom: 92px; right: 24px; width: 360px; height: 520px; max-width: calc(100vw - 32px); max-height: calc(100vh - 130px); background: var(--surface); border: 1px solid var(--border); border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; z-index: 41; box-shadow: 0 16px 48px rgba(0,0,0,0.5); }
        @media (max-width: 640px){ .tutor-panel{ right: 16px; left: 16px; width: auto; } }
      `}</style>
      <button className="tutor-fab" onClick={() => setOpen(o => !o)} aria-label="AI Tutor">{open ? '✕' : '🤖'}</button>
      {open && (
        <div className="tutor-panel">
          <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <strong style={{ fontFamily: 'var(--font-head)', fontSize: '0.9rem' }}>🤖 AI Tutor</strong>
            <select value={sessionId} onChange={e => setSessionId(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontSize: '0.78rem', padding: '0.35rem 0.5rem', outline: 'none' }}>
              {sessions.map(s => <option key={s.id} value={s.id} style={{ background: '#0f1829' }}>{s.title}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '0.55rem 0.8rem', borderRadius: '12px', fontSize: '0.84rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: m.role === 'user' ? 'rgba(0,200,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${m.role === 'user' ? 'var(--cyan-border)' : 'var(--border)'}` }}>{m.text}</div>
            ))}
            {busy && <div style={{ alignSelf: 'flex-start', fontSize: '0.78rem', color: 'var(--muted)', fontStyle: 'italic' }}>Tutor is thinking…</div>}
            <div ref={endRef} />
          </div>
          <div style={{ padding: '0.6rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.4rem' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder="Ask a question…" disabled={busy}
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.84rem', padding: '0.5rem 0.7rem', outline: 'none' }} />
            <button onClick={send} disabled={busy || !input.trim()} style={{ padding: '0.5rem 0.9rem', background: 'var(--cyan)', color: '#070D1A', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

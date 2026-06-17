# AI Learning Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Gemini-powered AI tutor and a generalized AI assignment assistant to the student hub, grounded in per-session teaching content, with all AI calls server-proxied and rate-limited.

**Architecture:** Next.js 16 App Router on Supabase. A shared server-only Gemini client (`src/lib/ai.ts`) is used by three server routes (`/api/ai/tutor`, `/api/ai/assist`, `/api/ai/brief`). Sessions gain `teaching_script`/`teaching_brief`; assignments gain an `ai_template` jsonb that drives a generalized assistant UI (prose/grid/ladder/table layouts). A new `ai_usage` table powers per-student rate limiting. Auth follows the existing student-session-first / admin-cookie-fallback pattern (see `src/app/api/submissions/route.ts`).

**Tech Stack:** Next.js 16, React, TypeScript, Supabase (Postgres + service-role client), Google Gemini REST API (free tier), Supabase MCP for schema (`mcp__7a39a9fe-...__apply_migration`).

**Provider config:** `GEMINI_API_KEY` and `GEMINI_MODEL` (default `gemini-2.0-flash`) as server env vars. Project ref for Supabase MCP: `ktdtjkbohiubqhhngcjt`.

**Testing approach:** This repo has no unit-test framework (package.json scripts: `dev`, `build`, `start`, `lint`). Each task is verified with `npx tsc --noEmit` and, where noted, a manual browser/curl check. `next build` cannot run locally (Windows lacks the Turbopack native binding) — Vercel builds on push. Commit after each task.

---

## File Structure

**New — schema (Supabase MCP, no local files):**
- Migration `ai_layer_columns_and_usage`: adds session/assignment columns + `ai_usage` table.

**New — server libs:**
- `src/lib/ai.ts` — Gemini client wrapper (fetch + backoff + env config). Server-only.
- `src/lib/rate-limit.ts` — per-student count-based throttle over `ai_usage`.

**New — API routes:**
- `src/app/api/ai/tutor/route.ts` — POST student tutor chat.
- `src/app/api/ai/assist/route.ts` — POST assignment draft generation.
- `src/app/api/ai/brief/route.ts` — POST admin script→brief condensation.

**New — student UI:**
- `src/components/hub/AiTutor.tsx` — floating tutor button + panel.
- `src/components/hub/AssignmentAssistant.tsx` — inputs form + 4 layouts + inline edit.

**Modified:**
- `src/app/hub/page.tsx` — mount `<AiTutor>`; render `<AssignmentAssistant>` inside each assignment card that has a template.
- `src/app/api/sessions/route.ts` + `src/app/api/sessions/[id]/route.ts` — accept `teaching_script`; trigger brief generation.
- `src/app/admin/sessions/new/page.tsx` + the session edit form — add `teaching_script` textarea.
- The admin assignment builder (`src/app/admin/assignments/new` + `[id]`) — add an `ai_template` editor.
- `.env.local` (developer) + Vercel env — `GEMINI_API_KEY`, `GEMINI_MODEL`.

---

## Task 1: Database schema

**Files:** Supabase migration via MCP.

- [ ] **Step 1: Apply the migration**

Use `mcp__7a39a9fe-...__apply_migration`, project_id `ktdtjkbohiubqhhngcjt`, name `ai_layer_columns_and_usage`:

```sql
alter table sessions add column if not exists teaching_script text;
alter table sessions add column if not exists teaching_brief text;
alter table assignments add column if not exists ai_template jsonb;

create table if not exists ai_usage (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  kind text not null,            -- 'tutor' | 'assist' | 'brief'
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_usage_student_time on ai_usage(student_id, created_at);

alter table ai_usage enable row level security;
grant select, insert, update, delete on table ai_usage to service_role;
```

- [ ] **Step 2: Verify** — run `mcp__7a39a9fe-...__execute_sql`: `select column_name from information_schema.columns where table_name='sessions' and column_name like 'teaching%';` Expected: `teaching_script`, `teaching_brief`. And confirm `ai_usage` in `list_tables`.

> Note: `grant ... to service_role` is included because MCP-created tables do NOT inherit Supabase's default role grants (learned from the quiz tables — without it, the service-role client gets "permission denied").

- [ ] **Step 3:** No local files changed; nothing to commit.

---

## Task 2: Gemini client wrapper

**Files:**
- Create: `src/lib/ai.ts`

- [ ] **Step 1: Write the file**

```typescript
// Server-only Gemini REST client. Never import into client components.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function endpoint() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
}

export interface GeminiTurn { role: 'user' | 'model'; text: string; }

interface GenerateOpts {
  system?: string;
  turns: GeminiTurn[];
  json?: boolean;        // request application/json response
  maxRetries?: number;
}

// Returns the model's text reply. Retries 429/5xx with exponential backoff.
export async function geminiGenerate({ system, turns, json, maxRetries = 3 }: GenerateOpts): Promise<string> {
  const body: any = {
    contents: turns.map(t => ({ role: t.role, parts: [{ text: t.text }] })),
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  if (json) body.generationConfig = { responseMimeType: 'application/json' };

  let delay = 800;
  let lastErr: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`Gemini ${res.status}`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== 'string') throw new Error('Gemini: empty response');
      return text;
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw lastErr ?? new Error('Gemini: failed');
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit`. Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai.ts
git commit -m "Add server-only Gemini client wrapper"
```

---

## Task 3: Rate limiter

**Files:**
- Create: `src/lib/rate-limit.ts`

- [ ] **Step 1: Write the file**

```typescript
import { createAdminClient } from '@/lib/supabase/admin';

// Defaults tuned for Gemini free tier with a cohort. Override per call if needed.
const PER_MINUTE = 8;
const PER_DAY = 120;

export interface RateResult { ok: boolean; reason?: string; }

// Checks the student's recent ai_usage counts, and if allowed, records this use.
export async function checkAndRecord(studentId: string, kind: 'tutor' | 'assist' | 'brief'): Promise<RateResult> {
  const supabase = createAdminClient();
  const now = Date.now();
  const minuteAgo = new Date(now - 60_000).toISOString();
  const dayAgo = new Date(now - 86_400_000).toISOString();

  const { count: perMin } = await supabase
    .from('ai_usage').select('id', { count: 'exact', head: true })
    .eq('student_id', studentId).gte('created_at', minuteAgo);
  if ((perMin ?? 0) >= PER_MINUTE) return { ok: false, reason: 'Too many requests — wait a moment and try again.' };

  const { count: perDay } = await supabase
    .from('ai_usage').select('id', { count: 'exact', head: true })
    .eq('student_id', studentId).gte('created_at', dayAgo);
  if ((perDay ?? 0) >= PER_DAY) return { ok: false, reason: "You've reached today's AI usage limit. Try again tomorrow." };

  await supabase.from('ai_usage').insert({ student_id: studentId, kind });
  return { ok: true };
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit`. Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/rate-limit.ts
git commit -m "Add per-student AI rate limiter over ai_usage"
```

---

## Task 4: Brief-generation route (admin)

**Files:**
- Create: `src/app/api/ai/brief/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { geminiGenerate } from '@/lib/ai';

const SYSTEM = `You condense a teaching session script into a compact study brief for an AI tutor. Output plain text (no markdown headers). Capture: key concepts, definitions, frameworks named, and concrete examples used. Keep it under 400 words. Be faithful to the script — do not add content that was not taught.`;

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { session_id, script } = await req.json();
  const text = (script ?? '').trim();
  if (!session_id || !text) return NextResponse.json({ error: 'session_id and script required' }, { status: 400 });

  let brief = '';
  try {
    brief = await geminiGenerate({
      system: SYSTEM,
      turns: [{ role: 'user', text: `Condense this session script into a brief:\n\n${text}` }],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to generate brief' }, { status: 502 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('sessions')
    .update({ teaching_script: text, teaching_brief: brief.trim() }).eq('id', session_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ teaching_brief: brief.trim() });
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit`. Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/ai/brief/route.ts
git commit -m "Add admin AI brief-generation route"
```

---

## Task 5: Tutor route (student)

**Files:**
- Create: `src/app/api/ai/tutor/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { geminiGenerate, type GeminiTurn } from '@/lib/ai';
import { checkAndRecord } from '@/lib/rate-limit';

const MAX_TURNS = 12; // cap history sent to keep tokens small

export async function POST(req: NextRequest) {
  const ssr = await createClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gate = await checkAndRecord(user.id, 'tutor');
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 429 });

  const { session_id, messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0)
    return NextResponse.json({ error: 'messages required' }, { status: 400 });

  const supabase = createAdminClient();
  let context = '';
  if (session_id) {
    const { data: s } = await supabase
      .from('sessions').select('title, description, teaching_brief').eq('id', session_id).single();
    if (s) context = s.teaching_brief?.trim()
      ? `Session topic: ${s.title}\n\nTeaching brief:\n${s.teaching_brief}`
      : `Session topic: ${s.title}\n${s.description ?? ''}`;
  }

  const system = `You are an encouraging, concise tutor for the E-Technix Phase 1 program (Digital & Business Foundations). Answer ONLY using ideas consistent with what was taught (below). Guide the student to understanding — explain, give examples, ask a clarifying question when useful — but do NOT write their assignment for them. Keep replies to 1-3 short paragraphs.\n\n${context || 'No specific session context available; answer generally within the program scope.'}`;

  const turns: GeminiTurn[] = (messages as any[]).slice(-MAX_TURNS).map(m => ({
    role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
    text: String(m.text ?? m.content ?? ''),
  }));

  try {
    const reply = await geminiGenerate({ system, turns });
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: 'The tutor is busy right now. Please try again in a moment.' }, { status: 502 });
  }
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit`. Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/ai/tutor/route.ts
git commit -m "Add student AI tutor route (grounded, rate-limited)"
```

---

## Task 6: Assignment-assist route (student)

**Files:**
- Create: `src/app/api/ai/assist/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { geminiGenerate } from '@/lib/ai';
import { checkAndRecord } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ssr = await createClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gate = await checkAndRecord(user.id, 'assist');
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 429 });

  const { assignment_id, studentInputs } = await req.json();
  if (!assignment_id) return NextResponse.json({ error: 'assignment_id required' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: a } = await supabase
    .from('assignments').select('title, description, ai_template, phase, week').eq('id', assignment_id).single();
  if (!a?.ai_template?.enabled) return NextResponse.json({ error: 'No assistant configured for this assignment' }, { status: 400 });

  const tpl = a.ai_template as {
    layout: string; fields?: { key: string; label: string }[]; coachingPrompt?: string;
  };

  // Pull the most relevant teaching brief for grounding (same phase+week).
  const { data: sess } = await supabase
    .from('sessions').select('teaching_brief').eq('phase', a.phase).eq('week', a.week)
    .not('teaching_brief', 'is', null).limit(1).maybeSingle();
  const brief = sess?.teaching_brief ? `\n\nTeaching context:\n${sess.teaching_brief}` : '';

  const inputsText = Object.entries(studentInputs ?? {})
    .map(([k, v]) => `${k}: ${v}`).join('\n');

  const isProse = tpl.layout === 'prose';
  let system: string, json = false;

  if (isProse) {
    system = `You are a coaching assistant for an E-Technix assignment: "${a.title}". ${a.description ?? ''} ${tpl.coachingPrompt ?? ''} Use the student's input to produce a strong first draft they will edit. Guide and scaffold — keep it in the student's voice, do not invent facts they didn't provide.${brief}`;
  } else {
    const fieldList = (tpl.fields ?? []).map(f => `"${f.key}" (${f.label})`).join(', ');
    system = `You are a coaching assistant for an E-Technix assignment: "${a.title}". ${tpl.coachingPrompt ?? ''} Produce a JSON object with EXACTLY these keys: ${fieldList}. Each value is concise text for that section, based on the student's input. Do not invent facts the student didn't provide; where information is missing, give a brief prompt of what they should add.${brief}`;
    json = true;
  }

  try {
    const out = await geminiGenerate({
      system,
      turns: [{ role: 'user', text: `Student input:\n${inputsText || '(none provided)'}` }],
      json,
    });
    if (json) {
      let parsed: any;
      try { parsed = JSON.parse(out); }
      catch { return NextResponse.json({ raw: out }); } // fall back to raw text
      return NextResponse.json({ fields: parsed });
    }
    return NextResponse.json({ prose: out });
  } catch (e: any) {
    return NextResponse.json({ error: 'The assistant is busy right now. Please try again in a moment.' }, { status: 502 });
  }
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit`. Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/ai/assist/route.ts
git commit -m "Add student AI assignment-assist route (layout-aware)"
```

---

## Task 7: Floating AI Tutor component

**Files:**
- Create: `src/components/hub/AiTutor.tsx`
- Modify: `src/app/hub/page.tsx` (mount the component + pass current session id)

- [ ] **Step 1: Create `AiTutor.tsx`**

A `'use client'` floating button + panel, mirroring the structure/visual language of `src/components/hub/ChatTab.tsx` (cyan accents, `var(--surface)`, fixed position bottom-right). Props: `{ sessions: { id: string; title: string }[]; defaultSessionId?: string }`.

Behavior:
- Floating 🤖 FAB bottom-right (`position: fixed; z-index: 40`). Click toggles a panel (~360×520, `position: fixed; bottom: 90px; right: 24px`).
- A small `<select>` at the top lets the student choose which session topic to ground on (defaults to `defaultSessionId`).
- Message list + input. On send: append the user message, POST `/api/ai/tutor` with `{ session_id, messages }` (messages = `[{role,text}]` history), append the `reply`. On `429`/error, show the returned `error` text as a system bubble.
- Mobile: panel becomes full-width minus margins. Reuse the `renderContent` link-detection idea from ChatTab if convenient (optional).

```tsx
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
```

- [ ] **Step 2: Mount it in `src/app/hub/page.tsx`**

Add import at top: `import AiTutor from '@/components/hub/AiTutor';`

Just before the final closing of the `HubShell` children (find where the content wrap `</div>` closes inside `<HubShell>`), render the tutor with the loaded sessions. Use the existing `sessions` state and the `upcomingSession` (or most recent) for the default:

```tsx
{student && sessions.length > 0 && (
  <AiTutor
    sessions={sessions.map((s: any) => ({ id: s.id, title: s.title }))}
    defaultSessionId={(upcomingSession ?? sessions[0])?.id}
  />
)}
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit` (exit 0). Manual (after env key set): open hub, click 🤖, ask a question, confirm a grounded reply.

- [ ] **Step 4: Commit**

```bash
git add src/components/hub/AiTutor.tsx src/app/hub/page.tsx
git commit -m "Add floating AI tutor to student hub"
```

---

## Task 8: Assignment Assistant component

**Files:**
- Create: `src/components/hub/AssignmentAssistant.tsx`
- Modify: `src/app/hub/page.tsx` (render inside each assignment card whose `ai_template.enabled`)

- [ ] **Step 1: Create `AssignmentAssistant.tsx`** (`'use client'`)

Props: `{ assignment: any; onUseDraft: (text: string) => void }` where `assignment.ai_template` has `{ enabled, layout, intro, fields, studentInputs, coachingPrompt }`.

Behavior:
1. Collapsed by default behind a "✨ Use AI Assistant" button (so it doesn't dominate the card).
2. When opened, render a form for `ai_template.studentInputs` (text/textarea per `type`). A "Generate draft" button is disabled until all `required` inputs are filled — **this enforces the "real input first" rule**.
3. On generate: POST `/api/ai/assist` `{ assignment_id, studentInputs }`.
   - `prose` layout → response `{ prose }`: render an editable `<textarea>` prefilled with it.
   - structured layouts (`grid`/`ladder`/`table`) → response `{ fields }`: render each `ai_template.fields[].label` with an editable `<textarea>` prefilled from `fields[key]`. Layout styling:
     - `grid` → CSS grid of labeled boxes (BMC look): `gridTemplateColumns: repeat(auto-fit, minmax(150px, 1fr))`.
     - `ladder` → vertical stacked numbered boxes.
     - `table` → stacked labeled rows (single column on mobile).
   - `{ raw }` fallback → show raw text in one editable textarea.
   - `429`/error → inline message with the returned `error`.
4. A "Use this as my submission" button serializes the current (edited) fields/prose into a single text block and calls `onUseDraft(text)` — the parent puts it into the assignment submission note/content. Serialization: prose → the text; structured → `"<label>:\n<value>"` joined by blank lines.

Use the same `inputStyle` conventions as the hub. Keep all four layouts in this one component (small helper render functions), `box-sizing: border-box` and `wordBreak: break-word` throughout to avoid horizontal overflow (lesson from the quiz tab).

- [ ] **Step 2: Wire into `src/app/hub/page.tsx`**

Inside the assignments tab, within each assignment card render (the block that maps assignments — search for where `a.guidelines` / the submit form per assignment is), add, when `a.ai_template?.enabled`:

```tsx
{a.ai_template?.enabled && (
  <AssignmentAssistant
    assignment={a}
    onUseDraft={(text) => setAForm(f => ({ ...f, assignment_id: a.id, note: text }))}
  />
)}
```

Add import: `import AssignmentAssistant from '@/components/hub/AssignmentAssistant';`

> `setAForm` and the `aForm` submission form already exist in the assignments tab (drive_link + note). The draft lands in `note`; the student still adds their Drive link and submits through the existing flow. If a different wiring fits the actual JSX better, prefer putting the draft where the student's written deliverable goes.

- [ ] **Step 3: Verify** — `npx tsc --noEmit` (exit 0). Manual: configure a test assignment template (Task 9), open it as a student, fill inputs, generate, edit, "use as submission".

- [ ] **Step 4: Commit**

```bash
git add src/components/hub/AssignmentAssistant.tsx src/app/hub/page.tsx
git commit -m "Add AI assignment assistant (layout-aware, input-gated) to hub"
```

---

## Task 9: Admin — assignment `ai_template` editor

**Files:**
- Modify: the admin assignment builder. First locate it:
  `ls src/app/admin/assignments` → expect `new/page.tsx` and `[id]/...`. Inspect the form to match its `form`/`set` state pattern (mirror `src/app/admin/sessions/new/page.tsx`).

- [ ] **Step 1: Add an AI template editor to the assignment form**

Add state `aiTemplate` with shape:

```typescript
type AiField = { key: string; label: string };
type AiInput = { key: string; label: string; type?: 'text' | 'textarea'; required?: boolean };
interface AiTemplate {
  enabled: boolean;
  layout: 'prose' | 'grid' | 'ladder' | 'table';
  intro: string;
  fields: AiField[];
  studentInputs: AiInput[];
  coachingPrompt: string;
}
```

UI (only the essentials, styled like the rest of the form):
- A checkbox "Enable AI Assistant for this assignment" → toggles `enabled`.
- When enabled: a `layout` `<select>` (prose/grid/ladder/table); an `intro` text input; a `coachingPrompt` textarea; a repeatable list editor for `fields` (key + label rows, add/remove) — only shown when layout ≠ `prose`; a repeatable list editor for `studentInputs` (key + label + type select + required checkbox, add/remove).
- Provide a **"Load BMC preset"** button that fills: layout `grid`; fields = the 9 BMC boxes (`keyPartnerships/Key Partnerships`, `keyActivities/Key Activities`, `keyResources/Key Resources`, `valuePropositions/Value Propositions`, `customerRelationships/Customer Relationships`, `channels/Channels`, `customerSegments/Customer Segments`, `costStructure/Cost Structure`, `revenueStreams/Revenue Streams`); studentInputs = `businessName` (text, required), `description` (textarea, required), `url` (text, optional); a sensible `coachingPrompt`. This gives the instructor the BMC "hero" tool in one click and a worked example to copy for other frameworks.

- [ ] **Step 2: Include `ai_template` in the POST/PATCH body**

In the assignment create/edit submit handler, add to the JSON body:
`ai_template: aiTemplate.enabled ? aiTemplate : null`

The existing assignments API (`POST /api/assignments`, `PATCH /api/assignments/[id]`) inserts the whole body, so `ai_template` persists with no API change needed. Verify by reading `src/app/api/assignments/route.ts` (it does `insert(body)`).

- [ ] **Step 3: Verify** — `npx tsc --noEmit` (exit 0). Manual: create an assignment, click "Load BMC preset", save, confirm in DB the `ai_template` jsonb is stored (`execute_sql: select ai_template from assignments where ...`).

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/assignments
git commit -m "Add AI template editor (with BMC preset) to assignment builder"
```

---

## Task 10: Admin — session `teaching_script` field + brief generation

**Files:**
- Modify: `src/app/admin/sessions/new/page.tsx` and the session edit form (find via `ls src/app/admin/sessions`).
- Modify: `src/app/api/sessions/route.ts`, `src/app/api/sessions/[id]/route.ts` (accept `teaching_script`).

- [ ] **Step 1: Add a `teaching_script` textarea to the session forms**

In the new/edit session form state, add `teaching_script` (string). Add a labeled textarea "Teaching script (for the AI tutor)" with helper text "Paste the full session script. We'll condense it into a brief the AI tutor uses to answer student questions." Include `teaching_script` in the POST/PATCH body.

- [ ] **Step 2: Confirm the sessions API persists it**

`src/app/api/sessions/route.ts` POST does `insert(sessionData)` (after stripping `notify`), and `[id]` PATCH updates the body — so `teaching_script` persists with no schema-side change. Read both files to confirm; if PATCH whitelists fields, add `teaching_script`.

- [ ] **Step 3: Generate the brief after save (client-side trigger)**

After a successful session create/edit where `teaching_script` is non-empty, call:

```tsx
await fetch('/api/ai/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: savedSessionId, script: teaching_script }) });
```

For **new** sessions, `savedSessionId` is the `id` from the POST response (`/api/sessions` returns the inserted row `.select().single()`). For **edit**, it's the existing id. Show a small "Generating AI brief…" state; failure is non-fatal (the tutor falls back to title/description) — surface a soft warning, don't block navigation.

- [ ] **Step 4: Verify** — `npx tsc --noEmit` (exit 0). Manual (with env key): create a session with a script, confirm `execute_sql: select teaching_brief from sessions where id=...` is populated.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/sessions src/app/api/sessions
git commit -m "Add session teaching script + AI brief generation on save"
```

---

## Task 11: Environment + docs

**Files:**
- Modify: `.env.local` (local dev) — add the keys. Also document in a comment.

- [ ] **Step 1: Add env vars locally**

Append to `.env.local`:

```
GEMINI_API_KEY=your_google_ai_studio_key_here
GEMINI_MODEL=gemini-2.0-flash
```

- [ ] **Step 2: Set the same vars in Vercel** (project settings → Environment Variables). This is a manual dashboard step — note it for the user; the app returns a clear "GEMINI_API_KEY is not set" error until done.

- [ ] **Step 3:** No commit (`.env.local` is gitignored). Done.

---

## Task 12: Final verify + push

- [ ] **Step 1:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 2:** `git push origin main`.
- [ ] **Step 3:** After Vercel deploy + env vars set, manual smoke test: (a) admin adds a teaching script to a session → brief generates; (b) student opens tutor, asks a question → grounded answer; (c) admin enables BMC preset on an assignment; (d) student opens it, enters business name+description, generates the canvas, edits, uses as submission.

---

## Notes for the implementer

- **Auth pattern:** student routes check `createClient()` `auth.getUser()` first; admin-only routes check `isAdminAuthenticated()`. Matches `src/app/api/submissions/route.ts`. Don't deviate.
- **Next 16 params:** dynamic route handlers take `params` as a Promise — `const { id } = await params;`.
- **Service-role grants:** any NEW table created via MCP needs an explicit `grant ... to service_role` (done in Task 1) or inserts fail with "permission denied".
- **`ai.ts` is server-only:** never import it into a `'use client'` file — it reads `GEMINI_API_KEY`.
- **Overflow lesson:** in all new UI use `box-sizing: border-box`, `min-width: 0`, `word-break: break-word`, and `repeat(auto-fit, minmax(...))` for grids, to avoid the horizontal-scroll issues fixed in the quiz tab.
- **Free-tier reality:** keep history/context small (briefs not full scripts; capped turns). The rate limiter is the guardrail; don't remove it.
- **Coach, don't cheat:** system prompts deliberately scaffold rather than hand over finished work, and the assistant requires student input before drafting — this is a product requirement, not a nicety.

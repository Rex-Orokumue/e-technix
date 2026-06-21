# Curriculum Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public `/curriculum` page driven by the v3 master curriculum, with email-gated session detail and a premium per-lead watermarked PDF, capturing leads in Supabase.

**Architecture:** A single typed data module (`curriculum.ts`) is the source of truth for both the page and the PDF. The page server component reads an unlock cookie and only serializes gated session detail when unlocked. A public lead API stores the email and sets the cookie; a PDF API looks the lead up and streams a branded, watermarked PDF rendered with `@react-pdf/renderer`. UI follows the existing inline-style + CSS-variable + `_client.tsx` pattern.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (`@supabase/supabase-js` service-role), `@react-pdf/renderer`, Vitest (new, for pure-logic tests).

**Spec:** `docs/superpowers/specs/2026-06-19-curriculum-section-design.md`

**Content source:** the v3 doc `ETechnix_Master_Curriculum_v3.docx`. Full extracted text is reproduced in this conversation's history; if unavailable, re-extract with:
```bash
cd /tmp && rm -rf dx && mkdir dx && cd dx && unzip -oq "/c/Users/gorok/Downloads/ETechnix_Master_Curriculum_v3.docx" && python3 -c "import re;x=open('word/document.xml',encoding='utf-8').read();paras=re.split(r'</w:p>',x);out=[''.join(re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>',p)).replace('&amp;','&').replace('&quot;','\"').replace('&apos;',chr(39)).strip() for p in paras];open(r'C:\\Users\\gorok\\e-technix\\.curtmp.txt','w',encoding='utf-8').write('\n'.join(l for l in out if l))"
```

---

## File Structure

**Create:**
- `src/lib/data/curriculum.ts` — typed source of truth (programme meta + 10 tracks). Also exports `publicTrack()` projection helper.
- `src/lib/data/curriculum.test.ts` — data integrity + projection tests.
- `src/lib/curriculum-pdf.tsx` — `renderCurriculumPdf(lead)` → PDF Buffer (isolated rendering).
- `src/lib/curriculum-lead.ts` — `isValidEmail()` + `insertLead()` helper (testable validation).
- `src/lib/curriculum-lead.test.ts` — email validation tests.
- `src/app/api/curriculum/lead/route.ts` — `POST` lead capture, sets unlock cookie.
- `src/app/api/curriculum/pdf/route.ts` — `GET` watermarked PDF (cookie-gated).
- `src/app/curriculum/page.tsx` — server component (reads cookie, builds gated props).
- `src/app/curriculum/_client.tsx` — the page UI.
- `src/components/curriculum/CurriculumUnlockModal.tsx` — email-gate modal.
- `vitest.config.ts` — Vitest config (node environment, pure-logic tests only).
- `supabase/migrations/2026-06-19-curriculum-leads.sql` — table migration (run manually in Supabase).

**Modify:**
- `package.json` — add `@react-pdf/renderer`, `vitest`, and a `test` script.
- `src/components/layout/Navbar.tsx:7-14` — add `{ href: '/curriculum', label: 'Curriculum' }`.

**Constants shared across files:**
- Cookie name: `etx_curr_unlock` (value = lead UUID).

---

## Task 1: Tooling — Vitest + @react-pdf/renderer, verify React 19 compatibility

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/_smoke.test.ts` (temporary smoke test, deleted in Step 6)

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm install @react-pdf/renderer
npm install -D vitest
```
Expected: installs succeed. If `@react-pdf/renderer` reports a React 19 peer conflict that blocks install, retry with `npm install @react-pdf/renderer --legacy-peer-deps` and note it in the commit message.

- [ ] **Step 2: Add the test script to package.json**

In `package.json` `"scripts"`, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
```

- [ ] **Step 4: Create a smoke test that also proves @react-pdf renders under this runtime**

Create `src/lib/_smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToBuffer, Document, Page, Text } from '@react-pdf/renderer';

describe('toolchain', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });

  it('renders a PDF buffer with @react-pdf/renderer', async () => {
    const doc = React.createElement(
      Document,
      null,
      React.createElement(Page, null, React.createElement(Text, null, 'hello')),
    );
    const buf = await renderToBuffer(doc as any);
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 4).toString('latin1')).toBe('%PDF');
  });
});
```

- [ ] **Step 5: Run the smoke test**

Run: `npm test`
Expected: both tests PASS. The PDF test proves `@react-pdf/renderer` works in this Node/React 19 setup. **If the PDF test fails at import or render**, stop and switch the PDF implementation (Task 6) to `pdf-lib` (`npm install pdf-lib`), keeping the same `renderCurriculumPdf` interface; update this plan's Task 6 accordingly.

- [ ] **Step 6: Delete the smoke test and commit**

```bash
rm src/lib/_smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest + @react-pdf/renderer, verify React 19 PDF rendering"
```

---

## Task 2: Curriculum data module + integrity test

**Files:**
- Create: `src/lib/data/curriculum.ts`
- Test: `src/lib/data/curriculum.test.ts`

- [ ] **Step 1: Write the failing integrity test first**

Create `src/lib/data/curriculum.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { TRACKS, PROGRAMME, publicTrack } from './curriculum';

describe('curriculum data', () => {
  it('has all 10 tracks with unique codes and slugs', () => {
    expect(TRACKS).toHaveLength(10);
    const codes = new Set(TRACKS.map(t => t.code));
    const slugs = new Set(TRACKS.map(t => t.slug));
    expect(codes.size).toBe(10);
    expect(slugs.size).toBe(10);
    expect(codes.has('DT-101')).toBe(true);
  });

  it('every track is well-formed', () => {
    for (const t of TRACKS) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(['enrolling', 'coming_soon', 'advanced']).toContain(t.status);
      expect(['cyan', 'orange']).toContain(t.accent);
      expect(t.summary.length).toBeGreaterThan(20);
      expect(t.outcomes.length).toBeGreaterThan(0);
      expect(t.careerPaths.length).toBeGreaterThan(0);
      expect(t.weeks.length).toBeGreaterThan(0);
      for (const w of t.weeks) {
        expect(w.title.length).toBeGreaterThan(0);
        expect(w.deliverable.length).toBeGreaterThan(0);
      }
    }
  });

  it('Phase 1 has 8 weeks; standard specialisations have 12', () => {
    const p1 = TRACKS.find(t => t.code === 'DT-101')!;
    expect(p1.weeks).toHaveLength(8);
    const da = TRACKS.find(t => t.code === 'DA-201')!;
    expect(da.weeks).toHaveLength(12);
  });

  it('PROGRAMME has the tagline and philosophy', () => {
    expect(PROGRAMME.tagline.toLowerCase()).toContain('judgment');
    expect(PROGRAMME.philosophy.length).toBe(3);
    expect(PROGRAMME.aiIntegration.length).toBe(3);
  });

  it('publicTrack() strips gated session detail', () => {
    const pub = publicTrack(TRACKS.find(t => t.code === 'DT-101')!);
    for (const w of pub.weeks) {
      expect((w as any).sessions).toBeUndefined();
      expect((w as any).aiChallenge).toBeUndefined();
      expect((w as any).aiAudit).toBeUndefined();
      // public-safe still carries the badge flags + deliverable
      expect(typeof w.hasAiChallenge).toBe('boolean');
      expect(typeof w.hasAiAudit).toBe('boolean');
      expect(w.deliverable.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/data/curriculum.test.ts`
Expected: FAIL (module not found / exports missing).

- [ ] **Step 3: Create the types + projection in `src/lib/data/curriculum.ts`**

```ts
export type TrackStatus = 'enrolling' | 'coming_soon' | 'advanced';
export type Accent = 'cyan' | 'orange';

export interface Week {
  n: number;
  title: string;        // e.g. "Thinking Like a Problem Solver"
  theme: string;        // the "— Structured Thinking" subtitle (may be '')
  sessions: string[];   // GATED. Each entry is a session block incl. its bullets.
  deliverable: string;  // public
  aiChallenge?: string; // GATED text; presence shown publicly as a badge
  aiAudit?: string;     // GATED text; presence shown publicly as a badge
  note?: string;        // GATED
}

export interface Track {
  code: string;
  slug: string;
  name: string;
  status: TrackStatus;
  accent: Accent;
  icon: string;          // emoji, matches site style
  duration: string;      // "8 weeks"
  prerequisite: string;
  hoursPerWeek: string;
  summary: string;
  outcomes: string[];
  careerPaths: string[];
  weeks: Week[];
}

export interface PublicWeek {
  n: number;
  title: string;
  theme: string;
  deliverable: string;
  hasAiChallenge: boolean;
  hasAiAudit: boolean;
}
export type PublicTrack = Omit<Track, 'weeks'> & { weeks: PublicWeek[] };

/** Strip gated content so it is never serialized to a locked browser. */
export function publicTrack(t: Track): PublicTrack {
  return {
    ...t,
    weeks: t.weeks.map(w => ({
      n: w.n,
      title: w.title,
      theme: w.theme,
      deliverable: w.deliverable,
      hasAiChallenge: !!w.aiChallenge,
      hasAiAudit: !!w.aiAudit,
    })),
  };
}

export const PROGRAMME = {
  tagline: 'Build the judgment AI cannot replace.',
  overview:
    'E-Technix is a structured digital careers programme. Every student begins with Phase 1. After completing Phase 1, you choose one specialisation track. Advanced tracks have additional prerequisites.',
  philosophy: [
    { title: 'Foundations', body: 'Tools, syntax, frameworks — the technical base you need to operate.' },
    { title: 'Judgment', body: 'Catch AI errors, make defensible decisions, know when to trust and when to question.' },
    { title: 'Communication', body: 'Explain what you built, why you built it, and what you would do differently.' },
  ],
  aiIntegration: [
    { title: 'AI Challenge (Weekly)', body: 'Do your work first. Then bring AI in for a specific comparison. Document what changed. AI comes second — always.' },
    { title: 'AI Audit (Every 2–3 weeks)', body: 'Given an AI output, find what it got wrong and why. Group exercise.' },
    { title: 'AI Assistant (Always On)', body: 'Socratic-style assistant that asks questions, never gives answers.' },
  ],
} as const;
```

- [ ] **Step 4: Transcribe all 10 tracks into `TRACKS`**

Append `export const TRACKS: Track[] = [ ... ]` transcribed from the v3 doc. Tracks, in order, with codes/accents/icons/status:

| code | name | status | accent | icon | weeks |
|------|------|--------|--------|------|-------|
| DT-101 | Phase 1: Digital & Business Foundations | enrolling | cyan | 🚀 | 8 |
| DA-201 | Data Analytics | enrolling | cyan | 📊 | 12 |
| WD-201 | Web App Development | enrolling | orange | 🌐 | 12 |
| MD-201 | Mobile & Desktop Apps | enrolling | cyan | 📱 | 12 |
| AI-201 | AI & Agentic Systems | coming_soon | orange | 🤖 | 12 |
| PD-201 | Product Design | coming_soon | cyan | 🎨 | 12 |
| DE-201 | Digital Entrepreneurship | coming_soon | orange | 📈 | 12 |
| PM-201 | AI Product Management | coming_soon | cyan | 🧭 | 12 |
| CS-201 | Cybersecurity Fundamentals | coming_soon | orange | 🛡️ | 12 |
| DE-301 | Data Engineering | advanced | cyan | 🛠️ | 12 |
| ML-301 | Machine Learning | advanced | orange | 🧠 | 12 |

Wait — that is 11 rows. The programme is **10 tracks** per the doc's framing ("Phase 1 + 8 Specialisation + 2 Advanced" = 11 entries total, but the doc's headline says "10 TRACKS"). Resolve by following the doc's table literally: include **all 11 entries above** (Phase 1, 8 specialisations, 2 advanced) and update the integrity test's `toHaveLength(10)` to `toHaveLength(11)` in Step 1 before running. The "10 tracks" tagline refers to the 8 specialisations + 2 advanced (Phase 1 is the shared foundation); keep the marketing copy as written but the data array holds 11.

For each track fill: `duration`, `prerequisite`, `hoursPerWeek`, `summary` (the intro paragraph), `outcomes` (the "WHAT YOU WILL BE ABLE TO DO" → arrows), `careerPaths` (from the Career Outcomes table / the ◆ items), and `weeks`.

For each **week** capture: `n`, `title` (the bold week title before the "—"), `theme` (after the "—"), `deliverable` (the DELIVERABLE paragraph), `sessions` (each `SESSION n: …` heading followed by its `•` bullets, as one string per session; for the advanced tracks DE-301/ML-301 the doc lists bullets without SESSION headers — store each bullet group as a single `sessions` entry), `aiChallenge`/`aiAudit`/`note` where the doc has them.

**Template — one fully-worked track (Phase 1, weeks 1–2 shown; complete all 8):**
```ts
{
  code: 'DT-101',
  slug: 'phase-1',
  name: 'Phase 1: Digital & Business Foundations',
  status: 'enrolling',
  accent: 'cyan',
  icon: '🚀',
  duration: '8 weeks',
  prerequisite: 'Open to all',
  hoursPerWeek: '6–8 hours',
  summary:
    'The mandatory foundation every E-Technix student completes before specialising. You will leave with digital fluency, business thinking, and AI literacy that every employer and client now expects — regardless of which track you go into.',
  outcomes: [
    'Understand how digital products, platforms, and businesses work',
    'Solve structured problems using frameworks professionals use daily',
    'Navigate and critically evaluate AI tools rather than blindly depend on them',
    'Communicate your ideas clearly in written and presentation formats',
    'Build a personal digital presence ready for your specialisation track',
  ],
  careerPaths: ['Foundation for all specialisation tracks'],
  weeks: [
    {
      n: 1,
      title: 'How the Digital World Works',
      theme: 'Orientation & Mental Models',
      sessions: [
        'SESSION 1: The Digital Stack\n• How websites, apps, and platforms work end-to-end\n• Clients, servers, databases — explained without jargon\n• Why software is never really finished',
        'SESSION 2: Data is the Product\n• What companies actually sell\n• How platforms like Instagram, Google, and Jumia make money\n• Your data as currency',
        'SESSION 3: Workshop: Map a Product You Use\n• Pick any digital product\n• Map: what problem it solves, who built it, how it makes money, what data it collects\n• Present to the group in 3 minutes',
      ],
      deliverable:
        'A one-page digital product map for a Nigerian app or platform you use regularly',
    },
    {
      n: 2,
      title: 'Thinking Like a Problem Solver',
      theme: 'Structured Thinking',
      sessions: [
        'SESSION 1: The 5 Whys\n• Root cause analysis in practice\n• Case study: Why do Nigerian e-commerce returns spike in December?\n• Group drill: apply 5 Whys to a real local business problem',
        'SESSION 2: First Principles Thinking\n• Breaking assumptions apart\n• How Elon Musk, Jeff Bezos, and local founders like Flutterwave think differently\n• First Principles vs. analogy thinking',
        'SESSION 3: Workshop: Diagnose a Failing Business\n• Given a fictional struggling Nigerian business\n• Apply 5 Whys and First Principles\n• Propose one change and defend it',
      ],
      deliverable:
        'A structured problem analysis using 5 Whys + First Principles on a business scenario of your choice',
      aiChallenge:
        'After submitting your analysis, put the same business scenario into ChatGPT. Compare its output to yours. What did it get right? What did it miss? Bring both versions to Week 3.',
    },
    // … weeks 3–8 from the doc …
  ],
},
```
Transcribe the remaining tracks the same way, reading content from the v3 doc. Keep bullets verbatim. Do not invent or summarise.

- [ ] **Step 5: Run the integrity test until green**

Run: `npm test -- src/lib/data/curriculum.test.ts`
Expected: PASS. If `toHaveLength` mismatches, fix the count assertions to the actual array length (11) as noted, and ensure each track satisfies the well-formed checks.

- [ ] **Step 6: Typecheck and commit**

```bash
npx tsc --noEmit
git add src/lib/data/curriculum.ts src/lib/data/curriculum.test.ts src/lib/data/curriculum.test.ts
git commit -m "feat: curriculum data source of truth + integrity tests"
```

---

## Task 3: Lead validation + insert helper

**Files:**
- Create: `src/lib/curriculum-lead.ts`
- Test: `src/lib/curriculum-lead.test.ts`

- [ ] **Step 1: Write the failing validation test**

Create `src/lib/curriculum-lead.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidName } from './curriculum-lead';

describe('lead validation', () => {
  it('accepts ordinary emails', () => {
    expect(isValidEmail('jane@example.com')).toBe(true);
    expect(isValidEmail('a.b-c@sub.domain.co')).toBe(true);
  });
  it('rejects malformed emails', () => {
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('a @b.com')).toBe(false);
  });
  it('requires a non-trivial name', () => {
    expect(isValidName('Jane')).toBe(true);
    expect(isValidName(' ')).toBe(false);
    expect(isValidName('')).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- src/lib/curriculum-lead.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/curriculum-lead.ts`**

```ts
import { createAdminClient } from '@/lib/supabase/admin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 120;
}

export interface LeadInput {
  name: string;
  email: string;
  track_interest?: string | null;
  user_agent?: string | null;
  referer?: string | null;
}

/** Inserts a lead and returns its id. Upserts on email to avoid duplicates. */
export async function insertLead(input: LeadInput): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('curriculum_leads')
    .upsert(
      {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        track_interest: input.track_interest ?? null,
        user_agent: input.user_agent ?? null,
        referer: input.referer ?? null,
      },
      { onConflict: 'email' },
    )
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- src/lib/curriculum-lead.test.ts`
Expected: PASS (validation tests; `insertLead` is not exercised in unit tests — it needs Supabase).

- [ ] **Step 5: Commit**

```bash
git add src/lib/curriculum-lead.ts src/lib/curriculum-lead.test.ts
git commit -m "feat: curriculum lead validation + insert helper"
```

---

## Task 4: Supabase migration (manual apply)

**Files:**
- Create: `supabase/migrations/2026-06-19-curriculum-leads.sql`

- [ ] **Step 1: Write the migration**

```sql
create table if not exists public.curriculum_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  track_interest text,
  user_agent text,
  referer text,
  created_at timestamptz not null default now()
);
create index if not exists curriculum_leads_email_idx on public.curriculum_leads (email);
alter table public.curriculum_leads enable row level security;
-- No policies: only the service-role key (server API) may read/write.
```
Note: `email` is `unique` so the `upsert(onConflict:'email')` in Task 3 works.

- [ ] **Step 2: Apply it**

Run this SQL in the Supabase SQL editor (or via the Supabase MCP `apply_migration`). This is a **manual step** — confirm the table exists before testing the API routes.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/2026-06-19-curriculum-leads.sql
git commit -m "feat: curriculum_leads table migration"
```

---

## Task 5: Lead capture API route

**Files:**
- Create: `src/app/api/curriculum/lead/route.ts`

- [ ] **Step 1: Implement the route**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, isValidName, insertLead } from '@/lib/curriculum-lead';

export const UNLOCK_COOKIE = 'etx_curr_unlock';

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const name = String(body?.name ?? '');
  const email = String(body?.email ?? '');
  const track = body?.track_interest ? String(body.track_interest) : null;

  if (!isValidName(name)) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });

  let id: string;
  try {
    id = await insertLead({
      name, email, track_interest: track,
      user_agent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
    });
  } catch (e: any) {
    console.error('[curriculum/lead]', e);
    return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true, name: name.trim() });
  res.cookies.set(UNLOCK_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 180, // 180 days
  });
  return res;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual smoke (after `npm run dev` and migration applied)**

Run:
```bash
curl -i -X POST http://localhost:3000/api/curriculum/lead -H 'Content-Type: application/json' -d '{"name":"Test User","email":"test@example.com","track_interest":"Data Analytics"}'
```
Expected: `200`, JSON `{"ok":true,...}`, and a `Set-Cookie: etx_curr_unlock=...` header. A row appears in `curriculum_leads`. Also verify an invalid email returns `400`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/curriculum/lead/route.ts
git commit -m "feat: curriculum lead capture API"
```

---

## Task 6: Premium watermarked PDF (module + route)

**Files:**
- Create: `src/lib/curriculum-pdf.tsx`
- Create: `src/app/api/curriculum/pdf/route.ts`
- Test: `src/lib/curriculum-pdf.test.ts`

> If Task 1 Step 5 found `@react-pdf/renderer` incompatible, implement `renderCurriculumPdf` with `pdf-lib` instead, keeping the exact signature and the `%PDF` + watermark guarantees the test asserts.

- [ ] **Step 1: Write the failing PDF test**

Create `src/lib/curriculum-pdf.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { renderCurriculumPdf } from './curriculum-pdf';

describe('curriculum pdf', () => {
  it('renders a non-empty PDF buffer', async () => {
    const buf = await renderCurriculumPdf({ name: 'Jane Tester', email: 'jane@example.com' });
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 4).toString('latin1')).toBe('%PDF');
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npm test -- src/lib/curriculum-pdf.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/curriculum-pdf.tsx`**

A premium, branded, multi-page prospectus. Use the site palette (cyan `#00C8FF`, orange `#FF6B2B`, dark `#070D1A`). Structure: branded cover (logo wordmark, tagline, overview), philosophy + AI-integration page, then one section per track (accent-coloured header band, meta row, outcomes, career paths, week timeline with deliverables). Every page has a footer watermark.

```tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { TRACKS, PROGRAMME, type Track } from '@/lib/data/curriculum';

const CY = '#00C8FF';
const OR = '#FF6B2B';
const DARK = '#070D1A';
const accentOf = (t: Track) => (t.accent === 'cyan' ? CY : OR);

const s = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 64, paddingHorizontal: 48, fontSize: 10, color: '#1A2233', fontFamily: 'Helvetica' },
  cover: { backgroundColor: DARK, color: '#fff', flexDirection: 'column', justifyContent: 'center', height: '100%' },
  wordmark: { fontSize: 26, fontFamily: 'Helvetica-Bold' },
  tagline: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginTop: 24, color: CY, lineHeight: 1.2 },
  overview: { fontSize: 11, marginTop: 18, color: '#AAB4C8', lineHeight: 1.5, maxWidth: 380 },
  h2: { fontSize: 15, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  trackBand: { padding: 10, borderRadius: 6, marginBottom: 8 },
  trackName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#fff' },
  trackMeta: { fontSize: 9, color: '#fff', opacity: 0.9, marginTop: 2 },
  label: { fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 1, color: '#6B7689', marginTop: 10, marginBottom: 4, textTransform: 'uppercase' },
  li: { flexDirection: 'row', marginBottom: 2 },
  bullet: { width: 8 },
  weekRow: { marginBottom: 6, paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0' },
  weekTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  weekTheme: { fontSize: 9, color: '#6B7689' },
  deliverable: { fontSize: 9, marginTop: 2, color: '#33415C' },
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, fontSize: 7, color: '#9AA4B8', flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: '#E2E8F0', paddingTop: 6 },
});

function Footer({ mark }: { mark: string }) {
  return <View style={s.footer} fixed>
    <Text>{mark}</Text>
    <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>;
}

function Bullet({ children }: { children: string }) {
  return <View style={s.li}><Text style={s.bullet}>•</Text><Text style={{ flex: 1 }}>{children}</Text></View>;
}

export async function renderCurriculumPdf(lead: { name: string; email: string }): Promise<Buffer> {
  const mark = `Prepared for ${lead.name} · ${lead.email} · ${new Date().toISOString().slice(0, 10)} · © E-Technix`;
  const doc = (
    <Document title="E-Technix Master Curriculum" author="E-Technix">
      {/* Cover */}
      <Page size="A4" style={[s.page, s.cover]}>
        <Text style={s.wordmark}>e-technix</Text>
        <Text style={s.tagline}>{PROGRAMME.tagline}</Text>
        <Text style={s.overview}>{PROGRAMME.overview}</Text>
        <Text style={{ ...s.overview, marginTop: 28, fontSize: 9 }}>{mark}</Text>
      </Page>
      {/* Philosophy + AI integration */}
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Our Teaching Philosophy</Text>
        {PROGRAMME.philosophy.map(p => (
          <View key={p.title} style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{p.title}</Text>
            <Text style={{ color: '#33415C' }}>{p.body}</Text>
          </View>
        ))}
        <Text style={{ ...s.h2, marginTop: 14 }}>How We Integrate AI</Text>
        {PROGRAMME.aiIntegration.map(p => (
          <View key={p.title} style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{p.title}</Text>
            <Text style={{ color: '#33415C' }}>{p.body}</Text>
          </View>
        ))}
        <Footer mark={mark} />
      </Page>
      {/* One page-flow per track */}
      {TRACKS.map(t => (
        <Page key={t.code} size="A4" style={s.page} wrap>
          <View style={[s.trackBand, { backgroundColor: accentOf(t) }]}>
            <Text style={s.trackName}>{t.icon} {t.name}</Text>
            <Text style={s.trackMeta}>{t.code} · {t.duration} · {t.hoursPerWeek}/week · Prereq: {t.prerequisite}</Text>
          </View>
          <Text style={{ color: '#33415C', marginBottom: 4 }}>{t.summary}</Text>
          <Text style={s.label}>What you will be able to do</Text>
          {t.outcomes.map((o, i) => <Bullet key={i}>{o}</Bullet>)}
          <Text style={s.label}>Career paths</Text>
          <Text style={{ color: '#33415C' }}>{t.careerPaths.join(' · ')}</Text>
          <Text style={s.label}>Week by week</Text>
          {t.weeks.map(w => (
            <View key={w.n} style={s.weekRow} wrap={false}>
              <Text style={s.weekTitle}>Week {w.n}: {w.title}</Text>
              {w.theme ? <Text style={s.weekTheme}>{w.theme}</Text> : null}
              <Text style={s.deliverable}>Deliverable: {w.deliverable}</Text>
            </View>
          ))}
          <Footer mark={mark} />
        </Page>
      ))}
    </Document>
  );
  return renderToBuffer(doc);
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- src/lib/curriculum-pdf.test.ts`
Expected: PASS.

- [ ] **Step 5: Implement the PDF route `src/app/api/curriculum/pdf/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { renderCurriculumPdf } from '@/lib/curriculum-pdf';
import { UNLOCK_COOKIE } from '@/app/api/curriculum/lead/route';

export async function GET(req: NextRequest) {
  const id = req.cookies.get(UNLOCK_COOKIE)?.value;
  if (!id) return NextResponse.json({ error: 'Unlock the curriculum first.' }, { status: 403 });

  const supabase = createAdminClient();
  const { data: lead } = await supabase
    .from('curriculum_leads').select('name, email').eq('id', id).single();
  if (!lead) return NextResponse.json({ error: 'Unlock the curriculum first.' }, { status: 403 });

  try {
    const buf = await renderCurriculumPdf({ name: lead.name, email: lead.email });
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="E-Technix-Curriculum.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    console.error('[curriculum/pdf]', e);
    return NextResponse.json({ error: 'Could not generate the PDF. Please try again.' }, { status: 500 });
  }
}
```

- [ ] **Step 6: Typecheck + manual route check**

Run: `npx tsc --noEmit` → no errors.
After `npm run dev`: hitting `GET /api/curriculum/pdf` with no cookie returns 403; with the cookie from Task 5's curl (pass `--cookie "etx_curr_unlock=<id>"`) returns a PDF. Open it and confirm the watermark footer shows the lead's name + email.

- [ ] **Step 7: Commit**

```bash
git add src/lib/curriculum-pdf.tsx src/lib/curriculum-pdf.test.ts src/app/api/curriculum/pdf/route.ts
git commit -m "feat: premium watermarked curriculum PDF + route"
```

---

## Task 7: Unlock modal component

**Files:**
- Create: `src/components/curriculum/CurriculumUnlockModal.tsx`

- [ ] **Step 1: Implement the modal**

Client component. Props: `{ tracks: { code: string; name: string }[]; onUnlocked: (name: string) => void; onClose: () => void }`. Fields: name (required), email (required), track_interest (optional `<select>`). Submits to `/api/curriculum/lead`; on `ok`, calls `onUnlocked(data.name)`. Styling mirrors `register/_client.tsx` inputs and `AssignmentAssistant` error box; overlay is a fixed full-screen dim backdrop with a centered card (`var(--surface)`, `var(--border)`, radius 16). Include loading + error states and disable submit while busy.

```tsx
'use client';
import { useState } from 'react';

interface Props {
  tracks: { code: string; name: string }[];
  onUnlocked: (name: string) => void;
  onClose: () => void;
}
const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' };
const label: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', display: 'block' };

export default function CurriculumUnlockModal({ tracks, onUnlocked, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [track, setTrack] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/curriculum/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, track_interest: track || null }) });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong. Please try again.');
      else onUnlocked(data.name ?? name);
    } catch { setError('Connection error. Please try again.'); }
    finally { setBusy(false); }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit} style={{ width: '100%', maxWidth: '440px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Unlock the full curriculum</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.4rem', marginBottom: 0, lineHeight: 1.55 }}>
            See every session and download the full prospectus PDF. Tell us where to send it.
          </p>
        </div>
        <div><label style={label}>Your name *</label><input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required /></div>
        <div><label style={label}>Email address *</label><input style={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" required /></div>
        <div><label style={label}>Which track interests you? (optional)</label>
          <select style={{ ...input, cursor: 'pointer' }} value={track} onChange={e => setTrack(e.target.value)}>
            <option value="">— Not sure yet —</option>
            {tracks.map(t => <option key={t.code} value={t.name}>{t.name}</option>)}
          </select>
        </div>
        {error && <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
          <button type="submit" disabled={busy} style={{ flex: 1, padding: '0.8rem', background: 'var(--cyan)', color: '#070D1A', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', cursor: busy ? 'not-allowed' : 'pointer' }}>{busy ? 'Unlocking…' : 'Unlock & continue'}</button>
          <button type="button" onClick={onClose} style={{ padding: '0.8rem 1.1rem', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--muted)', margin: 0, textAlign: 'center' }}>No spam. We'll only contact you about the programme.</p>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/components/curriculum/CurriculumUnlockModal.tsx
git commit -m "feat: curriculum unlock modal"
```

---

## Task 8: Curriculum page (server + client)

**Files:**
- Create: `src/app/curriculum/page.tsx`
- Create: `src/app/curriculum/_client.tsx`

- [ ] **Step 1: Server component `src/app/curriculum/page.tsx`**

Reads the cookie, looks up the lead (for unlock + name), and builds props. When locked, send `publicTrack()` projections (no session text); when unlocked, send full `TRACKS`.

```tsx
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { TRACKS, PROGRAMME, publicTrack, type Track, type PublicTrack } from '@/lib/data/curriculum';
import { UNLOCK_COOKIE } from '@/app/api/curriculum/lead/route';
import CurriculumClient from './_client';

export const metadata = {
  title: 'Curriculum — E-Technix',
  description: 'The full E-Technix digital careers curriculum: 10 tracks, week by week. Build the judgment AI cannot replace.',
};

export default async function CurriculumPage() {
  const jar = await cookies();
  const id = jar.get(UNLOCK_COOKIE)?.value;
  let unlocked = false;
  let leadName: string | null = null;

  if (id) {
    const supabase = createAdminClient();
    const { data } = await supabase.from('curriculum_leads').select('name').eq('id', id).single();
    if (data) { unlocked = true; leadName = data.name; }
  }

  const tracks: (Track | PublicTrack)[] = unlocked ? TRACKS : TRACKS.map(publicTrack);
  const trackChoices = TRACKS.map(t => ({ code: t.code, name: t.name }));

  return (
    <CurriculumClient
      programme={PROGRAMME}
      tracks={tracks as any}
      trackChoices={trackChoices}
      unlocked={unlocked}
      leadName={leadName}
    />
  );
}
```

- [ ] **Step 2: Client component `src/app/curriculum/_client.tsx`**

Renders Navbar/Footer and all sections (hero, at-a-glance table, philosophy, AI integration, per-track sections with week timeline, career outcomes, CTA). Holds `unlocked` state (seeded from props), opens `CurriculumUnlockModal` on any locked "Unlock" affordance, and shows the **Download PDF** button when unlocked. For locked weeks, render a blurred/disabled "Full session detail" teaser bar instead of real bullets. Reuse style idioms from `programs/_client.tsx` (badges, cards, accent logic via `track.accent`). Status badge maps: `enrolling`→"● Enrolling now" (cyan), `coming_soon`→"◎ Coming soon" (muted), `advanced`→"▲ Advanced" (orange).

Key behaviours:
- `const [unlocked, setUnlocked] = useState(props.unlocked);` and `const [modal, setModal] = useState(false);`
- When a `Week` has `sessions` (i.e. unlocked, full `Track`), render the session blocks (split each string on `\n`, first line bold as the session heading, `•` lines as bullets) + `aiChallenge`/`aiAudit`/`note` callouts.
- When locked (`PublicWeek`, no `sessions`), render the deliverable + AI badges from `hasAiChallenge`/`hasAiAudit`, plus a teaser bar: "🔒 Unlock full session detail" that calls `setModal(true)`.
- On `onUnlocked`, set `unlocked` true and close modal. **Note:** the page was rendered locked, so it lacks full session text in props; after unlock, either (a) `router.refresh()` to re-fetch with the cookie now set, or (b) reload. Use `import { useRouter } from 'next/navigation'` and call `router.refresh()` in `onUnlocked` so the server re-sends full data. Show the Download PDF button immediately regardless.
- Download button: `<a href="/api/curriculum/pdf">Download curriculum PDF</a>`.

Because this file is large and visual, build it to compile + render; verify by eye (next step). Keep it under one responsibility (presentation only — no data logic beyond formatting).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds, `/curriculum` listed as a route.

- [ ] **Step 5: Manual verification**

After `npm run dev`, open `http://localhost:3000/curriculum`:
- Locked state shows all tracks, weekly themes + deliverables + AI badges, and locked teaser bars. **View source / network**: confirm no session-bullet text is present in the locked HTML/props.
- Click "Unlock" → modal → submit valid details → page refreshes unlocked, session bullets visible, Download PDF button present.
- Click Download PDF → branded watermarked PDF downloads.
- Toggle dark/light theme; check mobile width (≤640px).

- [ ] **Step 6: Commit**

```bash
git add src/app/curriculum/page.tsx src/app/curriculum/_client.tsx
git commit -m "feat: curriculum page (gated server render + UI)"
```

---

## Task 9: Navigation link

**Files:**
- Modify: `src/components/layout/Navbar.tsx:7-14`

- [ ] **Step 1: Add the link**

In the `navLinks` array, add after the `/programs` entry:
```ts
{ href: '/curriculum', label: 'Curriculum' },
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` then check the nav renders the new link (desktop + mobile share the array).
```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: add Curriculum to nav"
```

---

## Task 10: Full verification pass

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: all PASS (data integrity, lead validation, PDF buffer).

- [ ] **Step 2: Typecheck + lint + build**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build
```
Expected: all clean.

- [ ] **Step 3: End-to-end manual smoke**

With `npm run dev` and the migration applied: full flow (locked → unlock → session detail → PDF) works; a real row exists in `curriculum_leads`; returning to `/curriculum` in the same browser stays unlocked (cookie persists).

- [ ] **Step 4: Final commit (if any cleanup)**

```bash
git add -A
git commit -m "chore: curriculum section verification cleanup" || true
```

---

## Self-Review notes

- **Spec coverage:** data SoT (T2), public-safe projection (T2), page + gated server render (T8), unlock modal (T7), lead API + cookie (T5), Supabase table (T4), watermarked premium PDF (T6), nav (T9), tests (T2/T3/T6), `/programs` untouched (no task modifies it). ✔
- **Type consistency:** `Track`/`PublicTrack`/`Week`/`PublicWeek`, `publicTrack()`, `UNLOCK_COOKIE`, `renderCurriculumPdf({name,email})`, `insertLead`/`isValidEmail`/`isValidName` are used consistently across tasks. ✔
- **Track count:** the data array holds **11** entries (Phase 1 + 8 specialisations + 2 advanced); the "10 tracks" tagline is marketing copy (8 specialisations + 2 advanced). Task 2 Step 1 test asserts 11 — keep them in sync. ⚠ confirm during T2.
- **Open risk:** `@react-pdf/renderer` on React 19 — gated by Task 1 Step 5 with a `pdf-lib` fallback path.
```
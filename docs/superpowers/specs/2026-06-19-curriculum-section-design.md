# Curriculum Section — Design Spec

**Date:** 2026-06-19
**Status:** Approved (pending written-spec review)
**Author:** brainstormed with Claude

## Goal

Add a public, world-class **Curriculum** section to the E-Technix site driven by the
v3 Master Curriculum (10 tracks: Phase 1 + 8 specialisations + 2 advanced). The page
sells the programme at "prospectus depth" to everyone, and gates the deepest
session-by-session detail and a downloadable, per-lead **watermarked PDF** behind a
lightweight email capture that stores leads in Supabase.

This is the first of three sequenced projects (Curriculum → AI 5-Whys fix → UI/UX
foundation). It is also intended to help establish the design language we later roll
out across the site.

## Decisions (locked during brainstorming)

- **Placement:** new dedicated `/curriculum` page (not a replacement of `/programs`).
- **Single source of truth:** `src/lib/data/curriculum.ts` feeds both the page and the PDF.
- **Visibility model:** "public sells, deep detail gated."
  - **Public (no email):** programme overview, teaching philosophy, AI-integration model,
    the 10-track "at a glance" table, and per-track: summary, outcomes, career paths,
    and a week-by-week timeline of **week titles + themes + deliverables + AI
    Challenge/Audit badges**.
  - **Gated (email unlock):** the session-by-session bullets (`SESSION 1/2/3 …`) for each
    week, plus the **Download PDF** button.
- **Protection stance (option 4):** accept that a determined competitor cannot be fully
  blocked. Mitigate by (a) keeping *all* public/downloadable content at prospectus depth —
  exact rubrics and precise AI-Challenge prompts never leave the hub, and the v3 doc is
  already prospectus-grade; (b) **per-lead watermark** on the PDF ("Prepared for {name} ·
  {email} · {date} · © E-Technix") so any leak is traceable and branded.
- **Gate mechanism:** lightweight modal (name + email + optional "track of interest").
  No password, no email verification. Saves the lead to Supabase, sets an unlock cookie,
  reveals session detail, and shows the PDF download.
- **PDF generation:** data-driven via `@react-pdf/renderer`, server-side (no headless
  browser; Vercel-friendly), watermarked per lead.

## Out of scope (flagged for later)

- The existing `/programs` page keeps its stale 6-track data for now. During the UI/UX
  phase we will reconcile it (redirect to `/curriculum` or rebuild from `curriculum.ts`)
  so the two pages cannot disagree. **Do not edit `/programs` in this project.**
- No admin UI to view leads in this project. Leads land in a Supabase table queryable
  directly (and easy to surface in the admin back office later).

## Architecture

### 1. Data — `src/lib/data/curriculum.ts`

Typed, hand-transcribed from the v3 doc. Shape (illustrative):

```ts
export type TrackStatus = 'enrolling' | 'coming_soon' | 'advanced';
export interface Week {
  n: number;
  title: string;        // e.g. "Thinking Like a Problem Solver"
  theme: string;        // the "— Structured Thinking" subtitle
  sessions: string[];   // GATED: ["SESSION 1: The 5 Whys\n• …", …]
  deliverable: string;
  aiChallenge?: string; // GATED detail; badge ("AI Challenge") shown publicly
  aiAudit?: string;     // GATED detail; badge ("AI Audit") shown publicly
  note?: string;
}
export interface Track {
  code: string;             // "DT-101"
  slug: string;             // "phase-1"
  name: string;
  status: TrackStatus;
  accent: 'cyan' | 'orange';
  duration: string;         // "8 weeks"
  prerequisite: string;
  hoursPerWeek: string;
  summary: string;
  outcomes: string[];       // "What you will be able to do"
  careerPaths: string[];
  weeks: Week[];
}
export const PROGRAMME = { tagline, overview, philosophy, aiIntegration };
export const TRACKS: Track[];
```

A small derived helper returns a "public-safe" projection of a track (weeks without
`sessions`/`aiChallenge`/`aiAudit` text) for use when the visitor is locked.

### 2. Page — `src/app/curriculum/page.tsx` (server) + `_client.tsx`

- **Server component** reads the `etx_curr_unlock` cookie. If absent, it builds props
  using the **public-safe projection** (session bullets are NOT serialized to the client,
  so they can't be read from page source). If present, it passes the full data and the
  lead's first name (for a "Welcome back" touch and to confirm unlock).
- **Client component** (matches existing `_client.tsx` + inline-style + CSS-var pattern,
  dark/light theme aware) renders:
  1. **Hero** — *"Build the judgment AI cannot replace."* + programme overview + primary
     CTA. Reuses `CountdownTimer` for consistency with other pages.
  2. **At-a-glance table** — all 10 tracks with code, duration, status badge
     (Enrolling / Coming soon / Advanced), prerequisite. Anchor links jump to each track.
  3. **Teaching philosophy** — Foundations / Judgment / Communication (3 cards).
  4. **How we integrate AI** — AI Challenge / AI Audit / AI Assistant (3 cards).
  5. **Per-track sections** — header (icon, name, code, status, duration, prereq, hours),
     summary, outcomes list, career-path chips, and a **week-by-week timeline**. Each week
     shows title + theme + deliverable + AI Challenge/Audit **badges**.
     - **Locked:** each week's deeper layer renders a blurred skeleton + an "Unlock full
       session detail" affordance that opens the modal.
     - **Unlocked:** the week expands to the real `sessions[]` bullets + the full AI
       Challenge/Audit text + note.
  6. **Career outcomes by track** table (from the doc).
  7. **CTA** — register / WhatsApp, consistent with `/programs`.
- **Download PDF** button appears only when unlocked (links to `GET /api/curriculum/pdf`).

### 3. Email-gate modal — `CurriculumUnlockModal` (client)

- Fields: `name` (required), `email` (required, format-validated client + server),
  `track_interest` (optional select of the 10 tracks).
- Submit → `POST /api/curriculum/lead`. On success: set local `unlocked` state to reveal
  detail immediately, and the server has set the cookie for return visits.
- Error + loading states styled like the existing `AssignmentAssistant` (errBox pattern).

### 4. API — `POST /api/curriculum/lead`

- Validates name + email (server-side email regex; reject obviously invalid).
- Inserts into `curriculum_leads` via the **service-role admin client** (public route, no
  auth). Captures: `name`, `email`, `track_interest`, `created_at`, and best-effort
  `user_agent` / `referer` for context. Deduplicate softly (upsert on email is fine).
- Sets an **httpOnly cookie** `etx_curr_unlock` whose value is the new lead's UUID
  (`maxAge` ~180 days, `sameSite=lax`, `secure` in prod). The UUID is unguessable, so the
  cookie both marks "unlocked" and lets `/pdf` look up the watermark identity.
- Returns `{ ok: true, name }`.

### 5. API — `GET /api/curriculum/pdf`

- Reads `etx_curr_unlock` cookie → looks up the lead by UUID in Supabase. If missing/not
  found → 403 (gate enforced server-side, not just client state).
- Generates the PDF from `curriculum.ts` via the isolated module `src/lib/curriculum-pdf.ts`
  and streams it back with `Content-Disposition: attachment; filename="E-Technix-Curriculum.pdf"`.
- **Watermark:** footer on every page — "Prepared for {name} · {email} · {generated date}
  · © E-Technix" — plus an E-Technix header/branding. PDF content is prospectus depth
  (mirrors the page's full reveal).

### 6. PDF module — `src/lib/curriculum-pdf.ts`

- Single responsibility: `renderCurriculumPdf(lead: { name; email }): Promise<Buffer>`.
- Implemented with `@react-pdf/renderer`. Isolated so the rendering library can be swapped
  (e.g. to `pdfkit`/`pdf-lib`) without touching the route if peer/runtime issues arise.
- **Polish level: highly-designed prospectus (decided).** Branded cover page (logo,
  tagline, programme summary), per-track sections with the track's accent colour, careful
  typographic hierarchy (heading/body fonts mirroring the site), status badges, week
  timeline, and a consistent watermarked footer. Treat it as a premium downloadable
  brochure, not a plain text dump.

### 7. Database — `curriculum_leads`

Migration SQL (provided to the user to run in Supabase):

```sql
create table if not exists public.curriculum_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  track_interest text,
  user_agent text,
  referer text,
  created_at timestamptz not null default now()
);
create index if not exists curriculum_leads_email_idx on public.curriculum_leads (email);
-- RLS: no public access; writes go through the service-role key from the API route only.
alter table public.curriculum_leads enable row level security;
```

### 8. Navigation

Add `{ href: '/curriculum', label: 'Curriculum' }` to `navLinks` in
`src/components/layout/Navbar.tsx` (desktop + mobile share the same array).

## Data flow

1. Visitor opens `/curriculum` → server sees no cookie → renders prospectus depth with
   blurred/locked session layers (real bullets never sent to the browser).
2. Visitor clicks "Unlock full detail" → modal → `POST /api/curriculum/lead` → lead saved,
   cookie set → client reveals detail and shows **Download PDF**.
3. Visitor clicks **Download PDF** → `GET /api/curriculum/pdf` → cookie → lead lookup →
   watermarked PDF streamed.
4. Return visit → cookie present → server renders full detail immediately.

## Error handling

- Lead insert failure → modal shows a friendly retry error; nothing unlocks.
- Invalid email → 400 with message; modal highlights the field.
- `/pdf` without/with bad cookie → 403 + a small on-page hint to unlock first.
- PDF generation throws → 500 with a "try again" message; the on-page detail stays
  available so the visitor isn't blocked.

## Testing

- **Data integrity:** a lightweight check that every track has `weeks`, every week a
  `title` + `deliverable`, and counts match the doc (10 tracks; Phase 1 = 8 weeks; most
  specialisations = 12).
- **Gating:** locked server render contains no session-bullet text (assert on serialized
  props/HTML); unlocked render does.
- **Lead API:** valid insert sets cookie + row; invalid email rejected.
- **PDF route:** 403 without cookie; 200 + `application/pdf` with a valid lead cookie;
  watermark string contains the lead's name + email.
- **Manual:** dark/light themes, mobile layout, modal flow end-to-end.

## Risks / notes

- **`@react-pdf/renderer` on React 19 / Next 16:** verify peer compatibility early. If it
  misbehaves, fall back to `pdfkit` or `pdf-lib` behind the same `curriculum-pdf.ts`
  interface — routes and page are unaffected.
- **Gating is "good enough," not airtight** — by explicit decision. The watermark +
  prospectus-depth discipline is the real protection, not the cookie.
- **Content transcription accuracy:** `curriculum.ts` is hand-built from the v3 doc; the
  data-integrity check guards against omissions, but a human proof-read against the doc is
  recommended before launch.
```
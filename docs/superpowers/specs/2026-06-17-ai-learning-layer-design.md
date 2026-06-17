# AI Learning Layer for e-technix — Design

Date: 2026-06-17

## Goal

Add an AI-powered interactive learning layer to the student hub that helps
students learn and complete assignments using AI *guidance* (coaching), grounded
in what was actually taught each session. Two student-facing features:

1. **Floating AI Tutor** — a chat assistant scoped to the current session's
   topic, answering questions grounded in the session's teaching content.
2. **AI Assignment Assistant** — a generalized, admin-configurable tool that
   scaffolds each weekly deliverable into a structured draft the student edits
   and submits.

A small separate task (not part of this build) adds session slide decks to the
existing Resources section.

## Why this is on-mission, not cheating

The Phase 1 curriculum's Week 8 learning outcome is explicitly "Use AI tools
(ChatGPT, Claude, Gemini) productively." An assistant that coaches and scaffolds
— rather than silently producing finished work — directly serves that goal. The
assistant is designed to require real student input and to guide rather than
hand over answers.

## Provider & architecture

- **Provider:** Google Gemini, **free tier** via Google AI Studio. Chosen
  because it is genuinely free (daily/rate-limited quota that is independent of
  any consumer Gemini Pro subscription, so it survives subscription expiry),
  and the instructor already uses it.
- **Server-proxied only.** All AI calls go through a new server route
  (`/api/ai/*`). The API key lives in a server env var (`GEMINI_API_KEY`), never
  in client code. (The leaked key in the Gemini-generated slide HTML must be
  rotated.)
- **Model:** a free-tier Gemini Flash model (e.g. `gemini-2.0-flash` or the
  current free-tier flash model), configurable via env var
  `GEMINI_MODEL` so it can be swapped without code changes.
- **Rate limiting & resilience:** per-student request throttling (e.g. N
  requests/minute and a daily cap), plus exponential-backoff retry on 429s. On
  exhaustion, the UI shows a graceful "the tutor is busy, try again in a moment"
  message rather than an error. Free-tier limits are the binding constraint with
  a full cohort, so this is mandatory, not optional.

## Feature 1: Per-session teaching context

Sessions gain two new fields:
- `teaching_script` (text) — the admin pastes the full session script.
- `teaching_brief` (text) — a condensed brief generated once from the script.

When an admin saves a session with a (new or changed) `teaching_script`, the
server makes one Gemini call to condense it into a compact `teaching_brief`
(key concepts, definitions, frameworks, examples). The brief — not the full
script — is injected as grounding context into tutor and assistant requests, so
per-interaction token cost stays small.

If no script is provided, the tutor/assistant fall back to the session title +
description (degraded but functional).

## Feature 2: Floating AI Tutor

- A floating 🤖 button on the student hub (same interaction pattern as the
  existing chat), opening a chat panel.
- **Scope:** the student's current/most-recent relevant session topic. The
  panel shows which topic it's grounded in and lets the student pick a different
  session they have access to.
- **Grounding:** the selected session's `teaching_brief` is sent as system
  context. The system prompt casts the AI as an encouraging, concise tutor that
  explains and guides rather than dumping answers.
- **Transport:** non-streaming request/response to `/api/ai/tutor` for v1
  (simplest; fits free tier). Conversation history kept client-side and sent
  with each request (bounded to the last N turns to cap tokens).
- Auth: student session required (same pattern as other student APIs).

## Feature 3: AI Assignment Assistant (generalized engine)

The core of the build. One engine supports every current and future deliverable
via admin configuration — no per-framework custom code.

### Admin configuration (per assignment)

Assignments gain an `ai_template` (jsonb), set in the assignment builder:

```jsonc
{
  "enabled": true,
  "layout": "prose" | "grid" | "ladder" | "table",
  "intro": "One line shown to the student about what this tool does.",
  "fields": [
    // labeled output slots, rendered per layout
    { "key": "customerSegments", "label": "Customer Segments" },
    { "key": "valuePropositions", "label": "Value Propositions" }
    // ...
  ],
  "studentInputs": [
    // what we require from the student BEFORE drafting
    { "key": "businessName", "label": "Business name", "required": true },
    { "key": "description", "label": "Describe the business", "type": "textarea", "required": true },
    { "key": "url", "label": "Website (optional)", "required": false }
  ],
  "coachingPrompt": "Instructions to the AI on how to guide this specific deliverable."
}
```

- **Layouts:**
  - `prose` — guided long-form (reflections, briefs, personas).
  - `grid` — labeled boxes in a canvas layout (the **BMC** 9-box canvas; the
    "hero" look the instructor liked falls out of this for free).
  - `ladder` — sequential steps (5 Whys: problem + 5 levels).
  - `table` — columns of prompts (SCAMPER's 7 lenses).
- The same engine renders all four; BMC's polished canvas is just the `grid`
  layout with the 9 standard boxes — no bespoke component required.

### Student flow

1. Open an assignment that has `ai_template.enabled`.
2. The assistant **first collects the required `studentInputs`** (e.g. business
   name + description + optional URL — directly fixing the "name-only felt thin"
   problem). It will not draft until the student provides real input.
3. On submit, `/api/ai/assist` builds a prompt from: the assignment's
   `coachingPrompt`, the session's `teaching_brief`, the layout's `fields`, and
   the student's inputs. It requests a JSON object keyed by the field `key`s
   (structured output), or guided prose for the `prose` layout.
4. The draft renders into the layout. The student **edits inline**.
5. The student attaches the finished result to their existing assignment
   submission (reuses the current submissions flow; the assistant output is
   saved as the submission content / an attachment).

### External-tool deliverables (Notion, Sheets, Slides)

For Weeks 2 and 7, the artifact is built in an external tool. Here the assistant
operates in **coach mode**: it produces checklists, structure advice, and
"what good looks like" guidance, but does not fabricate the artifact (the
curriculum requires the student to actually build it). This is just an
`ai_template` whose `coachingPrompt` instructs guidance-only and whose layout is
`prose`.

## Feature 4 (separate task): Slides as resources

Add session slide decks to the existing Resources section as a new resource
(HTML upload or external link). Small, independent of the AI build; tracked
separately and not specified in detail here.

## Data model changes

- `sessions`: add `teaching_script text`, `teaching_brief text` (both nullable).
- `assignments`: add `ai_template jsonb` (nullable; null = no assistant for that
  assignment).
- `ai_usage` (new table) for rate limiting / observability:
  `id, student_id, kind ('tutor'|'assist'|'brief'), created_at`. Queried by
  count over a time window to enforce throttles.
- Assistant output reuses the existing `assignment_submissions` flow — no new
  submission table.

All new tables get RLS enabled with no policies (server-only access via the
service-role client), consistent with the quiz tables.

## API routes (all server-proxied, Gemini key server-side)

- `POST /api/ai/tutor` — student chat. Body: `{ session_id, messages }`.
  Loads the session brief, applies rate limit, returns the assistant reply.
- `POST /api/ai/assist` — generate/refine an assignment draft. Body:
  `{ assignment_id, studentInputs }`. Returns JSON keyed by template fields (or
  prose). Rate-limited.
- `POST /api/ai/brief` (admin) — condense a session script into a brief. Called
  on session save when the script changed; can also be invoked manually.
- A shared server helper `src/lib/ai.ts` wraps the Gemini call (fetch +
  backoff + model/env config) so all three routes share one implementation.

## Components

- `src/lib/ai.ts` — Gemini client wrapper (key, model, backoff). Server-only.
- `src/lib/rate-limit.ts` — count-based per-student throttle over `ai_usage`.
- `src/components/hub/AiTutor.tsx` — floating tutor button + panel (client).
- `src/components/hub/AssignmentAssistant.tsx` — renders studentInputs form +
  the four layouts + inline editing (client). Used inside the assignments tab.
- Admin: extend the assignment builder with an `ai_template` editor (layout
  picker, fields list, studentInputs list, coaching prompt). Extend the session
  builder with the `teaching_script` field.

## Error handling

- AI/network errors surface as friendly inline messages; never crash the tab.
- Rate-limit exhaustion → "busy, try again shortly" with the retry-after hint.
- Malformed AI JSON (assist) → retry once, then fall back to showing raw text
  the student can paste/edit.
- Missing teaching brief → degrade to title/description grounding.

## Out of scope (YAGNI)

- Streaming responses (v1 is request/response).
- Multi-provider abstraction (Gemini only; model is env-swappable).
- Auto-grading of AI-assisted submissions (grading stays as-is).
- Generating Notion/Sheets/Slides artifacts (coach-only by design).
- Vector search / RAG over full scripts (the condensed brief is sufficient and
  cheaper on the free tier).

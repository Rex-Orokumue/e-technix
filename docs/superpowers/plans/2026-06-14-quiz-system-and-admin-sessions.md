# Quiz System + Admin Sessions Rework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a feature-rich quiz system (admin authoring + duplication, student taking, hybrid auto/manual grading) and split the admin Sessions tab into Upcoming/Past with per-session Join links.

**Architecture:** Next.js 16 App Router on Supabase. Three new tables (`quizzes`, `quiz_questions`, `quiz_attempts`). API routes mirror the existing student-session-first / admin-cookie-fallback auth pattern (see `src/app/api/submissions/route.ts`). Admin authoring UI mirrors the assignments admin pages; the student "Quizzes" tab mirrors the assignments tab in `src/app/hub/page.tsx`. Images reuse the existing `chat-attachments` Supabase storage bucket via `/api/chat/upload`.

**Tech Stack:** Next.js 16, React, TypeScript, Supabase (Postgres + Storage), Supabase MCP for schema (`mcp__7a39a9fe-...__apply_migration` / `execute_sql`).

**Testing approach:** This repo has no unit-test framework (package.json scripts: `dev`, `build`, `start`, `lint`). Each task is verified with `npm run lint` + `npm run build` and, where noted, a manual browser check. Commit after each task.

---

## File Structure

**New — schema:**
- Applied via Supabase MCP migration `create_quiz_tables` (no local SQL file; matches existing schema-management approach).

**New — API routes:**
- `src/app/api/quizzes/route.ts` — GET list (student/admin), POST create.
- `src/app/api/quizzes/[id]/route.ts` — GET one (with questions), PATCH, DELETE.
- `src/app/api/quizzes/[id]/duplicate/route.ts` — POST deep-copy.
- `src/app/api/quizzes/[id]/questions/route.ts` — POST add question.
- `src/app/api/quiz-questions/[id]/route.ts` — PATCH, DELETE question.
- `src/app/api/quizzes/[id]/attempts/route.ts` — POST student submit.
- `src/app/api/quiz-attempts/route.ts` — GET admin attempts for a quiz.
- `src/app/api/quiz-attempts/[id]/route.ts` — PATCH manual grade.

**New — shared types/helpers:**
- `src/lib/quiz.ts` — shared TS types + `gradeAttempt()` pure scoring helper.

**New — admin UI:**
- `src/app/admin/quizzes/page.tsx` — list + duplicate/edit.
- `src/app/admin/quizzes/new/page.tsx` — create (thin wrapper around builder).
- `src/app/admin/quizzes/[id]/page.tsx` — edit builder.
- `src/app/admin/quizzes/[id]/grade/page.tsx` — manual grading view.
- `src/components/admin/QuizBuilder.tsx` — metadata + question editor (client).
- `src/components/admin/QuizCard.tsx` — list card with duplicate/edit/delete.

**New — student UI:**
- `src/components/hub/QuizzesTab.tsx` — list + take-quiz screen (client).

**Modified:**
- `src/components/admin/AdminShell.tsx` — add "Quizzes" nav item.
- `src/components/hub/HubShell.tsx` — add "Quizzes" tab + `Tab` type.
- `src/app/hub/page.tsx` — render `QuizzesTab` when `tab === 'quizzes'`.
- `src/app/admin/sessions/page.tsx` — split Upcoming/Past.
- `src/components/admin/AdminSessionCard.tsx` — add Join button + "Live now" badge.

---

## Task 1: Create database schema

**Files:** Supabase migration via MCP (no local file).

- [ ] **Step 1: Apply the migration**

Use `mcp__7a39a9fe-...__apply_migration` with name `create_quiz_tables` and this SQL:

```sql
create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tracks text[],
  phase int not null default 1,
  week int not null default 1,
  session_id uuid references sessions(id) on delete set null,
  time_limit_mins int,
  max_attempts int not null default 1,
  shuffle_questions boolean not null default false,
  status text not null default 'draft',
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  type text not null,
  prompt text not null,
  image_url text,
  options jsonb,
  correct_answer jsonb,
  explanation text,
  points int not null default 1,
  position int not null default 0
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  auto_score int not null default 0,
  manual_score int,
  total_score int,
  max_score int not null default 0,
  status text not null default 'submitted',
  attempt_number int not null default 1,
  started_at timestamptz,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_quiz_questions_quiz on quiz_questions(quiz_id);
create index if not exists idx_quiz_attempts_quiz on quiz_attempts(quiz_id);
create index if not exists idx_quiz_attempts_student on quiz_attempts(student_id);
```

- [ ] **Step 2: Verify**

Run `mcp__7a39a9fe-...__list_tables` (or `execute_sql`: `select table_name from information_schema.tables where table_name like 'quiz%';`).
Expected: `quizzes`, `quiz_questions`, `quiz_attempts`.

- [ ] **Step 3: Commit** (schema is remote; commit a note in the plan checkbox — nothing to add locally yet. Skip if no local changes.)

---

## Task 2: Shared types + grading helper

**Files:**
- Create: `src/lib/quiz.ts`

- [ ] **Step 1: Write the file**

```typescript
export type QuestionType = 'mcq' | 'true_false' | 'short_text';

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  type: QuestionType;
  prompt: string;
  image_url?: string | null;
  options?: string[] | null;       // mcq choices
  correct_answer?: any;            // mcq: number index; true_false: boolean; short_text: null
  explanation?: string | null;
  points: number;
  position: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  tracks?: string[] | null;
  phase: number;
  week: number;
  session_id?: string | null;
  time_limit_mins?: number | null;
  max_attempts: number;
  shuffle_questions: boolean;
  status: 'draft' | 'published' | 'closed';
  due_date?: string | null;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, any>;
  auto_score: number;
  manual_score: number | null;
  total_score: number | null;
  max_score: number;
  status: 'submitted' | 'graded';
  attempt_number: number;
  started_at?: string | null;
  submitted_at: string;
}

export interface GradeResult {
  autoScore: number;
  maxScore: number;
  hasShortText: boolean;
  // per-question feedback for immediate display
  feedback: Record<string, { correct: boolean | null; earned: number; explanation?: string | null }>;
}

/**
 * Auto-grade MCQ + true/false. Short-text earns 0 now (manual later) and
 * marks correct: null so the UI shows "pending review".
 */
export function gradeAttempt(questions: QuizQuestion[], answers: Record<string, any>): GradeResult {
  let autoScore = 0;
  let maxScore = 0;
  let hasShortText = false;
  const feedback: GradeResult['feedback'] = {};

  for (const q of questions) {
    maxScore += q.points;
    const given = answers[q.id];
    if (q.type === 'short_text') {
      hasShortText = true;
      feedback[q.id] = { correct: null, earned: 0, explanation: q.explanation };
      continue;
    }
    let correct = false;
    if (q.type === 'mcq') correct = Number(given) === Number(q.correct_answer);
    else if (q.type === 'true_false') correct = Boolean(given) === Boolean(q.correct_answer);
    const earned = correct ? q.points : 0;
    autoScore += earned;
    feedback[q.id] = { correct, earned, explanation: q.explanation };
  }

  return { autoScore, maxScore, hasShortText, feedback };
}
```

- [ ] **Step 2: Verify** — `npm run lint`. Expected: no errors in `src/lib/quiz.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/quiz.ts
git commit -m "Add quiz shared types and gradeAttempt helper"
```

---

## Task 3: Quizzes list + create API

**Files:**
- Create: `src/app/api/quizzes/route.ts`

- [ ] **Step 1: Write the route** (mirrors `src/app/api/submissions/route.ts` auth pattern)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const ssr = await createClient();
  const { data: { user } } = await ssr.auth.getUser();
  const supabase = createAdminClient();

  if (user) {
    // Student: published quizzes matching their track + their attempts
    const { data: student } = await supabase.from('students').select('track').eq('id', user.id).single();
    const { data: quizzes, error } = await supabase
      .from('quizzes').select('*').eq('status', 'published')
      .order('phase').order('week');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const track = student?.track;
    const visible = (quizzes ?? []).filter(q => !q.tracks || q.tracks.length === 0 || (track && q.tracks.includes(track)));
    const { data: attempts } = await supabase
      .from('quiz_attempts').select('*').eq('student_id', user.id);
    return NextResponse.json({ quizzes: visible, attempts: attempts ?? [] });
  }

  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Admin: all quizzes with question + attempt counts
  const { data: quizzes, error } = await supabase
    .from('quizzes').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: qCounts } = await supabase.from('quiz_questions').select('quiz_id');
  const { data: aCounts } = await supabase.from('quiz_attempts').select('quiz_id');
  const countBy = (rows: any[] | null, key: string) => {
    const m: Record<string, number> = {};
    for (const r of rows ?? []) m[r[key]] = (m[r[key]] ?? 0) + 1;
    return m;
  };
  const qc = countBy(qCounts, 'quiz_id');
  const ac = countBy(aCounts, 'quiz_id');
  const enriched = (quizzes ?? []).map(q => ({ ...q, question_count: qc[q.id] ?? 0, attempt_count: ac[q.id] ?? 0 }));
  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('quizzes').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 2: Verify** — `npm run build`. Expected: compiles; route appears in output.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/quizzes/route.ts
git commit -m "Add quizzes list + create API"
```

---

## Task 4: Single quiz GET/PATCH/DELETE API

**Files:**
- Create: `src/app/api/quizzes/[id]/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: quiz, error } = await supabase.from('quizzes').select('*').eq('id', id).single();
  if (error || !quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data: questions } = await supabase
    .from('quiz_questions').select('*').eq('quiz_id', id).order('position');

  // Students must not receive answers/explanations before submitting
  const ssr = await createClient();
  const { data: { user } } = await ssr.auth.getUser();
  const admin = !user && await isAdminAuthenticated();
  if (admin) return NextResponse.json({ ...quiz, questions: questions ?? [] });

  const safe = (questions ?? []).map(q => ({ ...q, correct_answer: undefined, explanation: undefined }));
  return NextResponse.json({ ...quiz, questions: safe });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('quizzes').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('quizzes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Verify** — `npm run build`. Expected: compiles.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/quizzes/[id]/route.ts
git commit -m "Add single quiz GET/PATCH/DELETE API"
```

---

## Task 5: Duplicate quiz API

**Files:**
- Create: `src/app/api/quizzes/[id]/duplicate/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: orig, error } = await supabase.from('quizzes').select('*').eq('id', id).single();
  if (error || !orig) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { id: _omit, created_at: _omit2, ...rest } = orig as any;
  const { data: copy, error: cErr } = await supabase
    .from('quizzes').insert({ ...rest, title: `${orig.title} (Copy)`, status: 'draft' })
    .select().single();
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  const { data: questions } = await supabase
    .from('quiz_questions').select('*').eq('quiz_id', id).order('position');
  if (questions && questions.length) {
    const cloned = questions.map(({ id: _i, quiz_id: _q, ...qrest }: any) => ({ ...qrest, quiz_id: copy.id }));
    const { error: qErr } = await supabase.from('quiz_questions').insert(cloned);
    if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  }
  return NextResponse.json(copy, { status: 201 });
}
```

- [ ] **Step 2: Verify** — `npm run build`. Expected: compiles.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/quizzes/[id]/duplicate/route.ts
git commit -m "Add quiz duplicate API"
```

---

## Task 6: Question management API

**Files:**
- Create: `src/app/api/quizzes/[id]/questions/route.ts`
- Create: `src/app/api/quiz-questions/[id]/route.ts`

- [ ] **Step 1: Write `quizzes/[id]/questions/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('quiz_questions').insert({ ...body, quiz_id: id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 2: Write `quiz-questions/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('quiz_questions').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Verify** — `npm run build`. Expected: compiles.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/quizzes/[id]/questions/route.ts src/app/api/quiz-questions/[id]/route.ts
git commit -m "Add quiz question management API"
```

---

## Task 7: Student submit attempt API

**Files:**
- Create: `src/app/api/quizzes/[id]/attempts/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { gradeAttempt } from '@/lib/quiz';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ssr = await createClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { answers, started_at } = await req.json();
  const supabase = createAdminClient();

  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', id).single();
  if (!quiz || quiz.status !== 'published')
    return NextResponse.json({ error: 'Quiz not available' }, { status: 403 });

  // Due date check (GMT+1 end of day)
  if (quiz.due_date) {
    const nowG1 = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(`${quiz.due_date}T23:59:59+01:00`);
    if (nowG1 > end) return NextResponse.json({ error: 'Quiz is past its due date' }, { status: 403 });
  }

  // Attempts-left check
  const { data: prior } = await supabase
    .from('quiz_attempts').select('id').eq('quiz_id', id).eq('student_id', user.id);
  const used = prior?.length ?? 0;
  if (used >= quiz.max_attempts)
    return NextResponse.json({ error: 'No attempts remaining' }, { status: 403 });

  const { data: questions } = await supabase
    .from('quiz_questions').select('*').eq('quiz_id', id).order('position');

  const result = gradeAttempt((questions ?? []) as any, answers ?? {});
  const status = result.hasShortText ? 'submitted' : 'graded';
  const totalScore = result.hasShortText ? null : result.autoScore;

  const { data: attempt, error } = await supabase.from('quiz_attempts').insert({
    quiz_id: id, student_id: user.id, answers: answers ?? {},
    auto_score: result.autoScore, max_score: result.maxScore,
    manual_score: result.hasShortText ? null : 0,
    total_score: totalScore, status,
    attempt_number: used + 1,
    started_at: started_at ?? null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return feedback (with explanations) for immediate display
  return NextResponse.json({ attempt, feedback: result.feedback }, { status: 201 });
}
```

- [ ] **Step 2: Verify** — `npm run build`. Expected: compiles.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/quizzes/[id]/attempts/route.ts
git commit -m "Add student quiz submit API with hybrid grading"
```

---

## Task 8: Admin grading API

**Files:**
- Create: `src/app/api/quiz-attempts/route.ts`
- Create: `src/app/api/quiz-attempts/[id]/route.ts`

- [ ] **Step 1: Write `quiz-attempts/route.ts`** (GET attempts for a quiz)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const quizId = new URL(req.url).searchParams.get('quiz_id');
  if (!quizId) return NextResponse.json({ error: 'quiz_id required' }, { status: 400 });
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('quiz_attempts').select('*, students(full_name, email, track)')
    .eq('quiz_id', quizId).order('submitted_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
```

- [ ] **Step 2: Write `quiz-attempts/[id]/route.ts`** (PATCH manual grade)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { manual_score } = await req.json();
  const supabase = createAdminClient();
  const { data: attempt } = await supabase.from('quiz_attempts').select('auto_score').eq('id', id).single();
  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const total = (attempt.auto_score ?? 0) + (Number(manual_score) || 0);
  const { data, error } = await supabase.from('quiz_attempts')
    .update({ manual_score: Number(manual_score) || 0, total_score: total, status: 'graded' })
    .eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

- [ ] **Step 3: Verify** — `npm run build`. Expected: compiles.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/quiz-attempts/route.ts src/app/api/quiz-attempts/[id]/route.ts
git commit -m "Add admin quiz grading API"
```

---

## Task 9: Admin nav + quizzes list page + card

**Files:**
- Modify: `src/components/admin/AdminShell.tsx` (navItems array, after Assignments)
- Create: `src/components/admin/QuizCard.tsx`
- Create: `src/app/admin/quizzes/page.tsx`

- [ ] **Step 1: Add nav item in `AdminShell.tsx`**

In the `navItems` array, add after the `submissions` entry:

```typescript
  { href: '/admin/quizzes',       label: 'Quizzes',       icon: '🧠' },
```

- [ ] **Step 2: Create `QuizCard.tsx`** (client component)

Mirror the structure/styling of `src/components/admin/AdminSessionCard.tsx`. A `'use client'` card showing: status badge (draft=grey, published=green, closed=muted), title, `question_count` questions · `attempt_count` attempts · track/phase/week. Action buttons:
- **Edit** → `Link` to `/admin/quizzes/${quiz.id}`
- **Grade** → `Link` to `/admin/quizzes/${quiz.id}/grade`
- **Duplicate** → `onClick` calls `POST /api/quizzes/${quiz.id}/duplicate` then `router.refresh()`
- **Delete** → confirm-then `DELETE /api/quizzes/${quiz.id}` then `router.refresh()`

Use `useRouter` from `next/navigation`. Use the same CSS-variable colors used elsewhere (`var(--surface)`, `var(--border)`, `var(--cyan)`).

```tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',     color: '#7A8FAD', bg: 'rgba(122,143,173,0.1)' },
  published: { label: 'Published', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  closed:    { label: 'Closed',    color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

export default function QuizCard({ quiz }: { quiz: any }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const meta = STATUS[quiz.status] ?? STATUS.draft;

  const duplicate = async () => {
    setBusy(true);
    await fetch(`/api/quizzes/${quiz.id}/duplicate`, { method: 'POST' });
    setBusy(false); router.refresh();
  };
  const del = async () => {
    setBusy(true);
    await fetch(`/api/quizzes/${quiz.id}`, { method: 'DELETE' });
    setBusy(false); setConfirming(false); router.refresh();
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.color}40`, borderRadius: '4px', padding: '0.1rem 0.45rem', textTransform: 'uppercase' }}>{meta.label}</span>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.title}</h3>
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
          {quiz.question_count ?? 0} questions · {quiz.attempt_count ?? 0} attempts · Phase {quiz.phase} Week {quiz.week}
          {quiz.tracks?.length ? ` · ${quiz.tracks.join(', ')}` : ' · All tracks'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap' }}>
        <Link href={`/admin/quizzes/${quiz.id}`} style={btn('var(--cyan-border)', 'var(--cyan)')}>Edit</Link>
        <Link href={`/admin/quizzes/${quiz.id}/grade`} style={btn('var(--border)', 'var(--muted)')}>Grade</Link>
        <button onClick={duplicate} disabled={busy} style={btn('var(--border)', 'var(--muted)') as any}>Duplicate</button>
        {confirming ? (
          <>
            <button onClick={del} disabled={busy} style={btn('rgba(255,51,51,0.3)', '#FF5555') as any}>Confirm</button>
            <button onClick={() => setConfirming(false)} style={btn('var(--border)', 'var(--muted)') as any}>✕</button>
          </>
        ) : (
          <button onClick={() => setConfirming(true)} style={btn('var(--border)', 'var(--muted)') as any}>Delete</button>
        )}
      </div>
    </div>
  );
}

function btn(border: string, color: string): React.CSSProperties {
  return { padding: '0.4rem 0.8rem', background: 'transparent', border: `1px solid ${border}`, color, borderRadius: '7px', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none', cursor: 'pointer' };
}
```

- [ ] **Step 3: Create `src/app/admin/quizzes/page.tsx`** (server component, mirrors `admin/sessions/page.tsx` header + floating button)

```tsx
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import QuizCard from '@/components/admin/QuizCard';

export default async function AdminQuizzesPage() {
  const supabase = createAdminClient();
  const { data: quizzes } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
  const qc = (await supabase.from('quiz_questions').select('quiz_id')).data ?? [];
  const ac = (await supabase.from('quiz_attempts').select('quiz_id')).data ?? [];
  const count = (rows: any[], id: string) => rows.filter(r => r.quiz_id === id).length;
  const enriched = (quizzes ?? []).map(q => ({ ...q, question_count: count(qc, q.id), attempt_count: count(ac, q.id) }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Quizzes</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{enriched.length} quizzes</p>
        </div>
        <Link href="/admin/quizzes/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', background: 'var(--cyan)', color: '#070D1A', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>+ New Quiz</Link>
      </div>
      {enriched.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🧠</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No quizzes yet. Create your first quiz.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {enriched.map(q => <QuizCard key={q.id} quiz={q} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify** — `npm run build`. Manually visit `/admin/quizzes` (empty state shows).

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AdminShell.tsx src/components/admin/QuizCard.tsx src/app/admin/quizzes/page.tsx
git commit -m "Add admin quizzes list page, card, and nav"
```

---

## Task 10: Quiz builder (create + edit)

**Files:**
- Create: `src/components/admin/QuizBuilder.tsx`
- Create: `src/app/admin/quizzes/new/page.tsx`
- Create: `src/app/admin/quizzes/[id]/page.tsx`

- [ ] **Step 1: Create `QuizBuilder.tsx`** (client component)

Props: `{ quiz?: Quiz; questions?: QuizQuestion[] }` (absent = create mode). Behavior:
- **Metadata form:** title, description, track multi-select (checkboxes from `TRACKS` in `src/lib/tracks.ts`; empty = all), phase (number), week (number), optional session dropdown (fetch `/api/sessions`), `time_limit_mins` (optional number), `max_attempts` (number, default 1), `shuffle_questions` (checkbox), `due_date` (date), `status` select (draft/published/closed).
- **Create mode:** "Create Quiz" button → `POST /api/quizzes` → on success `router.push('/admin/quizzes/' + newId)` so questions can be added (questions require a quiz id).
- **Edit mode:** metadata auto-saves via `PATCH /api/quizzes/:id` on a "Save" button. Below metadata, a **Questions** section:
  - List existing questions (ordered by `position`), each editable inline.
  - **Add question** button appends a new question of a chosen type via `POST /api/quizzes/:id/questions`, then refreshes local list.
  - Per question editor by type:
    - `mcq`: prompt, dynamic list of option text inputs (add/remove), radio to pick `correct_answer` (index), points, explanation, optional image.
    - `true_false`: prompt, radio True/False for `correct_answer`, points, explanation, optional image.
    - `short_text`: prompt, points (for manual max), explanation, optional image. No correct answer.
  - Image upload reuses `POST /api/chat/upload` (returns `{ url }`); store in `image_url`.
  - Save question → `PATCH /api/quiz-questions/:id`. Delete → `DELETE /api/quiz-questions/:id`.
  - Reorder: up/down arrows that swap `position` values via two PATCH calls.

Use the same input styling pattern as other admin forms (look at `src/app/admin/sessions/new/page.tsx` for the `inputStyle`/`labelStyle` convention). Keep each question in a bordered card.

> Implementation note: this is the largest file. Build the metadata form first, get it committing, then add the question editor. Keep helper subcomponents (`QuestionEditor`) in the same file.

- [ ] **Step 2: Create `src/app/admin/quizzes/new/page.tsx`**

```tsx
import QuizBuilder from '@/components/admin/QuizBuilder';

export default function NewQuizPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem' }}>New Quiz</h1>
      <QuizBuilder />
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/admin/quizzes/[id]/page.tsx`**

```tsx
export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import QuizBuilder from '@/components/admin/QuizBuilder';

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', id).single();
  const { data: questions } = await supabase.from('quiz_questions').select('*').eq('quiz_id', id).order('position');
  if (!quiz) return <div style={{ color: 'var(--muted)' }}>Quiz not found.</div>;
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '1.5rem' }}>Edit Quiz</h1>
      <QuizBuilder quiz={quiz} questions={questions ?? []} />
    </div>
  );
}
```

- [ ] **Step 4: Verify** — `npm run build`. Manually: create a quiz, add one question of each type, set an MCQ correct answer, upload an image, set status=published.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/QuizBuilder.tsx src/app/admin/quizzes/new/page.tsx "src/app/admin/quizzes/[id]/page.tsx"
git commit -m "Add quiz builder (create + edit with question editor)"
```

---

## Task 11: Admin grading page

**Files:**
- Create: `src/app/admin/quizzes/[id]/grade/page.tsx`

- [ ] **Step 1: Create the page** (server fetch + client grading rows)

Server component fetches quiz, questions, and `GET /api/quiz-attempts?quiz_id=` server-side via the admin client directly. For each attempt, render student name, total/max, status. Attempts with `status === 'submitted'` (i.e. has ungraded short-text) show each short-text question's prompt + the student's answer + a points input (max = that question's points) and a **Save grade** button calling `PATCH /api/quiz-attempts/:id` with summed `manual_score`. Auto-graded attempts (`status === 'graded'`) just show the score read-only.

Mirror the grouping/card styling of `src/components/admin/AdminSubmissionsView.tsx`. Put the interactive grading row in a small `'use client'` subcomponent (`AttemptGradeRow`) either inline in a sibling file `src/components/admin/AttemptGradeRow.tsx` or within the page if it stays a client component.

```tsx
// src/app/admin/quizzes/[id]/grade/page.tsx
export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import AttemptGradeRow from '@/components/admin/AttemptGradeRow';

export default async function GradeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', id).single();
  const { data: questions } = await supabase.from('quiz_questions').select('*').eq('quiz_id', id).order('position');
  const { data: attempts } = await supabase
    .from('quiz_attempts').select('*, students(full_name, email, track)')
    .eq('quiz_id', id).order('submitted_at', { ascending: false });
  const shortText = (questions ?? []).filter(q => q.type === 'short_text');

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '0.4rem' }}>{quiz?.title} — Submissions</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>{attempts?.length ?? 0} attempts</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(attempts ?? []).map(a => (
          <AttemptGradeRow key={a.id} attempt={a} shortTextQuestions={shortText} />
        ))}
        {(attempts ?? []).length === 0 && <p style={{ color: 'var(--muted)' }}>No attempts yet.</p>}
      </div>
    </div>
  );
}
```

Then create `src/components/admin/AttemptGradeRow.tsx` (client): shows student + score; if `attempt.status === 'submitted'`, renders each short-text question prompt, the student's answer from `attempt.answers[q.id]`, and a number input per question; **Save** sums them and PATCHes `/api/quiz-attempts/${attempt.id}` with `manual_score`, then `location.reload()`.

- [ ] **Step 2: Verify** — `npm run build`. Manually grade a submitted short-text attempt; confirm total updates.

- [ ] **Step 3: Commit**

```bash
git add "src/app/admin/quizzes/[id]/grade/page.tsx" src/components/admin/AttemptGradeRow.tsx
git commit -m "Add admin quiz grading page"
```

---

## Task 12: Student Quizzes tab

**Files:**
- Modify: `src/components/hub/HubShell.tsx` (add `'quizzes'` to `Tab` type + a navItem)
- Modify: `src/app/hub/page.tsx` (render `QuizzesTab` when `tab === 'quizzes'`; add `'quizzes'` to `VALID_TABS`)
- Create: `src/components/hub/QuizzesTab.tsx`

- [ ] **Step 1: Update `HubShell.tsx`**

Add `'quizzes'` to the `Tab` union type, and add a navItem after `assignments`:

```typescript
  { id: 'quizzes',     label: 'Quizzes',        icon: '🧠' },
```

- [ ] **Step 2: Update `src/app/hub/page.tsx`**

Add `'quizzes'` to the `VALID_TABS` array (find the existing `VALID_TABS` const). Then add the render branch near the other tabs:

```tsx
{tab === 'quizzes' && student && (
  <QuizzesTab studentId={student.id} track={student.track} />
)}
```

Add the import at top: `import QuizzesTab from '@/components/hub/QuizzesTab';`

- [ ] **Step 3: Create `QuizzesTab.tsx`** (client)

Two views in one component, toggled by local `activeQuiz` state:

**List view** — on mount `GET /api/quizzes` → `{ quizzes, attempts }`. For each quiz compute: attempts used (count of attempts with matching `quiz_id`), best `total_score`, attempts left (`max_attempts - used`), whether past due. Render a card: title, description, "Phase X Week Y", question count not shown (not needed), status line ("Not started" / "Score: X/Y" / "Attempts left: N" / "Past due" / "Awaiting review" when latest attempt status is `submitted`). A **Start / Retake** button (disabled if no attempts left or past due) sets `activeQuiz` by fetching `GET /api/quizzes/:id` (returns questions without answers).

**Take view** — render the quiz: if `shuffle_questions`, shuffle a local copy of questions once (useMemo). Show each question (prompt, image if any, inputs by type — radios for mcq/true_false, textarea for short_text). If `time_limit_mins` set, show a countdown (useEffect interval); at 0, auto-submit. **Submit** → `POST /api/quizzes/:id/attempts` with `{ answers, started_at }` → response `{ attempt, feedback }`. Switch to a **results view**: show auto score (`attempt.auto_score`/`attempt.max_score`), and per question the `feedback[qid].correct` (✓/✗/⏳ pending for short-text) with `explanation`. A "Back to quizzes" button returns to list and re-fetches.

Reuse `inputStyle` conventions from the hub page. Use `var(--cyan)` for correct, `#FF5555` for wrong, `#F59E0B` for pending.

Store `answers` as `Record<questionId, value>` (mcq: option index number; true_false: boolean; short_text: string).

- [ ] **Step 4: Verify** — `npm run build`. Manually as a student: take a published quiz with one MCQ + one short-text, submit, confirm auto score + explanation show and short-text shows "pending review". Confirm attempts-left decrements and timer auto-submits.

- [ ] **Step 5: Commit**

```bash
git add src/components/hub/HubShell.tsx src/app/hub/page.tsx src/components/hub/QuizzesTab.tsx
git commit -m "Add student Quizzes tab (take quiz + instant auto-grading)"
```

---

## Task 13: Admin Sessions — Upcoming/Past split + Join

**Files:**
- Modify: `src/app/admin/sessions/page.tsx`
- Modify: `src/components/admin/AdminSessionCard.tsx`

- [ ] **Step 1: Rework `admin/sessions/page.tsx`**

Replace the single grouped list with two sections. Compute `todayGMT1` server-side:

```tsx
const todayGMT1 = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
const all = sessions ?? [];
const upcoming = all.filter(s => s.date >= todayGMT1).sort((a, b) => a.date.localeCompare(b.date));
const past = all.filter(s => s.date < todayGMT1);
```

Render **Upcoming** first (flat list, soonest first), then **Past** using the existing phase/week `grouped` logic but built from `past` instead of all sessions. Keep the header and floating "+ Add Session" button as-is. If `upcoming` is empty, show a small muted "No upcoming sessions." line.

- [ ] **Step 2: Add Join button + Live badge in `AdminSessionCard.tsx`**

Add a prop or compute inline: the card already has `session.meet_link`, `session.date`, `session.start_time`. Add:
- A **Join** anchor (`<a href={session.meet_link} target="_blank">`) styled like the primary cyan button, shown only when `meet_link` exists.
- A "Live now" badge when the session is today and current GMT+1 time is within `[start, start+120min]`. Compute with the same logic as the hub:

```tsx
const nowG1 = new Date(Date.now() + 60 * 60 * 1000);
const todayG1 = nowG1.toISOString().slice(0, 10);
const mins = nowG1.getUTCHours() * 60 + nowG1.getUTCMinutes();
const [sh, sm] = (session.start_time ?? '19:00').split(':').map(Number);
const startMins = sh * 60 + (sm || 0);
const isLive = session.date === todayG1 && mins >= startMins && mins < startMins + 120;
```

Since `AdminSessionCard` is already `'use client'`, this computes on render. Show an amber "🔴 Live now" badge when `isLive`.

- [ ] **Step 3: Verify** — `npm run build`. Manually: a future-dated session appears under Upcoming with a Join button; past sessions stay grouped under Past.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/sessions/page.tsx src/components/admin/AdminSessionCard.tsx
git commit -m "Admin sessions: split Upcoming/Past with Join links and Live badge"
```

---

## Task 14: Final build, push

- [ ] **Step 1:** `npm run lint && npm run build`. Expected: clean.
- [ ] **Step 2:** `git push origin main`.

---

## Notes for the implementer

- **Auth pattern:** student GET/POST routes call `createClient()` (SSR) and check `auth.getUser()` FIRST, falling back to `isAdminAuthenticated()`. Admin-only routes check `isAdminAuthenticated()` only. This matches `src/app/api/submissions/route.ts` exactly — do not deviate.
- **Next 16 route params:** dynamic route handlers receive `params` as a `Promise` — always `const { id } = await params;` (see existing `[id]` routes).
- **No answer leak:** the student-facing `GET /api/quizzes/[id]` strips `correct_answer` and `explanation`. Explanations are only delivered in the submit response. Keep it that way.
- **Tracks:** import `TRACKS` from `src/lib/tracks.ts`. Empty `tracks` array / null = visible to all tracks (mirrors sessions/assignments `tracks.is.null` filtering).
- **Image upload:** reuse `POST /api/chat/upload` (existing, 5 MB limit, returns `{ url, type, name }`). No new bucket needed.

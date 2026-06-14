# Quiz System + Admin Sessions Rework — Design

Date: 2026-06-14

## Goal

1. Add a feature-rich quiz system: admin creates quizzes with multiple question
   types, students take and submit them, admin can duplicate a quiz instead of
   building from scratch.
2. Rework the admin Sessions tab to separate Upcoming vs Past sessions and add a
   Join link per session.

## Quiz System

### Question types
- Multiple choice (one correct answer)
- True / False
- Short text answer

### Per-question features
- Custom point value (default 1)
- Explanation shown to the student after they answer
- Optional image (uploaded to existing Supabase storage)
- Quiz-level shuffle of question order per student

### Grading — hybrid
- On submit, MCQ and True/False are auto-graded instantly into `auto_score`.
  The student immediately sees their auto score and per-question
  correct/incorrect + explanation.
- Short-text answers are not auto-graded. They wait for admin manual scoring.
  When the admin grades them, `manual_score` is set, `total_score = auto_score
  + manual_score`, and the attempt status flips to `graded`. The student's
  visible score updates to the total.
- A quiz with no short-text questions is fully graded on submit.

### Access & attempts
- Targeted like assignments: `track[]`, `phase`, `week`, plus an optional
  `session_id` link.
- `max_attempts` is admin-configurable per quiz (default 1).
- A `due_date` closes submissions.
- Optional per-quiz time limit (`time_limit_mins`). When set, a countdown starts
  when the student opens the quiz and auto-submits at zero. When null, students
  have until the due date.

### Results visibility
- Auto-graded portion shown immediately after submit.
- Manual (short-text) portion appears once the admin grades it.

## Data model (3 new tables)

### `quizzes`
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| title | text | |
| description | text | nullable |
| tracks | text[] | null = all tracks (mirrors sessions/assignments) |
| phase | int | |
| week | int | |
| session_id | uuid | nullable, FK sessions |
| time_limit_mins | int | nullable |
| max_attempts | int | default 1 |
| shuffle_questions | bool | default false |
| status | text | 'draft' \| 'published' \| 'closed' |
| due_date | date | nullable |
| created_at | timestamptz | default now() |

### `quiz_questions`
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| quiz_id | uuid | FK quizzes, on delete cascade |
| type | text | 'mcq' \| 'true_false' \| 'short_text' |
| prompt | text | |
| image_url | text | nullable |
| options | jsonb | array of choice strings (mcq); null for others |
| correct_answer | jsonb | mcq: index; true_false: bool; short_text: null |
| explanation | text | nullable |
| points | int | default 1 |
| position | int | ordering |

### `quiz_attempts`
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| quiz_id | uuid | FK quizzes |
| student_id | uuid | FK students |
| answers | jsonb | map question_id -> answer |
| auto_score | int | sum of auto-graded points earned |
| manual_score | int | nullable until graded |
| total_score | int | nullable until fully graded |
| max_score | int | sum of all question points (snapshot) |
| status | text | 'submitted' \| 'graded' |
| attempt_number | int | 1-based |
| started_at | timestamptz | |
| submitted_at | timestamptz | |

Unique-ish constraint: enforce `max_attempts` in the submit API by counting
existing attempts for `(quiz_id, student_id)` rather than a DB unique key
(since multiple attempts may be allowed).

## API routes

Mirror existing admin/student split (student session checked first, admin cookie
fallback), same as `/api/submissions`.

- `GET /api/quizzes` — student: published quizzes matching their track/phase/week
  with their attempt summary; admin: all quizzes.
- `POST /api/quizzes` — admin create.
- `PATCH /api/quizzes/:id` — admin edit metadata / status.
- `DELETE /api/quizzes/:id` — admin delete (cascades questions/attempts).
- `POST /api/quizzes/:id/duplicate` — admin deep-copy quiz + questions; new quiz
  is `status: 'draft'`, title suffixed " (Copy)".
- `GET /api/quizzes/:id` — full quiz with questions. For students, omits
  `correct_answer`/`explanation` until after submission.
- `POST /api/quizzes/:id/questions`, `PATCH`/`DELETE /api/quiz-questions/:id` —
  admin manage questions.
- `POST /api/quizzes/:id/attempts` — student submit. Validates attempts left and
  due date, computes `auto_score`, sets `status` ('graded' if no short-text else
  'submitted'), returns score + per-question correctness/explanations.
- `GET /api/quiz-attempts?quiz_id=` — admin: attempts needing grading.
- `PATCH /api/quiz-attempts/:id` — admin set manual scores, recompute total,
  mark graded.

## Admin UI — `/admin/quizzes`

- List page: cards with status badge (draft/published/closed), question count,
  attempt count, **Duplicate** and **Edit** actions. Floating "+ New Quiz".
- Builder page: metadata form (title, description, track/phase/week, optional
  session, time limit, max attempts, shuffle, due date, status) + question
  editor. Each question row: type selector, prompt, optional image upload,
  type-specific answer inputs, points, explanation, drag-to-reorder.
- Submissions/grading view: list attempts; flag ones with ungraded short-text;
  inline manual scoring that recomputes and releases the total.

## Student UI — new "Quizzes" hub tab

- List of quizzes matching the student, each showing status (not started / in
  progress / submitted), score when available, attempts remaining.
- Take-quiz screen: single scrollable form, questions shuffled if configured,
  countdown timer if a limit is set (auto-submits at 0). On submit: instant auto
  score with per-question correct/incorrect markers and explanations. Short-text
  shows "pending review".

## Admin Sessions rework

Replace the flat phase/week list with two sections:

- **Upcoming** — sessions with `date >= today` (GMT+1), sorted soonest first.
  Each card gets a **Join** button when `meet_link` exists. A session currently
  within its time window shows a "Live now" badge.
- **Past** — sessions with `date < today`, keeping the existing phase/week
  grouping and `AdminSessionCard`.

Today comparison uses the same GMT+1 logic already in the student hub.

## Reuse / integration

- Targeting and image storage reuse the existing assignments + chat-upload
  patterns.
- Add "Quizzes" nav entries to `AdminShell` and `HubShell`.

## Out of scope (YAGNI)

- Question banks / cross-quiz reuse beyond whole-quiz duplication.
- Per-question timers (only quiz-level timer).
- Auto-grading of short text (always manual).
- Result release workflow (auto part is always immediate).

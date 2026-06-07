// Shared grade calculation logic used by student + admin APIs

export const GRADE_WEIGHTS = {
  attendance:    0.20,
  assignments:   0.35,
  participation: 0.20,
  capstone:      0.25,
} as const;

const CONTRIBUTION_MULTIPLIERS: Record<string, number> = {
  full:    1.00,
  partial: 0.75,
  minimal: 0.50,
};

export interface GradedSubmission {
  id: string;
  assignment_id: string;
  score: number;
  contribution: string;
  title?: string;
  code?: string;
  phase?: number;
}

export interface ParticipationScore {
  session_id: string;
  score: number;
  notes?: string | null;
}

export interface CapstoneGrade {
  content_score: number;
  presentation_score: number;
  delivery_score: number;
  qa_score: number;
  notes?: string | null;
}

export interface GradeSummary {
  attendance:    { score: number | null; attended: number; total: number };
  assignments:   { score: number | null; count: number; items: GradedSubmission[] };
  participation: { score: number | null; count: number };
  capstone:      { score: number | null; graded: boolean; rubric: CapstoneGrade | null };
  overall:       number;
  passed:        boolean;
  pending:       string[];
}

export function calcCapstoneScore(c: CapstoneGrade): number {
  const raw =
    c.content_score      * 0.35 +
    c.presentation_score * 0.25 +
    c.delivery_score     * 0.20 +
    c.qa_score           * 0.20;
  return raw * 10; // 1-10 → 0-100
}

export function calcGradeSummary(params: {
  phase1Sessions:      { id: string }[];
  attendedSessionIds:  Set<string>;
  gradedSubmissions:   GradedSubmission[];
  participationScores: ParticipationScore[];
  capstone:            CapstoneGrade | null;
}): GradeSummary {
  const { phase1Sessions, attendedSessionIds, gradedSubmissions, participationScores, capstone } = params;

  const attended = phase1Sessions.filter(s => attendedSessionIds.has(s.id)).length;
  const total    = phase1Sessions.length;
  const attendanceScore = total > 0 ? (attended / total) * 100 : null;

  const phase1Subs = gradedSubmissions.filter(s => (s.phase ?? 1) === 1);
  const assignmentScore = phase1Subs.length > 0
    ? phase1Subs.reduce((sum, s) => sum + s.score * (CONTRIBUTION_MULTIPLIERS[s.contribution] ?? 1), 0) / phase1Subs.length
    : null;

  const participationScore = participationScores.length > 0
    ? (participationScores.reduce((s, p) => s + p.score, 0) / participationScores.length) / 5 * 100
    : null;

  const capstoneScore = capstone ? calcCapstoneScore(capstone) : null;

  const available: Array<{ key: keyof typeof GRADE_WEIGHTS; score: number }> = [];
  if (attendanceScore    !== null) available.push({ key: 'attendance',    score: attendanceScore });
  if (assignmentScore    !== null) available.push({ key: 'assignments',   score: assignmentScore });
  if (participationScore !== null) available.push({ key: 'participation', score: participationScore });
  if (capstoneScore      !== null) available.push({ key: 'capstone',      score: capstoneScore });

  const totalW = available.reduce((s, v) => s + GRADE_WEIGHTS[v.key], 0);
  const overall = totalW > 0
    ? available.reduce((s, v) => s + v.score * (GRADE_WEIGHTS[v.key] / totalW), 0)
    : 0;

  const pending = (Object.keys(GRADE_WEIGHTS) as Array<keyof typeof GRADE_WEIGHTS>)
    .filter(k => !available.find(v => v.key === k));

  return {
    attendance:    { score: attendanceScore !== null ? Math.round(attendanceScore) : null, attended, total },
    assignments:   { score: assignmentScore !== null ? Math.round(assignmentScore) : null, count: phase1Subs.length, items: phase1Subs },
    participation: { score: participationScore !== null ? Math.round(participationScore) : null, count: participationScores.length },
    capstone:      { score: capstoneScore !== null ? Math.round(capstoneScore) : null, graded: capstone !== null, rubric: capstone },
    overall:       Math.round(overall),
    passed:        Math.round(overall) >= 60,
    pending,
  };
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calcGradeSummary } from '@/lib/grades';

export async function GET() {
  const ssrClient = await createClient();
  const { data: { user } } = await ssrClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const nowGMT1  = new Date(Date.now() + 60 * 60 * 1000);
  const todayStr = nowGMT1.toISOString().slice(0, 10);

  const [attRows, sessRows, subRows, partRows, capRow] = await Promise.all([
    supabase.from('attendance').select('session_id').eq('student_id', user.id),
    supabase.from('sessions').select('id, phase').lte('date', todayStr).eq('phase', 1),
    supabase
      .from('assignment_submissions')
      .select('id, assignment_id, score, contribution, assignments(title, assignment_code, phase)')
      .eq('student_id', user.id)
      .not('score', 'is', null),
    supabase.from('participation_scores').select('session_id, score, notes').eq('student_id', user.id),
    supabase.from('capstone_grades').select('*').eq('student_id', user.id).eq('phase', 1).maybeSingle(),
  ]);

  const phase1Sessions     = (sessRows.data ?? []).filter(s => s.phase === 1);
  const attendedSessionIds = new Set((attRows.data ?? []).map(a => a.session_id));
  const gradedSubs         = (subRows.data ?? []).map((s: any) => ({
    id:             s.id,
    assignment_id:  s.assignment_id,
    score:          s.score,
    contribution:   s.contribution ?? 'full',
    penalty_status: s.penalty_status ?? 'none',
    title:          s.assignments?.title,
    code:           s.assignments?.assignment_code,
    phase:          s.assignments?.phase ?? 1,
  }));

  const summary = calcGradeSummary({
    phase1Sessions,
    attendedSessionIds,
    gradedSubmissions:   gradedSubs,
    participationScores: partRows.data ?? [],
    capstone:            capRow.data ?? null,
  });

  return NextResponse.json(summary);
}

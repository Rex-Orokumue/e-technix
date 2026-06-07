import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { calcGradeSummary } from '@/lib/grades';

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase   = createAdminClient();
  const studentId  = req.nextUrl.searchParams.get('student_id');
  const nowGMT1    = new Date(Date.now() + 60 * 60 * 1000);
  const todayStr   = nowGMT1.toISOString().slice(0, 10);

  if (studentId) {
    // Full grade detail for one student (for grading panel)
    const [attRows, sessRows, subRows, partRows, capRow, allSessions] = await Promise.all([
      supabase.from('attendance').select('session_id').eq('student_id', studentId),
      supabase.from('sessions').select('id, phase').lte('date', todayStr).eq('phase', 1),
      supabase
        .from('assignment_submissions')
        .select('id, assignment_id, score, contribution, status, drive_link, submitted_at, assignments(title, assignment_code, phase, week)')
        .eq('student_id', studentId),
      supabase.from('participation_scores').select('*').eq('student_id', studentId),
      supabase.from('capstone_grades').select('*').eq('student_id', studentId).eq('phase', 1).maybeSingle(),
      supabase.from('sessions').select('id, title, date, session_number, phase, week').lte('date', todayStr).eq('phase', 1).order('date'),
    ]);

    const phase1Sessions     = (sessRows.data ?? []).filter(s => s.phase === 1);
    const attendedSessionIds = new Set((attRows.data ?? []).map(a => a.session_id));
    const gradedSubs         = (subRows.data ?? [])
      .filter((s: any) => s.score !== null)
      .map((s: any) => ({
        id:            s.id,
        assignment_id: s.assignment_id,
        score:         s.score,
        contribution:  s.contribution ?? 'full',
        phase:         s.assignments?.phase ?? 1,
        title:         s.assignments?.title,
        code:          s.assignments?.assignment_code,
      }));

    const summary = calcGradeSummary({
      phase1Sessions,
      attendedSessionIds,
      gradedSubmissions:   gradedSubs,
      participationScores: partRows.data ?? [],
      capstone:            capRow.data ?? null,
    });

    return NextResponse.json({
      summary,
      sessions:              allSessions.data ?? [],
      submissions:           subRows.data ?? [],
      participation_scores:  partRows.data ?? [],
      capstone:              capRow.data ?? null,
    });
  }

  // List all students with their overall scores
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, track, email')
    .order('full_name');

  if (!students) return NextResponse.json([]);

  const nowGMT1Date = new Date(Date.now() + 60 * 60 * 1000);
  const today       = nowGMT1Date.toISOString().slice(0, 10);

  const [allAtt, allSess, allSubs, allPart, allCap] = await Promise.all([
    supabase.from('attendance').select('student_id, session_id'),
    supabase.from('sessions').select('id, phase').lte('date', today).eq('phase', 1),
    supabase.from('assignment_submissions').select('student_id, assignment_id, score, contribution, assignments(phase)').not('score', 'is', null),
    supabase.from('participation_scores').select('student_id, score'),
    supabase.from('capstone_grades').select('student_id, content_score, presentation_score, delivery_score, qa_score').eq('phase', 1),
  ]);

  const phase1Sessions = (allSess.data ?? []).filter(s => s.phase === 1);

  const result = students.map(student => {
    const attended     = new Set((allAtt.data ?? []).filter(a => a.student_id === student.id).map(a => a.session_id));
    const subs         = (allSubs.data ?? []).filter((s: any) => s.student_id === student.id && s.assignments?.phase === 1 && s.score !== null)
      .map((s: any) => ({ id: '', assignment_id: s.assignment_id, score: s.score, contribution: s.contribution ?? 'full', phase: 1 }));
    const parts        = (allPart.data ?? []).filter(p => p.student_id === student.id).map(p => ({ session_id: '', score: p.score }));
    const cap          = (allCap.data ?? []).find(c => c.student_id === student.id) ?? null;

    const summary = calcGradeSummary({
      phase1Sessions,
      attendedSessionIds:  attended,
      gradedSubmissions:   subs,
      participationScores: parts,
      capstone:            cap,
    });

    return { ...student, summary };
  });

  return NextResponse.json(result);
}

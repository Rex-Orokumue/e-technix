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
    const now = new Date();
    const track = student?.track;
    const visible = (quizzes ?? []).filter(q =>
      (!q.tracks || q.tracks.length === 0 || (track && q.tracks.includes(track))) &&
      (!q.opens_at || new Date(q.opens_at) <= now) &&
      (!q.closes_at || new Date(q.closes_at) >= now)
    );
    const { data: attempts } = await supabase
      .from('quiz_attempts').select('*').eq('student_id', user.id);
    // Also show quizzes the student has attempted even if closed/expired (any status)
    const attemptedIds = new Set((attempts ?? []).map((a: any) => a.quiz_id));
    if (attemptedIds.size > 0) {
      const alreadyShown = new Set(visible.map((v: any) => v.id));
      const missing = Array.from(attemptedIds).filter(id => !alreadyShown.has(id));
      if (missing.length > 0) {
        const { data: extra } = await supabase
          .from('quizzes').select('*').in('id', missing);
        const filtered = (extra ?? []).filter(q =>
          !q.tracks || q.tracks.length === 0 || (track && q.tracks.includes(track))
        );
        return NextResponse.json({ quizzes: [...visible, ...filtered], attempts: attempts ?? [] });
      }
    }
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

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushToAll } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  // Get the next 7 days of sessions (WAT dates)
  const todayWAT = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
  const nextWeekWAT = new Date(Date.now() + 60 * 60 * 1000 + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data: sessions } = await supabase
    .from('sessions').select('id, title, date, start_time, week')
    .gte('date', todayWAT).lte('date', nextWeekWAT)
    .order('date').order('start_time');

  const { data: quizzes } = await supabase
    .from('quizzes').select('id, title, due_date, opens_at, closes_at')
    .eq('status', 'published')
    .or(`due_date.gte.${todayWAT},opens_at.gte.${todayWAT}T00:00:00+01:00`);

  const sessionCount = sessions?.length ?? 0;
  const quizCount = quizzes?.length ?? 0;

  if (sessionCount === 0 && quizCount === 0) {
    return NextResponse.json({ ok: true, skipped: 'nothing scheduled this week' });
  }

  const parts: string[] = [];
  if (sessionCount > 0) parts.push(`${sessionCount} class${sessionCount !== 1 ? 'es' : ''}`);
  if (quizCount > 0) parts.push(`${quizCount} quiz${quizCount !== 1 ? 'zes' : ''}`);

  const firstSession = sessions?.[0];
  const preview = firstSession
    ? `Next up: ${firstSession.title}${firstSession.date ? ` on ${new Date(firstSession.date + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}` : ''}.`
    : '';

  await sendPushToAll({
    title: '📅 Your week ahead',
    body: `This week: ${parts.join(' & ')}. ${preview}`.trim(),
    url: '/hub?tab=schedule',
  });

  return NextResponse.json({ ok: true, sessions: sessionCount, quizzes: quizCount });
}

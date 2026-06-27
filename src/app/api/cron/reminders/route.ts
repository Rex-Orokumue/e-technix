import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushToAll, sendPushToTrack } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// WAT = UTC+1
function parseSessionUTC(date: string, startTime: string): Date | null {
  try {
    let t = startTime.trim();
    // Normalise 12-hour format: "7:00 PM" → "19:00"
    const h12 = t.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (h12) {
      let h = parseInt(h12[1]);
      const m = h12[2];
      const period = h12[3].toLowerCase();
      if (period === 'pm' && h !== 12) h += 12;
      if (period === 'am' && h === 12) h = 0;
      t = `${String(h).padStart(2, '0')}:${m}`;
    }
    const timePart = t.length === 5 ? `${t}:00` : t.slice(0, 8);
    return new Date(`${date}T${timePart}+01:00`);
  } catch { return null; }
}

function watTime(d: Date): string {
  return d.toLocaleString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', hour12: true });
}

async function alreadySent(supabase: any, entityId: string, type: string): Promise<boolean> {
  const { data } = await supabase.from('reminder_log')
    .select('id').eq('entity_id', entityId).eq('reminder_type', type).maybeSingle();
  return !!data;
}

async function log(supabase: any, entityType: string, entityId: string, type: string) {
  await supabase.from('reminder_log').insert({ entity_type: entityType, entity_id: entityId, reminder_type: type });
}

async function pushToTracks(tracks: string[] | null, payload: { title: string; body: string; url: string }) {
  if (!tracks || tracks.length === 0) {
    await sendPushToAll(payload);
  } else {
    await Promise.all(tracks.map(t => sendPushToTrack(t, payload)));
  }
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const now = new Date();
  const nowMs = now.getTime();
  const WIN = 3 * 60 * 1000; // ±3 min tolerance for 5-min cron
  let sent = 0;

  // ── SESSION REMINDERS ────────────────────────────────────────────────
  const { data: sessions } = await supabase
    .from('sessions').select('id, title, date, start_time, meet_link, tracks')
    .not('date', 'is', null).not('start_time', 'is', null);

  for (const s of sessions ?? []) {
    const t = parseSessionUTC(s.date, s.start_time);
    if (!t) continue;
    const diff = t.getTime() - nowMs; // +future / -past
    const timeStr = watTime(t);
    const joinUrl = s.meet_link || '/hub?tab=schedule';

    const windows = [
      { type: '1h',       target:  60 * 60 * 1000, title: '📅 Class in 1 hour',             body: `${s.title} starts at ${timeStr}. Get ready!` },
      { type: '30m',      target:  30 * 60 * 1000, title: '⏰ Class in 30 minutes',          body: `${s.title} starts at ${timeStr}. Get your link ready.` },
      { type: '15m',      target:  15 * 60 * 1000, title: '🔔 Class in 15 minutes',          body: `${s.title} is about to start. Tap to join!` },
      { type: 'start',    target:  0,               title: '🟢 Class is starting now!',      body: `${s.title} is live. Tap to join.` },
      { type: '15m_after',target: -15 * 60 * 1000, title: '📣 Class started 15 minutes ago', body: `${s.title} is in progress. Haven't joined yet? Join now!` },
    ];

    for (const w of windows) {
      if (Math.abs(diff - w.target) > WIN) continue;
      if (await alreadySent(supabase, s.id, w.type)) continue;
      await pushToTracks(s.tracks, { title: w.title, body: w.body, url: joinUrl });
      await log(supabase, 'session', s.id, w.type);
      sent++;
    }
  }

  // ── QUIZ WINDOW REMINDERS ────────────────────────────────────────────
  const { data: quizzes } = await supabase
    .from('quizzes').select('id, title, opens_at, closes_at, tracks').eq('status', 'published');

  for (const q of quizzes ?? []) {
    if (q.opens_at) {
      const diff = new Date(q.opens_at).getTime() - nowMs;
      if (Math.abs(diff - 15 * 60 * 1000) <= WIN && !(await alreadySent(supabase, q.id, 'quiz_open_15m'))) {
        await pushToTracks(q.tracks, { title: '🧠 Quiz opening soon', body: `${q.title} opens in 15 minutes. Get ready!`, url: '/hub?tab=quizzes' });
        await log(supabase, 'quiz', q.id, 'quiz_open_15m');
        sent++;
      }
    }
    if (q.closes_at) {
      const diff = new Date(q.closes_at).getTime() - nowMs;
      if (Math.abs(diff - 30 * 60 * 1000) <= WIN && !(await alreadySent(supabase, q.id, 'quiz_close_30m'))) {
        await pushToTracks(q.tracks, { title: '⏰ Quiz closing soon', body: `${q.title} closes in 30 minutes. Submit before time runs out!`, url: '/hub?tab=quizzes' });
        await log(supabase, 'quiz', q.id, 'quiz_close_30m');
        sent++;
      }
    }
  }

  // ── ASSIGNMENT DUE REMINDERS ─────────────────────────────────────────
  const { data: assignments } = await supabase
    .from('assignments').select('id, title, due_date, tracks').not('due_date', 'is', null);

  for (const a of assignments ?? []) {
    const dueMs = new Date(`${a.due_date}T23:59:59+01:00`).getTime();
    const diff = dueMs - nowMs;

    if (Math.abs(diff - 24 * 60 * 60 * 1000) <= WIN && !(await alreadySent(supabase, a.id, 'due_24h'))) {
      await pushToTracks(a.tracks, { title: '📝 Assignment due tomorrow', body: `${a.title} is due in 24 hours. Don't leave it too late!`, url: '/hub?tab=assignments' });
      await log(supabase, 'assignment', a.id, 'due_24h');
      sent++;
    }
    if (Math.abs(diff - 2 * 60 * 60 * 1000) <= WIN && !(await alreadySent(supabase, a.id, 'due_2h'))) {
      await pushToTracks(a.tracks, { title: '🚨 Assignment due in 2 hours', body: `${a.title} closes soon. Submit now!`, url: '/hub?tab=assignments' });
      await log(supabase, 'assignment', a.id, 'due_2h');
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent, checkedAt: now.toISOString() });
}

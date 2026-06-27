import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendPushToAll, sendPushToTrack } from '@/lib/push';

async function pushToTracks(tracks: string[] | null, payload: { title: string; body: string; url: string }) {
  if (!tracks || tracks.length === 0) {
    await sendPushToAll(payload);
  } else {
    await Promise.all(tracks.map(t => sendPushToTrack(t, payload)));
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { data: before } = await supabase
    .from('sessions').select('youtube_url, title, date, start_time, tracks').eq('id', id).single();

  const { data, error } = await supabase.from('sessions').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Recording added for the first time
  if (!before?.youtube_url && body.youtube_url && data) {
    sendPushToAll({
      title: '🎬 Session Recording Available',
      body: `${data.title} is now available to watch.`,
      url: '/hub?tab=sessions',
    }).catch(console.error);
  }

  // Session rescheduled — date or start_time changed
  const rescheduled =
    (body.date && body.date !== before?.date) ||
    (body.start_time && body.start_time !== before?.start_time);

  if (rescheduled && data) {
    // Clear queued reminders so they fire fresh at the new time
    await supabase.from('reminder_log').delete().eq('entity_id', id);

    const newDate = data.date
      ? new Date(data.date + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
      : '';
    const newTime = data.start_time ?? '';

    pushToTracks(data.tracks ?? before?.tracks ?? null, {
      title: '📅 Class Rescheduled',
      body: `${data.title} has been moved to ${newDate}${newTime ? ' at ' + newTime : ''}. Check your schedule.`,
      url: '/hub?tab=schedule',
    }).catch(console.error);
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch before delete so we can notify
  const { data: session } = await supabase.from('sessions').select('title, tracks').eq('id', id).single();

  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Clear reminder log
  await supabase.from('reminder_log').delete().eq('entity_id', id);

  if (session) {
    pushToTracks(session.tracks ?? null, {
      title: '❌ Class Cancelled',
      body: `${session.title} has been cancelled. Check the schedule for updates.`,
      url: '/hub?tab=schedule',
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendPushToAll, sendPushToTrack } from '@/lib/push';

export async function GET(req: NextRequest) {
  const track = new URL(req.url).searchParams.get('track');
  const supabase = createAdminClient();
  let query = supabase.from('resources').select('*').order('phase').order('week').order('sort_order');
  if (track) {
    // Show general items (tracks is null/empty) OR items that include this track
    query = query.or(`tracks.is.null,tracks.cs.{"${track}"}`);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('resources').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data) {
    const payload = {
      title: '📚 New Resource Added',
      body: data.title,
      url: '/hub?tab=resources',
    };
    // If resource is track-specific, only notify that track; otherwise notify all
    const tracks: string[] | null = data.tracks;
    if (tracks && tracks.length === 1) {
      sendPushToTrack(tracks[0], payload).catch(console.error);
    } else {
      sendPushToAll(payload).catch(console.error);
    }
  }
  return NextResponse.json(data, { status: 201 });
}

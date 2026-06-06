import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendPushToAll } from '@/lib/push';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  // Check if a recording is being added for the first time
  const { data: before } = await supabase.from('sessions').select('youtube_url, title').eq('id', id).single();
  const addingRecording = !before?.youtube_url && body.youtube_url;

  const { data, error } = await supabase.from('sessions').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (addingRecording && data) {
    sendPushToAll({
      title: '🎬 Session Recording Available',
      body: `${data.title} is now available to watch.`,
      url: '/hub?tab=sessions',
    }).catch(console.error);
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

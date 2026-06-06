// Admin-only chat messages route.
// Protected at the middleware level — no student session checks needed here.
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushToAll, sendPushToTrack, sendPushToStudents } from '@/lib/push';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel_id = searchParams.get('channel_id');
  if (!channel_id) return NextResponse.json({ error: 'channel_id required' }, { status: 400 });

  const before = searchParams.get('before');
  const after = searchParams.get('after');
  const supabase = createAdminClient();

  if (after) {
    const { data, error } = await supabase
      .from('chat_messages').select('*')
      .eq('channel_id', channel_id)
      .gt('created_at', after)
      .order('created_at', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  let query = supabase
    .from('chat_messages').select('*')
    .eq('channel_id', channel_id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).reverse());
}

export async function POST(req: NextRequest) {
  try {
    const { channel_id, content, reply_to_id, reply_to_content, reply_to_sender_name } = await req.json();
    if (!channel_id || !content?.trim())
      return NextResponse.json({ error: 'channel_id and content required' }, { status: 400 });

    const supabase = createAdminClient();
    const replyFields = reply_to_id ? { reply_to_id, reply_to_content, reply_to_sender_name } : {};

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ channel_id, content: content.trim(), sender_id: null, sender_name: 'Admin', sender_type: 'admin', ...replyFields })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notify relevant students
    const { data: channel } = await supabase
      .from('chat_channels').select('type, track, name').eq('id', channel_id).single();
    if (channel) {
      const preview = content.trim().length > 60 ? content.trim().slice(0, 57) + '…' : content.trim();
      const payload = { title: '💬 Admin', body: preview, url: '/hub?tab=chat' };
      if (channel.type === 'general') {
        sendPushToAll(payload).catch(console.error);
      } else if (channel.type === 'track' && channel.track) {
        sendPushToTrack(channel.track, payload).catch(console.error);
      } else if (channel.type === 'group') {
        const { data: members } = await supabase
          .from('chat_channel_members').select('student_id').eq('channel_id', channel_id);
        const ids = (members ?? []).map((m: any) => m.student_id);
        sendPushToStudents(ids, payload).catch(console.error);
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 });
  }
}

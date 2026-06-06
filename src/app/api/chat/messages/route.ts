import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendPushToAll, sendPushToTrack, sendPushToStudents } from '@/lib/push';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel_id = searchParams.get('channel_id');
  const before = searchParams.get('before');
  if (!channel_id) return NextResponse.json({ error: 'channel_id required' }, { status: 400 });

  const after = searchParams.get('after');
  const supabase = createAdminClient();

  if (after) {
    // Polling: return messages newer than timestamp, ascending
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
    const body = await req.json();
    const { channel_id, content, reply_to_id, reply_to_content, reply_to_sender_name } = body;
    if (!channel_id || !content?.trim())
      return NextResponse.json({ error: 'channel_id and content required' }, { status: 400 });
    const replyFields = reply_to_id ? { reply_to_id, reply_to_content, reply_to_sender_name } : {};

    const adminClient = createAdminClient();

    // Always check student session first — admin cookie must NOT override a logged-in student
    const ssrClient = await createClient();
    const { data: { user } } = await ssrClient.auth.getUser();

    if (user) {
      // Student post
      const { data: student, error: stuErr } = await adminClient
        .from('students').select('full_name, track').eq('id', user.id).single();
      if (stuErr || !student)
        return NextResponse.json({ error: 'Student record not found' }, { status: 404 });

      const { data: channel, error: chErr } = await adminClient
        .from('chat_channels').select('type, track').eq('id', channel_id).single();
      if (chErr || !channel)
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });

      if (channel.type === 'track' && channel.track !== student.track)
        return NextResponse.json({ error: 'You can only post in your own track channel' }, { status: 403 });

      if (channel.type === 'group') {
        const { data: membership } = await adminClient
          .from('chat_channel_members')
          .select('student_id')
          .eq('channel_id', channel_id)
          .eq('student_id', user.id)
          .single();
        if (!membership) return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
      }

      const { data, error } = await adminClient
        .from('chat_messages')
        .insert({ channel_id, content: content.trim(), sender_id: user.id, sender_name: student.full_name, sender_type: 'student', ...replyFields })
        .select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      // Notify other channel members (or admin for DMs)
      if (channel.type === 'direct') {
        // DM to admin — push all devices (admin's phone if subscribed)
        sendPushToAll({ title: `📩 ${student.full_name}`, body: content.trim(), url: '/admin/chat' }, user.id).catch(console.error);
      } else {
        notifyChannelMembers(adminClient, channel_id, channel, `💬 ${student.full_name}`, content.trim(), user.id).catch(console.error);
      }
      return NextResponse.json(data, { status: 201 });
    }

    // No student session — check admin
    if (await isAdminAuthenticated()) {
      const { data: channel } = await adminClient
        .from('chat_channels').select('type, track, name').eq('id', channel_id).single();
      const { data, error } = await adminClient
        .from('chat_messages')
        .insert({ channel_id, content: content.trim(), sender_id: null, sender_name: 'Admin', sender_type: 'admin', ...replyFields })
        .select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      // Admin messages always notify relevant students
      if (channel) notifyChannelMembers(adminClient, channel_id, channel, '💬 Admin', content.trim(), null).catch(console.error);
      return NextResponse.json(data, { status: 201 });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (err: any) {
    console.error('[POST /api/chat/messages]', err);
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 });
  }
}

async function notifyChannelMembers(
  adminClient: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  channelId: string,
  channel: { type: string; track?: string | null; name?: string },
  senderLabel: string,
  content: string,
  excludeStudentId: string | null
) {
  const preview = content.length > 60 ? content.slice(0, 57) + '…' : content;
  const payload = { title: senderLabel, body: preview, url: '/hub?tab=chat' };

  if (channel.type === 'general') {
    await sendPushToAll(payload, excludeStudentId ?? undefined);
  } else if (channel.type === 'track' && channel.track) {
    await sendPushToTrack(channel.track, payload, excludeStudentId ?? undefined);
  } else if (channel.type === 'group') {
    const { data: members } = await adminClient
      .from('chat_channel_members').select('student_id').eq('channel_id', channelId);
    const ids = (members ?? []).map((m: any) => m.student_id);
    await sendPushToStudents(ids, payload, excludeStudentId ?? undefined);
  }
}

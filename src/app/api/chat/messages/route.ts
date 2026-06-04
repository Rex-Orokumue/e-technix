import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

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
      return NextResponse.json(data, { status: 201 });
    }

    // No student session — check admin
    if (await isAdminAuthenticated()) {
      const { data, error } = await adminClient
        .from('chat_messages')
        .insert({ channel_id, content: content.trim(), sender_id: null, sender_name: 'Admin', sender_type: 'admin', ...replyFields })
        .select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data, { status: 201 });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (err: any) {
    console.error('[POST /api/chat/messages]', err);
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 });
  }
}

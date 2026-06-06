import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendPushToStudents } from '@/lib/push';

export async function GET() {
  const adminClient = createAdminClient();

  // Check student session first — admin cookie must NOT override a logged-in student
  const ssrClient = await createClient();
  const { data: { user } } = await ssrClient.auth.getUser();

  if (user) {
    // Student: return general + their track channel + their group channels
    const { data: student } = await adminClient
      .from('students').select('track').eq('id', user.id).single();
    const track = student?.track ?? '';

    const { data: baseChannels, error: e1 } = await adminClient
      .from('chat_channels')
      .select('*, chat_channel_members(student_id)')
      .in('type', ['general', 'track'])
      .order('type').order('name');
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

    const filtered = (baseChannels ?? []).filter(
      (c: any) => c.type === 'general' || (c.type === 'track' && c.track === track)
    );

    const { data: memberRows } = await adminClient
      .from('chat_channel_members').select('channel_id').eq('student_id', user.id);

    const groupIds = (memberRows ?? []).map((r: any) => r.channel_id);
    let groupChannels: any[] = [];
    if (groupIds.length) {
      const { data: groups } = await adminClient
        .from('chat_channels')
        .select('*, chat_channel_members(student_id)')
        .in('id', groupIds).in('type', ['group', 'direct']).order('name');
      // Normalise DM channels (stored as group with __dm__ prefix) to type 'direct'
      groupChannels = (groups ?? []).map((c: any) =>
        (c.type === 'direct' || c.name?.startsWith('__dm__'))
          ? { ...c, type: 'direct', name: c.name.replace('__dm__', '') }
          : c
      );
    }

    return NextResponse.json([...filtered, ...groupChannels]);
  }

  // No student session — require admin
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await adminClient
    .from('chat_channels')
    .select('*, chat_channel_members(student_id)')
    .order('type').order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Normalise DM channels for admin too
  const normalised = (data ?? []).map((c: any) =>
    (c.type === 'direct' || c.name?.startsWith('__dm__'))
      ? { ...c, type: 'direct', name: c.name.replace('__dm__', '') }
      : c
  );
  return NextResponse.json(normalised);
}

// Group creation — admin only
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, member_ids } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const adminClient = createAdminClient();
  const { data: channel, error } = await adminClient
    .from('chat_channels')
    .insert({ name: name.trim(), type: 'group' })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (member_ids?.length) {
    await adminClient.from('chat_channel_members').insert(
      member_ids.map((sid: string) => ({ channel_id: channel.id, student_id: sid }))
    );
    sendPushToStudents(member_ids, {
      title: '👥 You were added to a group',
      body: `You've been added to "${channel.name}" in chat.`,
      url: '/hub',
    }).catch(console.error);
  }

  return NextResponse.json(channel, { status: 201 });
}

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// The DM channel name prefix — lets us identify DM channels stored as 'group' type
const DM_PREFIX = '__dm__';

export async function POST() {
  const ssrClient = await createClient();
  const { data: { user } } = await ssrClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = createAdminClient();

  // Get student info
  const { data: student } = await adminClient
    .from('students').select('full_name').eq('id', user.id).single();
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  const dmName = `${DM_PREFIX}${student.full_name}`;

  // Find existing DM channel for this student (by membership + name prefix)
  const { data: memberRows } = await adminClient
    .from('chat_channel_members').select('channel_id').eq('student_id', user.id);

  const channelIds = (memberRows ?? []).map((r: any) => r.channel_id);

  let dmChannel: any = null;
  if (channelIds.length) {
    // Try 'direct' type first, fall back to checking by name prefix
    const { data: byType } = await adminClient
      .from('chat_channels').select('*')
      .in('id', channelIds).eq('type', 'direct').maybeSingle();

    if (byType) {
      dmChannel = byType;
    } else {
      const { data: byName } = await adminClient
        .from('chat_channels').select('*')
        .in('id', channelIds).like('name', `${DM_PREFIX}%`).maybeSingle();
      dmChannel = byName;
    }
  }

  // Create if not found — try 'direct' first, fall back to 'group'
  if (!dmChannel) {
    let { data: created, error } = await adminClient
      .from('chat_channels')
      .insert({ name: dmName, type: 'direct' })
      .select().single();

    if (error) {
      // 'direct' type rejected (DB constraint) — fall back to 'group'
      const result = await adminClient
        .from('chat_channels')
        .insert({ name: dmName, type: 'group' })
        .select().single();
      if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
      created = result.data;
    }

    dmChannel = created;
    await adminClient.from('chat_channel_members').insert({
      channel_id: dmChannel.id,
      student_id: user.id,
    });
  }

  // Normalise: always return type as 'direct' so the frontend treats it correctly
  return NextResponse.json({ ...dmChannel, type: 'direct' });
}

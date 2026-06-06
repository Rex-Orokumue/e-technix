import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// GET or create the DM channel between the logged-in student and admin
export async function POST() {
  const ssrClient = await createClient();
  const { data: { user } } = await ssrClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = createAdminClient();

  // Get student name
  const { data: student } = await adminClient
    .from('students').select('full_name').eq('id', user.id).single();
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  // Find existing DM channel for this student
  const { data: memberRows } = await adminClient
    .from('chat_channel_members').select('channel_id').eq('student_id', user.id);

  const channelIds = (memberRows ?? []).map((r: any) => r.channel_id);

  let dmChannel: any = null;
  if (channelIds.length) {
    const { data } = await adminClient
      .from('chat_channels').select('*')
      .in('id', channelIds).eq('type', 'direct').maybeSingle();
    dmChannel = data;
  }

  // Create if it doesn't exist
  if (!dmChannel) {
    const { data: created, error } = await adminClient
      .from('chat_channels')
      .insert({ name: student.full_name, type: 'direct' })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    dmChannel = created;
    await adminClient.from('chat_channel_members').insert({ channel_id: dmChannel.id, student_id: user.id });
  }

  return NextResponse.json(dmChannel);
}

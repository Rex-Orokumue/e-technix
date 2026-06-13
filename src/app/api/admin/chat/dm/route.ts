// Admin initiates a DM with a specific student.
// Finds the existing direct channel for that student, or creates one.
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const DM_PREFIX = '__dm__';

export async function POST(req: NextRequest) {
  const { student_id } = await req.json();
  if (!student_id) return NextResponse.json({ error: 'student_id required' }, { status: 400 });

  const supabase = createAdminClient();

  const { data: student } = await supabase
    .from('students').select('full_name').eq('id', student_id).single();
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  // Find existing DM channel for this student
  const { data: memberRows } = await supabase
    .from('chat_channel_members').select('channel_id').eq('student_id', student_id);

  const channelIds = (memberRows ?? []).map((r: any) => r.channel_id);
  let dmChannel: any = null;

  if (channelIds.length) {
    const { data: byType } = await supabase
      .from('chat_channels').select('*')
      .in('id', channelIds).eq('type', 'direct').maybeSingle();
    if (byType) {
      dmChannel = byType;
    } else {
      const { data: byName } = await supabase
        .from('chat_channels').select('*')
        .in('id', channelIds).like('name', `${DM_PREFIX}%`).maybeSingle();
      dmChannel = byName;
    }
  }

  if (!dmChannel) {
    const dmName = `${DM_PREFIX}${student.full_name}`;
    let { data: created, error } = await supabase
      .from('chat_channels').insert({ name: dmName, type: 'direct' }).select().single();
    if (error) {
      const result = await supabase
        .from('chat_channels').insert({ name: dmName, type: 'group' }).select().single();
      if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
      created = result.data;
    }
    dmChannel = created;
    await supabase.from('chat_channel_members').insert({ channel_id: dmChannel.id, student_id });
  }

  return NextResponse.json({ ...dmChannel, type: 'direct', name: student.full_name });
}

// Admin-only chat channels route.
// Protected at the middleware level — no student session checks needed here.
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('chat_channels')
    .select('*, chat_channel_members(student_id)')
    .order('type').order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Normalise DM channels (stored as group with __dm__ prefix) → type 'direct'
  const normalised = (data ?? []).map((c: any) =>
    (c.type === 'direct' || c.name?.startsWith('__dm__'))
      ? { ...c, type: 'direct', name: c.name.replace('__dm__', '') }
      : c
  );
  return NextResponse.json(normalised);
}

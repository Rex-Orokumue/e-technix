import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { sendPushToAll } from '@/lib/push';

export async function GET(req: NextRequest) {
  const track = new URL(req.url).searchParams.get('track');
  const supabase = createAdminClient();
  let query = supabase.from('sessions').select('*').order('phase').order('week').order('session_number');
  if (track) {
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
  const { notify, ...sessionData } = body;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('sessions').insert(sessionData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (notify && data) {
    sendPushToAll({
      title: '📅 New Session Scheduled',
      body: data.title,
      url: '/hub?tab=schedule',
    }).catch(console.error);
  }
  return NextResponse.json(data, { status: 201 });
}

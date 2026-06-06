import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import webpush from 'web-push';

if (process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] ?? null);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('announcements').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Push notification to all subscribed students
  if (process.env.VAPID_PRIVATE_KEY && data?.message) {
    const { data: subs } = await supabase.from('push_subscriptions').select('*');
    const payload = JSON.stringify({ title: '📢 e-technix Announcement', body: data.message, url: '/hub?tab=sessions' });
    await Promise.allSettled((subs ?? []).map(sub =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
        .catch(async err => {
          if (err.statusCode === 410 || err.statusCode === 404)
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        })
    ));
  }

  return NextResponse.json(data, { status: 201 });
}

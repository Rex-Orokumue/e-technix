import webpush from 'web-push';
import { createAdminClient } from './supabase/admin';

if (process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

async function dispatch(subs: any[], payload: PushPayload) {
  // Filter out any localhost subscriptions that snuck in during dev
  subs = subs.filter(s => !s.endpoint.includes('localhost'));
  if (!subs.length || !process.env.VAPID_PRIVATE_KEY) return;
  const supabase = createAdminClient();
  const body = JSON.stringify({ ...payload, url: payload.url ?? '/hub' });
  await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        body
      ).catch(async (err: any) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      })
    )
  );
}

export async function sendPushToAll(payload: PushPayload, excludeStudentId?: string) {
  const supabase = createAdminClient();
  let query = supabase.from('push_subscriptions').select('*');
  if (excludeStudentId) query = query.neq('student_id', excludeStudentId);
  const { data: subs } = await query;
  await dispatch(subs ?? [], payload);
}

export async function sendPushToStudents(studentIds: string[], payload: PushPayload, excludeStudentId?: string) {
  if (!studentIds.length) return;
  const ids = excludeStudentId ? studentIds.filter(id => id !== excludeStudentId) : studentIds;
  if (!ids.length) return;
  const supabase = createAdminClient();
  const { data: subs } = await supabase.from('push_subscriptions').select('*').in('student_id', ids);
  await dispatch(subs ?? [], payload);
}

export async function sendPushToTrack(track: string, payload: PushPayload, excludeStudentId?: string) {
  const supabase = createAdminClient();
  const { data: students } = await supabase.from('students').select('id').eq('track', track);
  const ids = (students ?? []).map((s: any) => s.id);
  await sendPushToStudents(ids, payload, excludeStudentId);
}

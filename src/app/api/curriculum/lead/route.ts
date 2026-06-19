import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, isValidName, insertLead } from '@/lib/curriculum-lead';

export const UNLOCK_COOKIE = 'etx_curr_unlock';

export async function POST(req: NextRequest) {
  let body: { name?: unknown; email?: unknown; track_interest?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const name = String(body?.name ?? '');
  const email = String(body?.email ?? '');
  const track = body?.track_interest ? String(body.track_interest) : null;

  if (!isValidName(name)) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });

  let id: string;
  try {
    id = await insertLead({
      name,
      email,
      track_interest: track,
      user_agent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
    });
  } catch (e: unknown) {
    console.error('[curriculum/lead]', e);
    return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true, name: name.trim() });
  res.cookies.set(UNLOCK_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 180, // 180 days
  });
  return res;
}

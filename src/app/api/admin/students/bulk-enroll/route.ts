import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// Expects JSON array: [{ full_name, email, password, track }]
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows: { full_name: string; email: string; password: string; track: string }[] = await req.json();
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 });

  const supabase = createAdminClient();
  const results: { email: string; ok: boolean; error?: string }[] = [];

  for (const row of rows) {
    const { full_name, email, password, track } = row;
    if (!full_name || !email || !password || !track) {
      results.push({ email: email ?? '?', ok: false, error: 'Missing required fields' });
      continue;
    }
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, track },
    });
    if (authErr) {
      results.push({ email, ok: false, error: authErr.message });
      continue;
    }
    const { error: profileErr } = await supabase.from('students').insert({
      id: authData.user.id,
      email,
      full_name,
      track,
      is_active: true,
    });
    if (profileErr) {
      results.push({ email, ok: false, error: profileErr.message });
    } else {
      results.push({ email, ok: true });
    }
  }

  const failed = results.filter(r => !r.ok);
  return NextResponse.json({ results, failed: failed.length, enrolled: results.length - failed.length });
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('enrolled_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { full_name, email, track } = await req.json();
  const supabase = createAdminClient();

  // Invite user via Supabase Auth (sends magic link email)
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name, track },
  });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  // Create student profile row
  const { data, error } = await supabase
    .from('students')
    .insert({ id: authData.user.id, email, full_name, track })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

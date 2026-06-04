import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('session_reviews')
    .select('*, students(full_name, track), sessions(title, session_number, phase, week)')
    .order('session_id')
    .order('rating', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Public endpoint for students to fetch reviews for a session (anonymous)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { session_id, rating, feedback } = await req.json();
  const { data, error } = await supabase
    .from('session_reviews')
    .insert({ student_id: user.id, session_id, rating, feedback })
    .select()
    .single();

  if (error?.code === '23505')
    return NextResponse.json({ error: 'You have already reviewed this session' }, { status: 409 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

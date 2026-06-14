import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const quizId = new URL(req.url).searchParams.get('quiz_id');
  if (!quizId) return NextResponse.json({ error: 'quiz_id required' }, { status: 400 });
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('quiz_attempts').select('*, students(full_name, email, track)')
    .eq('quiz_id', quizId).order('submitted_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

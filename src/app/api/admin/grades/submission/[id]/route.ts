import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const body = await req.json();
  const { score, contribution } = body;

  if (typeof score !== 'number' || score < 0 || score > 100)
    return NextResponse.json({ error: 'Score must be 0–100' }, { status: 400 });

  if (!['full', 'partial', 'minimal'].includes(contribution))
    return NextResponse.json({ error: 'Invalid contribution value' }, { status: 400 });

  const { data, error } = await supabase
    .from('assignment_submissions')
    .update({ score, contribution })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

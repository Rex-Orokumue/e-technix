import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { geminiGenerate } from '@/lib/ai';

const SYSTEM = `You condense a teaching session script into a compact study brief for an AI tutor. Output plain text (no markdown headers). Capture: key concepts, definitions, frameworks named, and concrete examples used. Keep it under 400 words. Be faithful to the script — do not add content that was not taught.`;

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { session_id, script } = await req.json();
  const text = (script ?? '').trim();
  if (!session_id || !text) return NextResponse.json({ error: 'session_id and script required' }, { status: 400 });

  let brief = '';
  try {
    brief = await geminiGenerate({
      system: SYSTEM,
      turns: [{ role: 'user', text: `Condense this session script into a brief:\n\n${text}` }],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to generate brief' }, { status: 502 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('sessions')
    .update({ teaching_script: text, teaching_brief: brief.trim() }).eq('id', session_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ teaching_brief: brief.trim() });
}

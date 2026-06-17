import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { geminiGenerate } from '@/lib/ai';
import { checkAndRecord } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ssr = await createClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gate = await checkAndRecord(user.id, 'assist');
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 429 });

  const { assignment_id, studentInputs } = await req.json();
  if (!assignment_id) return NextResponse.json({ error: 'assignment_id required' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: a } = await supabase
    .from('assignments').select('title, description, ai_template, phase, week').eq('id', assignment_id).single();
  if (!a?.ai_template?.enabled) return NextResponse.json({ error: 'No assistant configured for this assignment' }, { status: 400 });

  const tpl = a.ai_template as {
    layout: string; fields?: { key: string; label: string }[]; coachingPrompt?: string;
  };

  // Pull the most relevant teaching brief for grounding (same phase+week).
  const { data: sess } = await supabase
    .from('sessions').select('teaching_brief').eq('phase', a.phase).eq('week', a.week)
    .not('teaching_brief', 'is', null).limit(1).maybeSingle();
  const brief = sess?.teaching_brief ? `\n\nTeaching context:\n${sess.teaching_brief}` : '';

  const inputsText = Object.entries(studentInputs ?? {})
    .map(([k, v]) => `${k}: ${v}`).join('\n');

  const isProse = tpl.layout === 'prose';
  let system: string;
  let json = false;

  if (isProse) {
    system = `You are a coaching assistant for an E-Technix assignment: "${a.title}". ${a.description ?? ''} ${tpl.coachingPrompt ?? ''} Use the student's input to produce a strong first draft they will edit. Guide and scaffold — keep it in the student's voice, do not invent facts they didn't provide.${brief}`;
  } else {
    const fieldList = (tpl.fields ?? []).map(f => `"${f.key}" (${f.label})`).join(', ');
    system = `You are a coaching assistant for an E-Technix assignment: "${a.title}". ${tpl.coachingPrompt ?? ''} Produce a JSON object with EXACTLY these keys: ${fieldList}. Each value is concise text for that section, based on the student's input. Do not invent facts the student didn't provide; where information is missing, give a brief prompt of what they should add.${brief}`;
    json = true;
  }

  try {
    const out = await geminiGenerate({
      system,
      turns: [{ role: 'user', text: `Student input:\n${inputsText || '(none provided)'}` }],
      json,
    });
    if (json) {
      let parsed: any;
      try { parsed = JSON.parse(out); }
      catch { return NextResponse.json({ raw: out }); } // fall back to raw text
      return NextResponse.json({ fields: parsed });
    }
    return NextResponse.json({ prose: out });
  } catch (e: any) {
    console.error('[ai/assist]', e);
    return NextResponse.json({ error: 'The assistant is busy right now. Please try again in a moment.', detail: String(e?.message ?? e) }, { status: 502 });
  }
}

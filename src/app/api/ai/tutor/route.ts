import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { aiGenerate, type AiTurn } from '@/lib/ai';
import { checkAndRecord } from '@/lib/rate-limit';

const MAX_TURNS = 12; // cap history sent to keep tokens small

export async function POST(req: NextRequest) {
  const ssr = await createClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gate = await checkAndRecord(user.id, 'tutor');
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 429 });

  const { session_id, messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0)
    return NextResponse.json({ error: 'messages required' }, { status: 400 });

  const supabase = createAdminClient();
  let context = '';
  if (session_id) {
    const { data: s } = await supabase
      .from('sessions').select('title, description, teaching_brief').eq('id', session_id).single();
    if (s) context = s.teaching_brief?.trim()
      ? `Session topic: ${s.title}\n\nTeaching brief:\n${s.teaching_brief}`
      : `Session topic: ${s.title}\n${s.description ?? ''}`;
  }

  const system = `You are an encouraging, concise tutor for the E-Technix Phase 1 program (Digital & Business Foundations). Answer ONLY using ideas consistent with what was taught (below). Guide the student to understanding — explain, give examples, ask a clarifying question when useful — but do NOT write their assignment for them. Keep replies to 1-3 short paragraphs.\n\n${context || 'No specific session context available; answer generally within the program scope.'}`;

  const turns: AiTurn[] = (messages as any[]).slice(-MAX_TURNS).map(m => ({
    role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
    text: String(m.text ?? m.content ?? ''),
  }));

  try {
    const reply = await aiGenerate({ system, turns });
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('[ai/tutor]', e);
    return NextResponse.json({ error: 'The tutor is busy right now. Please try again in a moment.', detail: String(e?.message ?? e) }, { status: 502 });
  }
}

import { createAdminClient } from '@/lib/supabase/admin';

// Defaults tuned for Gemini free tier with a cohort. Override per call if needed.
const PER_MINUTE = 8;
const PER_DAY = 120;

export interface RateResult { ok: boolean; reason?: string; }

// Checks the student's recent ai_usage counts, and if allowed, records this use.
export async function checkAndRecord(studentId: string, kind: 'tutor' | 'assist' | 'brief'): Promise<RateResult> {
  const supabase = createAdminClient();
  const now = Date.now();
  const minuteAgo = new Date(now - 60_000).toISOString();
  const dayAgo = new Date(now - 86_400_000).toISOString();

  const { count: perMin } = await supabase
    .from('ai_usage').select('id', { count: 'exact', head: true })
    .eq('student_id', studentId).gte('created_at', minuteAgo);
  if ((perMin ?? 0) >= PER_MINUTE) return { ok: false, reason: 'Too many requests — wait a moment and try again.' };

  const { count: perDay } = await supabase
    .from('ai_usage').select('id', { count: 'exact', head: true })
    .eq('student_id', studentId).gte('created_at', dayAgo);
  if ((perDay ?? 0) >= PER_DAY) return { ok: false, reason: "You've reached today's AI usage limit. Try again tomorrow." };

  await supabase.from('ai_usage').insert({ student_id: studentId, kind });
  return { ok: true };
}

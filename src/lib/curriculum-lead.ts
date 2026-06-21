import { createAdminClient } from '@/lib/supabase/admin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 120;
}

export interface LeadInput {
  name: string;
  email: string;
  track_interest?: string | null;
  user_agent?: string | null;
  referer?: string | null;
}

/** Inserts a lead and returns its id. Upserts on email to avoid duplicates. */
export async function insertLead(input: LeadInput): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('curriculum_leads')
    .upsert(
      {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        track_interest: input.track_interest ?? null,
        user_agent: input.user_agent ?? null,
        referer: input.referer ?? null,
      },
      { onConflict: 'email' },
    )
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

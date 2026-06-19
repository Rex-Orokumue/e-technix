import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { TRACKS, PROGRAMME, publicTrack } from '@/lib/data/curriculum';
import { UNLOCK_COOKIE } from '@/app/api/curriculum/lead/route';
import CurriculumClient, { type ClientTrack } from './_client';

export const metadata = {
  title: 'Curriculum — E-Technix',
  description:
    'The full E-Technix digital careers curriculum: 10 tracks, week by week. Build the judgment AI cannot replace.',
};

export default async function CurriculumPage() {
  const jar = await cookies();
  const id = jar.get(UNLOCK_COOKIE)?.value;
  let unlocked = false;
  let leadName: string | null = null;

  if (id) {
    const supabase = createAdminClient();
    const { data } = await supabase.from('curriculum_leads').select('name').eq('id', id).single();
    if (data) {
      unlocked = true;
      leadName = data.name;
    }
  }

  // When locked, send the public-safe projection (no session text reaches the browser).
  const tracks: ClientTrack[] = unlocked ? (TRACKS as ClientTrack[]) : (TRACKS.map(publicTrack) as ClientTrack[]);
  const trackChoices = TRACKS.map((t) => ({ code: t.code, name: t.name }));

  return (
    <CurriculumClient
      programme={PROGRAMME}
      tracks={tracks}
      trackChoices={trackChoices}
      unlocked={unlocked}
      leadName={leadName}
    />
  );
}

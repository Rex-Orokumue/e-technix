import { TRACKS, PROGRAMME, publicTrack } from '@/lib/data/curriculum';
import CurriculumClient, { type ClientTrack } from './_client';

export const metadata = {
  title: 'Curriculum — E-Technix',
  description:
    'A glance at the E-Technix digital careers curriculum, week by week. Build the judgment AI cannot replace.',
};

export default function CurriculumPage() {
  // Public glance only — week themes + deliverables, no session-by-session detail.
  // The full curriculum is shared with students once they enrol (dashboard + welcome email).
  const tracks = TRACKS.map(publicTrack) as ClientTrack[];

  return <CurriculumClient programme={PROGRAMME} tracks={tracks} />;
}

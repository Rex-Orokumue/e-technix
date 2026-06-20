import { TRACKS as CURRICULUM_TRACKS } from '@/lib/data/curriculum';

// Track names students can be assigned to (admin pickers). Derived from the
// curriculum source of truth — Phase 1 is the shared foundation, not a track.
export const TRACKS: string[] = CURRICULUM_TRACKS
  .filter((t) => t.code !== 'DT-101')
  .map((t) => t.name);

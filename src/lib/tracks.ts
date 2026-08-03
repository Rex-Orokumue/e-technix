import { TRACKS as CURRICULUM_TRACKS } from '@/lib/data/curriculum';

// Track names students can be assigned to (admin pickers). Derived from the
// curriculum source of truth — Phase 1 is the shared foundation, not a track.
export const TRACKS: string[] = CURRICULUM_TRACKS
  .filter((t) => t.code !== 'DT-101')
  .map((t) => t.name);

// Icon + accent per track name, for badges/filters — same source of truth
// as the public curriculum pages, so labels stay in sync automatically.
export const TRACK_META: Record<string, { icon: string; accent: 'cyan' | 'orange' }> =
  Object.fromEntries(CURRICULUM_TRACKS.map((t) => [t.name, { icon: t.icon, accent: t.accent }]));

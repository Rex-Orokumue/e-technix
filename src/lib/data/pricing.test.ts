import { describe, it, expect } from 'vitest';
import { TRACKS } from './curriculum';
import { PRICING } from './pricing';

describe('pricing', () => {
  it('every enrollable track (all but Phase 1) has a price in all 3 currencies', () => {
    const priced = TRACKS.filter((t) => t.code !== 'DT-101');
    for (const t of priced) {
      const p = PRICING[t.code];
      expect(p, `missing price for ${t.code}`).toBeDefined();
      for (const cur of ['NGN', 'USD', 'GBP'] as const) {
        expect(p.full[cur]).toBeGreaterThan(0);
        expect(p.install[cur]).toBeGreaterThan(0);
      }
    }
  });

  it('Phase 1 is not sold separately (its fee is included in a track)', () => {
    expect(PRICING['DT-101']).toBeUndefined();
  });
});

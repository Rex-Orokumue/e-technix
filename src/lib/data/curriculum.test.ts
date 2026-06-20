import { describe, it, expect } from 'vitest';
import { TRACKS, PROGRAMME, publicTrack } from './curriculum';

describe('curriculum data', () => {
  it('has all 11 entries (Phase 1 + 8 specialisations + 2 advanced) with unique codes and slugs', () => {
    expect(TRACKS).toHaveLength(11);
    const codes = new Set(TRACKS.map((t) => t.code));
    const slugs = new Set(TRACKS.map((t) => t.slug));
    expect(codes.size).toBe(11);
    expect(slugs.size).toBe(11);
    expect(codes.has('DT-101')).toBe(true);
  });

  it('every track is well-formed', () => {
    for (const t of TRACKS) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(['enrolling', 'coming_soon', 'advanced']).toContain(t.status);
      expect(['cyan', 'orange']).toContain(t.accent);
      expect(t.summary.length).toBeGreaterThan(20);
      expect(t.outcomes.length).toBeGreaterThan(0);
      expect(t.careerPaths.length).toBeGreaterThan(0);
      expect(t.weeks.length).toBeGreaterThan(0);
      for (const w of t.weeks) {
        expect(w.title.length).toBeGreaterThan(0);
        expect(w.deliverable.length).toBeGreaterThan(0);
      }
    }
  });

  it('Phase 1 has 8 weeks; standard specialisations have 12', () => {
    const p1 = TRACKS.find((t) => t.code === 'DT-101')!;
    expect(p1.weeks).toHaveLength(8);
    const da = TRACKS.find((t) => t.code === 'DA-201')!;
    expect(da.weeks).toHaveLength(12);
  });

  it('PROGRAMME has the tagline and philosophy', () => {
    expect(PROGRAMME.tagline.toLowerCase()).toContain('judgment');
    expect(PROGRAMME.philosophy.length).toBe(3);
    expect(PROGRAMME.aiIntegration.length).toBe(3);
  });

  it('PROGRAMME explains the two phases and the 60% progression gate', () => {
    expect(PROGRAMME.howItWorks.phases.length).toBe(2);
    expect(PROGRAMME.howItWorks.progressionRule).toMatch(/60%/);
    expect(PROGRAMME.howItWorks.feeNote.toLowerCase()).toContain('both phases');
    expect(PROGRAMME.howItWorks.advancedEntry.toLowerCase()).toContain('placement assessment');
  });

  it('the 2 advanced tracks are enrolling, flagged, and explain what to expect', () => {
    const advanced = TRACKS.filter((t) => t.isAdvanced);
    expect(advanced.map((t) => t.code).sort()).toEqual(['DE-301', 'ML-301']);
    for (const t of advanced) {
      expect(t.status).toBe('enrolling');
      expect((t.whatToExpect ?? []).length).toBeGreaterThan(0);
    }
  });

  it('publicTrack() strips gated session detail', () => {
    const pub = publicTrack(TRACKS.find((t) => t.code === 'DT-101')!);
    for (const w of pub.weeks) {
      const raw = w as unknown as Record<string, unknown>;
      expect(raw.sessions).toBeUndefined();
      expect(raw.aiChallenge).toBeUndefined();
      expect(raw.aiAudit).toBeUndefined();
      expect(typeof w.hasAiChallenge).toBe('boolean');
      expect(typeof w.hasAiAudit).toBe('boolean');
      expect(w.deliverable.length).toBeGreaterThan(0);
    }
  });
});

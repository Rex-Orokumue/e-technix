// Single source of truth for track pricing. Keyed by track code (see curriculum.ts).
// `full` = pay-in-full price. `install` = ONE instalment (the plan is two instalments,
// so the instalment plan total is install × 2, a small premium over paying in full).
// One fee covers the student's full programme (Phase 1 + their specialisation track).

export type Currency = 'NGN' | 'USD' | 'GBP';

export interface TrackPrice {
  full: Record<Currency, number>;
  install: Record<Currency, number>;
}

export const CURRENCY_META: Record<Currency, { symbol: string; label: string; flag: string }> = {
  NGN: { symbol: '₦', label: 'NGN', flag: '🇳🇬' },
  USD: { symbol: '$', label: 'USD', flag: '🇺🇸' },
  GBP: { symbol: '£', label: 'GBP', flag: '🇬🇧' },
};

export const PRICING: Record<string, TrackPrice> = {
  // ── Specialisation tracks ──
  'DA-201': { full: { NGN: 180000, USD: 135, GBP: 108 }, install: { NGN: 100000, USD: 75, GBP: 60 } },
  'PD-201': { full: { NGN: 180000, USD: 135, GBP: 108 }, install: { NGN: 100000, USD: 75, GBP: 60 } },
  'DE-201': { full: { NGN: 180000, USD: 135, GBP: 108 }, install: { NGN: 100000, USD: 75, GBP: 60 } },
  'WD-201': { full: { NGN: 200000, USD: 150, GBP: 120 }, install: { NGN: 110000, USD: 85, GBP: 68 } },
  'MD-201': { full: { NGN: 200000, USD: 150, GBP: 120 }, install: { NGN: 110000, USD: 85, GBP: 68 } },
  'PM-201': { full: { NGN: 200000, USD: 150, GBP: 120 }, install: { NGN: 110000, USD: 85, GBP: 68 } },
  'AI-201': { full: { NGN: 230000, USD: 175, GBP: 140 }, install: { NGN: 125000, USD: 95, GBP: 76 } },
  'CS-201': { full: { NGN: 230000, USD: 175, GBP: 140 }, install: { NGN: 125000, USD: 95, GBP: 76 } },
  // ── Advanced tracks ──
  'DE-301': { full: { NGN: 280000, USD: 220, GBP: 175 }, install: { NGN: 150000, USD: 115, GBP: 92 } },
  'ML-301': { full: { NGN: 320000, USD: 250, GBP: 200 }, install: { NGN: 170000, USD: 130, GBP: 104 } },
};

export function priceFor(code: string): TrackPrice | undefined {
  return PRICING[code];
}

export function fmtPrice(amount: number, currency: Currency): string {
  const { symbol } = CURRENCY_META[currency];
  return symbol + amount.toLocaleString(currency === 'NGN' ? 'en-NG' : 'en-US');
}

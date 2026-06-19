import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidName } from './curriculum-lead';

describe('lead validation', () => {
  it('accepts ordinary emails', () => {
    expect(isValidEmail('jane@example.com')).toBe(true);
    expect(isValidEmail('a.b-c@sub.domain.co')).toBe(true);
  });
  it('rejects malformed emails', () => {
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('a @b.com')).toBe(false);
  });
  it('requires a non-trivial name', () => {
    expect(isValidName('Jane')).toBe(true);
    expect(isValidName(' ')).toBe(false);
    expect(isValidName('')).toBe(false);
  });
});

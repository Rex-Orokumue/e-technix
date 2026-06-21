import { describe, it, expect } from 'vitest';
import { renderCurriculumPdf } from './curriculum-pdf';

describe('curriculum pdf', () => {
  it('renders a non-empty PDF buffer', async () => {
    const buf = await renderCurriculumPdf({ name: 'Jane Tester', email: 'jane@example.com' });
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 4).toString('latin1')).toBe('%PDF');
  });
});

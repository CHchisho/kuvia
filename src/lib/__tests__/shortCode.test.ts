/**
 * Unit tests for generateShortCode.
 */
import { generateShortCode } from '../shortCode';

jest.mock('@/lib/db', () => ({
  query: jest.fn().mockResolvedValue([]),
}));

describe('generateShortCode', () => {
  it('returns an 8 character base62 string', async () => {
    const code = await generateShortCode();

    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[0-9A-Za-z]{8}$/);
  });

  it('generates different codes on subsequent calls (probabilistic)', async () => {
    const codes = await Promise.all([
      generateShortCode(),
      generateShortCode(),
      generateShortCode(),
    ]);

    const uniqueCount = new Set(codes).size;
    expect(uniqueCount).toBeGreaterThan(1);
  });
});


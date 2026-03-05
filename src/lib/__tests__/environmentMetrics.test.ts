import {
  computeSavedBytes,
  formatCO2,
  formatSavedBytes,
  savedBytesToCO2Grams,
} from '../environmentMetrics';

describe('environmentMetrics - computeSavedBytes', () => {
  it('returns 0 when original size is null or invalid', () => {
    expect(computeSavedBytes(null, 1000)).toBe(0);
    expect(computeSavedBytes(0, 1000)).toBe(0);
    expect(computeSavedBytes(-100, 1000)).toBe(0);
  });

  it('returns 0 when stored size is null', () => {
    expect(computeSavedBytes(1000, null)).toBe(0);
  });

  it('never returns negative values', () => {
    expect(computeSavedBytes(1000, 2000)).toBe(0);
  });

  it('returns difference between original and stored size', () => {
    expect(computeSavedBytes(2000, 500)).toBe(1500);
  });
});

describe('environmentMetrics - savedBytesToCO2Grams', () => {
  it('returns 0 for non-positive saved bytes', () => {
    expect(savedBytesToCO2Grams(0)).toBe(0);
    expect(savedBytesToCO2Grams(-1)).toBe(0);
  });

  it('converts bytes to grams with 2 decimal precision', () => {
    const oneMb = 1024 * 1024;
    expect(savedBytesToCO2Grams(oneMb)).toBe(2);
  });
});

describe('environmentMetrics - formatSavedBytes', () => {
  it('formats bytes into human readable units', () => {
    expect(formatSavedBytes(0)).toBe('0 B');
    expect(formatSavedBytes(512)).toBe('512 B');
    expect(formatSavedBytes(1024)).toBe('1.0 KB');
    expect(formatSavedBytes(1024 * 1024)).toBe('1.00 MB');
  });
});

describe('environmentMetrics - formatCO2', () => {
  it('formats grams into correct unit', () => {
    expect(formatCO2(0)).toBe('0 g');
    expect(formatCO2(0.5)).toBe('0.50 g');
    expect(formatCO2(999)).toBe('999.00 g');
    expect(formatCO2(1000)).toBe('1.00 kg');
  });
});


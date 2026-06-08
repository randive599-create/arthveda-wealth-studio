import { describe, expect, it } from 'vitest';
import { monthlyGrowthFactor, monthlyRate } from '../rates';

describe('monthlyRate', () => {
  it('returns 0 for a 0% annual rate', () => {
    expect(monthlyRate(0)).toBe(0);
  });

  it('compounds back to the annual rate over twelve months', () => {
    const factor = monthlyGrowthFactor(12);
    expect(Math.pow(factor, 12)).toBeCloseTo(1.12, 10);
  });

  it('handles the maximum 100% annual rate without overflow', () => {
    const rate = monthlyRate(100);
    expect(Number.isFinite(rate)).toBe(true);
    expect(rate).toBeGreaterThan(0);
    expect(Math.pow(1 + rate, 12)).toBeCloseTo(2, 10);
  });

  it('is monotonic in the annual rate', () => {
    expect(monthlyRate(8)).toBeLessThan(monthlyRate(12));
    expect(monthlyRate(12)).toBeLessThan(monthlyRate(20));
  });
});

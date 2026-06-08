import { describe, expect, it } from 'vitest';
import { computeComposition } from '../composition';
import { buildProjection } from '../index';
import { makeInputs } from './factory';

describe('computeComposition', () => {
  it('reports zero returns share when there are no returns', () => {
    const c = computeComposition(100_000, 0);
    expect(c.investedCapital).toBe(100_000);
    expect(c.returnsGenerated).toBe(0);
    expect(c.totalValue).toBe(100_000);
    expect(c.returnsPercentage).toBe(0);
  });

  it('computes the returns share of gross value', () => {
    const c = computeComposition(100_000, 150_000);
    expect(c.totalValue).toBe(250_000);
    expect(c.returnsPercentage).toBeCloseTo(60, 6);
  });

  it('floors negative returns at zero for display', () => {
    const c = computeComposition(100_000, -50_000);
    expect(c.returnsGenerated).toBe(0);
    expect(c.returnsPercentage).toBe(0);
  });
});

describe('buildProjection — composition', () => {
  it('keeps the returns percentage within [0, 100]', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 200_000,
        monthlySip: 20_000,
        annualReturnRate: 12,
        durationYears: 15,
        sipStopYear: 10,
        withdrawalStartYear: 12,
      }),
    );
    expect(result.composition.returnsPercentage).toBeGreaterThan(0);
    expect(result.composition.returnsPercentage).toBeLessThanOrEqual(100);
    expect(result.composition.totalValue).toBeCloseTo(
      result.composition.investedCapital + result.composition.returnsGenerated,
      6,
    );
  });
});

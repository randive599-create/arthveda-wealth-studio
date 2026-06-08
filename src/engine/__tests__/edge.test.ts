import { describe, expect, it } from 'vitest';
import { buildProjection } from '../index';
import { makeInputs } from './factory';

describe('buildProjection — boundary conditions', () => {
  it('handles the maximum ranges (100% rates, 100 years) without NaN/Infinity', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 1_000,
        monthlySip: 1_000,
        sipStepUp: { method: 'percentage', percentage: 10 },
        annualReturnRate: 100,
        durationYears: 100,
        sipStopYear: 50,
        withdrawalStartYear: 80,
        withdrawalReturnRate: 100,
        monthlySwp: 1_000,
        swpStepUp: { method: 'fixed', amount: 1_000 },
      }),
    );

    expect(result.monthly).toHaveLength(1_200);
    expect(result.yearly).toHaveLength(100);
    for (const row of result.monthly) {
      expect(Number.isFinite(row.corpus)).toBe(true);
      expect(row.corpus).toBeGreaterThanOrEqual(0);
    }
    expect(Number.isFinite(result.summary.finalCorpus)).toBe(true);
  });

  it('supports a zero-length growth phase when withdrawalStart equals sipStop', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 100_000,
        monthlySip: 10_000,
        annualReturnRate: 8,
        durationYears: 5,
        sipStopYear: 3,
        withdrawalStartYear: 3,
        withdrawalReturnRate: 6,
        monthlySwp: 5_000,
      }),
    );

    expect(result.yearly[1].phase).toBe('accumulation');
    expect(result.yearly[2].phase).toBe('withdrawal');
    expect(result.yearly.some((y) => y.phase === 'growth')).toBe(false);
  });

  it('produces consistent array lengths', () => {
    const result = buildProjection(makeInputs({ durationYears: 18 }));
    expect(result.monthly).toHaveLength(18 * 12);
    expect(result.yearly).toHaveLength(18);
  });
});

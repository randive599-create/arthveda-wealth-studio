import { describe, expect, it } from 'vitest';
import { buildProjection } from '../index';
import { makeInputs } from './factory';

describe('computeSummary', () => {
  it('computes the wealth multiplier as gross value per unit invested', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 100_000,
        durationYears: 1,
        sipStopYear: 1,
        withdrawalStartYear: 1,
        withdrawalReturnRate: 12,
      }),
    );
    // 100,000 -> 112,000, nothing withdrawn: multiplier 1.12.
    expect(result.summary.totalInvestment).toBe(100_000);
    expect(result.summary.finalCorpus).toBeCloseTo(112_000, 2);
    expect(result.summary.wealthMultiplier).toBeCloseTo(1.12, 4);
  });

  it('reports total returns as finalCorpus + withdrawn - invested', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 500_000,
        monthlySip: 10_000,
        annualReturnRate: 10,
        durationYears: 12,
        sipStopYear: 8,
        withdrawalStartYear: 10,
        withdrawalReturnRate: 7,
        monthlySwp: 20_000,
      }),
    );
    const { summary } = result;
    expect(summary.totalReturns).toBeCloseTo(
      summary.finalCorpus + summary.totalWithdrawn - summary.totalInvestment,
      4,
    );
  });

  it('reads corpus-at-SIP-stop from the end of sipStopYear', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 300_000,
        monthlySip: 12_000,
        annualReturnRate: 9,
        durationYears: 10,
        sipStopYear: 6,
        withdrawalStartYear: 8,
        withdrawalReturnRate: 6,
        monthlySwp: 15_000,
      }),
    );
    // Structural invariant: matches the year-end corpus of sipStopYear.
    expect(result.summary.corpusAtSipStop).toBe(result.yearly[5].corpus);
  });
});

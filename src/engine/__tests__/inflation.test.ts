import { describe, expect, it } from 'vitest';
import { buildProjection } from '../index';
import { presentValue } from '../inflation';
import { makeInputs } from './factory';

describe('presentValue', () => {
  it('deflates a future value to Year 0 purchasing power', () => {
    expect(presentValue(110_000, 1, 10)).toBeCloseTo(100_000, 6);
  });

  it('returns the nominal value at year 0 or with 0% inflation', () => {
    expect(presentValue(123_456, 0, 10)).toBe(123_456);
    expect(presentValue(123_456, 5, 0)).toBe(123_456);
  });
});

describe('buildProjection — inflation adjustment', () => {
  it('reports inflation-adjusted corpus as present value when enabled', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 100_000,
        annualReturnRate: 0,
        withdrawalReturnRate: 0,
        durationYears: 1,
        sipStopYear: 1,
        withdrawalStartYear: 1,
        inflation: { enabled: true, rate: 10 },
      }),
    );

    expect(result.summary.finalCorpus).toBeCloseTo(100_000, 6);
    expect(result.summary.inflationAdjustedCorpus).not.toBeNull();
    expect(result.summary.inflationAdjustedCorpus).toBeCloseTo(90_909.0909, 3);
    expect(result.inflation).not.toBeNull();
    expect(result.inflation).toHaveLength(1);
    expect(result.inflation?.[0].realCorpus).toBeCloseTo(90_909.0909, 3);
  });

  it('omits inflation-adjusted figures when disabled', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 100_000,
        durationYears: 1,
        inflation: { enabled: false, rate: 6 },
      }),
    );

    expect(result.inflation).toBeNull();
    expect(result.summary.inflationAdjustedCorpus).toBeNull();
    expect(result.summary.inflationAdjustedTotalWithdrawn).toBeNull();
    expect(result.summary.inflationAdjustedWealthMultiplier).toBeNull();
  });
});

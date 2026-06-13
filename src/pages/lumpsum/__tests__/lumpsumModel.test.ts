import { describe, expect, it } from 'vitest';
import { computeLumpsum, DEFAULT_LUMPSUM_INPUTS, type LumpsumInputs } from '../lumpsumModel';

const base: LumpsumInputs = DEFAULT_LUMPSUM_INPUTS;

describe('computeLumpsum — outputs', () => {
  it('grows a one-time investment into a larger final corpus', () => {
    const r = computeLumpsum({ ...base, oneTimeInvestment: 1_000_000, durationYears: 20 });
    expect(r.invested).toBe(1_000_000);
    expect(r.finalCorpus).toBeGreaterThan(1_000_000);
    expect(r.totalGain).toBeCloseTo(r.finalCorpus - 1_000_000, 0);
  });

  it('wealth multiplier = final corpus / invested', () => {
    const r = computeLumpsum(base);
    expect(r.wealthMultiplier).toBeCloseTo(r.finalCorpus / r.invested, 6);
    expect(r.wealthMultiplier).toBeGreaterThan(1);
  });

  it('CAGR is consistent with the multiplier over the term', () => {
    const r = computeLumpsum({ ...base, durationYears: 20 });
    const expected = (Math.pow(r.wealthMultiplier, 1 / 20) - 1) * 100;
    expect(r.cagrPct).toBeCloseTo(expected, 4);
    // For a pure lumpsum, the effective CAGR tracks the expected return.
    expect(r.cagrPct).toBeGreaterThan(0);
  });

  it('inflation-adjusted corpus discounts the final corpus and equals it at 0% inflation', () => {
    const withInflation = computeLumpsum({ ...base, inflationPct: 6, durationYears: 20 });
    expect(withInflation.inflationAdjustedCorpus).toBeCloseTo(
      withInflation.finalCorpus / Math.pow(1.06, 20),
      0,
    );
    expect(withInflation.inflationAdjustedCorpus).toBeLessThan(withInflation.finalCorpus);

    const noInflation = computeLumpsum({ ...base, inflationPct: 0 });
    expect(noInflation.inflationAdjustedCorpus).toBeCloseTo(noInflation.finalCorpus, 0);
  });
});

describe('computeLumpsum — growth series', () => {
  it('spans the term and starts at the invested amount', () => {
    const r = computeLumpsum({ ...base, durationYears: 20, oneTimeInvestment: 1_000_000 });
    expect(r.durationYears).toBe(20);
    expect(r.series).toHaveLength(21); // year 0..20
    expect(r.series[0].year).toBe(0);
    expect(r.series[0].corpus).toBe(1_000_000);
  });

  it('corpus is non-decreasing as it compounds', () => {
    const r = computeLumpsum(base);
    for (let i = 1; i < r.series.length; i += 1) {
      expect(r.series[i].corpus).toBeGreaterThanOrEqual(r.series[i - 1].corpus);
    }
  });

  it('a higher return produces a larger final corpus', () => {
    const low = computeLumpsum({ ...base, expectedReturnPct: 8 });
    const high = computeLumpsum({ ...base, expectedReturnPct: 14 });
    expect(high.finalCorpus).toBeGreaterThan(low.finalCorpus);
  });

  it('guards a zero investment (no NaN/Infinity)', () => {
    const r = computeLumpsum({ ...base, oneTimeInvestment: 0 });
    expect(Number.isFinite(r.wealthMultiplier)).toBe(true);
    expect(Number.isFinite(r.cagrPct)).toBe(true);
  });
});

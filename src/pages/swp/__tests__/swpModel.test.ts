import { describe, expect, it } from 'vitest';
import { computeSwp, DEFAULT_SWP_INPUTS, type SwpInputs } from '../swpModel';

const base: SwpInputs = DEFAULT_SWP_INPUTS;

describe('computeSwp — deterministic outputs', () => {
  it('builds a depletion series spanning the term, starting at the initial corpus', () => {
    const r = computeSwp({ ...base, durationYears: 25, initialCorpus: 10_000_000 });
    expect(r.durationYears).toBe(25);
    expect(r.series).toHaveLength(26); // year 0..25
    expect(r.series[0].year).toBe(0);
    expect(r.series[0].corpus).toBe(10_000_000);
  });

  it('inflation-adjusted income discounts the withdrawal to today and equals it at 0% inflation', () => {
    const withInflation = computeSwp({
      ...base,
      monthlyWithdrawal: 50_000,
      inflationPct: 6,
      durationYears: 25,
    });
    expect(withInflation.inflationAdjustedMonthlyIncome).toBeCloseTo(
      50_000 / Math.pow(1.06, 25),
      0,
    );
    expect(withInflation.inflationAdjustedMonthlyIncome).toBeLessThan(50_000);

    const noInflation = computeSwp({ ...base, monthlyWithdrawal: 50_000, inflationPct: 0 });
    expect(noInflation.inflationAdjustedMonthlyIncome).toBeCloseTo(50_000, 0);
  });

  it('reports a surviving corpus when returns outpace withdrawals', () => {
    const r = computeSwp({
      ...base,
      initialCorpus: 50_000_000,
      monthlyWithdrawal: 50_000,
      annualReturnPct: 10,
      durationYears: 20,
    });
    expect(r.survivesFullTerm).toBe(true);
    expect(r.depleted).toBe(false);
    expect(r.remainingCorpus).toBeGreaterThan(0);
    expect(r.longevityMonths).toBe(20 * 12);
  });

  it('reports depletion and a shortened longevity when withdrawals outpace returns', () => {
    const r = computeSwp({
      ...base,
      initialCorpus: 2_000_000,
      monthlyWithdrawal: 50_000,
      annualReturnPct: 6,
      durationYears: 25,
    });
    expect(r.depleted).toBe(true);
    expect(r.survivesFullTerm).toBe(false);
    expect(r.longevityMonths).toBeLessThan(25 * 12);
    expect(r.remainingCorpus).toBeLessThanOrEqual(0.01);
  });

  it('accumulates total withdrawals over the term', () => {
    const r = computeSwp({ ...base, monthlyWithdrawal: 50_000 });
    expect(r.totalWithdrawals).toBeGreaterThan(0);
  });
});

describe('computeSwp — survival probability (Monte Carlo)', () => {
  it('is a probability in [0, 1] and is deterministic across calls', () => {
    const a = computeSwp(base);
    const b = computeSwp(base);
    expect(a.survivalProbability).toBeGreaterThanOrEqual(0);
    expect(a.survivalProbability).toBeLessThanOrEqual(1);
    expect(a.survivalProbability).toBe(b.survivalProbability);
  });

  it('is certain (1) when there is no withdrawal', () => {
    const r = computeSwp({ ...base, monthlyWithdrawal: 0 });
    expect(r.survivalProbability).toBe(1);
  });

  it('is high for a well-funded plan and low for an under-funded plan', () => {
    const strong = computeSwp({
      ...base,
      initialCorpus: 50_000_000,
      monthlyWithdrawal: 50_000,
      annualReturnPct: 10,
      durationYears: 20,
    });
    const weak = computeSwp({
      ...base,
      initialCorpus: 2_000_000,
      monthlyWithdrawal: 60_000,
      annualReturnPct: 6,
      durationYears: 25,
    });
    expect(strong.survivalProbability).toBeGreaterThan(0.9);
    expect(weak.survivalProbability).toBeLessThan(0.2);
    expect(strong.survivalProbability).toBeGreaterThan(weak.survivalProbability);
  });
});

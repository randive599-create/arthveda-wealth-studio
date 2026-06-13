import { describe, expect, it } from 'vitest';
import { computeFire, DEFAULT_FIRE_INPUTS, type FireInputs } from '../fireModel';

const base: FireInputs = DEFAULT_FIRE_INPUTS;

describe('computeFire — FIRE number', () => {
  it('FIRE number today = annual expenses / safe withdrawal rate', () => {
    const r = computeFire({ ...base, annualExpensesToday: 1_200_000, safeWithdrawalRatePct: 4 });
    expect(r.fireNumberToday).toBeCloseTo(30_000_000, 0);
  });

  it('inflation-adjusted FIRE number grows expenses to the FIRE age', () => {
    const r = computeFire({
      ...base,
      currentAge: 30,
      targetFireAge: 45,
      annualExpensesToday: 1_200_000,
      inflationPct: 6,
      safeWithdrawalRatePct: 4,
    });
    const expected = (1_200_000 * Math.pow(1.06, 15)) / 0.04;
    expect(r.inflationAdjustedFireNumber).toBeCloseTo(expected, 0);
    expect(r.inflationAdjustedFireNumber).toBeGreaterThan(r.fireNumberToday);
  });

  it('with zero inflation the two FIRE numbers are equal', () => {
    const r = computeFire({ ...base, inflationPct: 0 });
    expect(r.inflationAdjustedFireNumber).toBeCloseTo(r.fireNumberToday, 0);
  });

  it('guards a zero safe-withdrawal rate (no Infinity)', () => {
    const r = computeFire({ ...base, safeWithdrawalRatePct: 0 });
    expect(Number.isFinite(r.fireNumberToday)).toBe(true);
    expect(Number.isFinite(r.inflationAdjustedFireNumber)).toBe(true);
  });
});

describe('computeFire — projection series', () => {
  it('series spans current age to FIRE age and starts at current net worth', () => {
    const r = computeFire({ ...base, currentAge: 30, targetFireAge: 45, currentNetWorth: 1_000_000 });
    expect(r.yearsToFire).toBe(15);
    expect(r.series).toHaveLength(16); // years 0..15 inclusive
    expect(r.series[0].age).toBe(30);
    expect(r.series[0].corpus).toBe(1_000_000);
    expect(r.series[r.series.length - 1].age).toBe(45);
  });

  it('projected corpus at FIRE age matches the final series point', () => {
    const r = computeFire(base);
    expect(r.projectedCorpusAtFire).toBeCloseTo(r.series[r.series.length - 1].corpus, 0);
  });

  it('corpus is non-decreasing during pure accumulation', () => {
    const r = computeFire(base);
    for (let i = 1; i < r.series.length; i += 1) {
      expect(r.series[i].corpus).toBeGreaterThanOrEqual(r.series[i - 1].corpus);
    }
  });

  it('wealthGap = inflation-adjusted FIRE number - projected corpus', () => {
    const r = computeFire(base);
    expect(r.wealthGap).toBeCloseTo(r.inflationAdjustedFireNumber - r.projectedCorpusAtFire, 0);
  });
});

describe('computeFire — success indicator', () => {
  it('flags a well-funded plan as on track with a surplus', () => {
    const r = computeFire({
      ...base,
      currentNetWorth: 20_000_000,
      monthlyInvestment: 300_000,
      annualExpensesToday: 600_000,
      safeWithdrawalRatePct: 4,
    });
    expect(r.onTrack).toBe(true);
    expect(r.surplus).toBeGreaterThan(0);
    expect(r.shortfall).toBe(0);
    expect(r.projectedCorpusAtFire).toBeGreaterThanOrEqual(r.inflationAdjustedFireNumber);
  });

  it('flags an under-funded plan as a shortfall', () => {
    const r = computeFire({
      ...base,
      currentNetWorth: 0,
      monthlyInvestment: 5_000,
      annualExpensesToday: 5_000_000,
      safeWithdrawalRatePct: 3,
    });
    expect(r.onTrack).toBe(false);
    expect(r.shortfall).toBeGreaterThan(0);
    expect(r.surplus).toBe(0);
  });
});

describe('computeFire — horizon handling', () => {
  it('marks an invalid horizon when the target age is not after the current age', () => {
    const r = computeFire({ ...base, currentAge: 50, targetFireAge: 45 });
    expect(r.validHorizon).toBe(false);
    expect(r.series.length).toBeGreaterThanOrEqual(2); // still produces a usable (clamped) series
  });

  it('treats a valid horizon as valid', () => {
    const r = computeFire({ ...base, currentAge: 30, targetFireAge: 50 });
    expect(r.validHorizon).toBe(true);
    expect(r.yearsToFire).toBe(20);
  });
});

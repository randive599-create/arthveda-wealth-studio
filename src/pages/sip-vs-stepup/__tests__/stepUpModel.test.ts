import { describe, expect, it } from 'vitest';
import {
  computeStepUp,
  corpusForStepUpSip,
  DEFAULT_STEPUP_INPUTS,
  monthlySipForYear,
  stepUpConfigFor,
  type StepUpInputs,
} from '../stepUpModel';
import { buildStepUpGrowthTable } from '../stepUpContent';

const base: StepUpInputs = DEFAULT_STEPUP_INPUTS;

describe('step-up SIP progression', () => {
  it('grows the monthly SIP by a percentage each year (10k -> 11k -> 12.1k -> 13.31k)', () => {
    const config = stepUpConfigFor({ ...base, method: 'percentage', stepUpPercent: 10 });
    expect(monthlySipForYear(10_000, 1, config)).toBeCloseTo(10_000, 0);
    expect(monthlySipForYear(10_000, 2, config)).toBeCloseTo(11_000, 0);
    expect(monthlySipForYear(10_000, 3, config)).toBeCloseTo(12_100, 0);
    expect(monthlySipForYear(10_000, 4, config)).toBeCloseTo(13_310, 0);
  });

  it('grows the monthly SIP by a fixed amount each year (10k -> 11k -> 12k -> 13k)', () => {
    const config = stepUpConfigFor({ ...base, method: 'amount', stepUpAmount: 1_000 });
    expect(monthlySipForYear(10_000, 1, config)).toBe(10_000);
    expect(monthlySipForYear(10_000, 2, config)).toBe(11_000);
    expect(monthlySipForYear(10_000, 3, config)).toBe(12_000);
    expect(monthlySipForYear(10_000, 4, config)).toBe(13_000);
  });
});

describe('computeStepUp — comparison', () => {
  it('step-up corpus exceeds a normal SIP and the difference is consistent', () => {
    const r = computeStepUp(base);
    expect(r.stepUpCorpus).toBeGreaterThan(r.normalCorpus);
    expect(r.differenceInCorpus).toBeCloseTo(r.stepUpCorpus - r.normalCorpus, 0);
    expect(r.extraWealthCreated).toBeCloseTo(r.differenceInCorpus, 0);
    expect(r.wealthMultiplier).toBeCloseTo(r.stepUpCorpus / r.totalInvested, 6);
  });

  it('a zero step-up makes the two scenarios identical', () => {
    const r = computeStepUp({ ...base, method: 'percentage', stepUpPercent: 0 });
    expect(r.stepUpCorpus).toBeCloseTo(r.normalCorpus, 0);
    expect(r.differenceInCorpus).toBeCloseTo(0, 0);
    expect(r.yearsSaved).toBe(0);
  });

  it('builds a full year-by-year comparison with a rising step-up SIP', () => {
    const r = computeStepUp({ ...base, durationYears: 20, method: 'percentage', stepUpPercent: 10 });
    expect(r.comparison).toHaveLength(20);
    expect(r.comparison[0].monthlySip).toBeCloseTo(base.monthlySip, 0);
    expect(r.comparison[19].monthlySip).toBeGreaterThan(r.comparison[0].monthlySip);
    expect(r.comparison[19].annualInvestment).toBeCloseTo(r.comparison[19].monthlySip * 12, 0);
  });
});

describe('computeStepUp — unique outputs', () => {
  it('equivalent flat SIP reaches (approximately) the step-up corpus', () => {
    const r = computeStepUp(base);
    expect(r.equivalentSip).toBeGreaterThan(base.monthlySip);
    const corpusAtEquivalent = corpusForStepUpSip(r.equivalentSip, base.expectedReturnPct, base.durationYears);
    expect(corpusAtEquivalent).toBeGreaterThan(r.stepUpCorpus * 0.97);
    expect(corpusAtEquivalent).toBeLessThan(r.stepUpCorpus * 1.03);
  });

  it('reports positive years saved and wealth acceleration for a real step-up', () => {
    const r = computeStepUp({ ...base, method: 'percentage', stepUpPercent: 10, durationYears: 20 });
    expect(r.yearsSaved).toBeGreaterThan(0);
    expect(r.wealthAccelerationPct).toBeGreaterThan(0);
  });

  it('the fixed-amount method also produces a comparison', () => {
    const r = computeStepUp({ ...base, method: 'amount', stepUpAmount: 2_000 });
    expect(r.method).toBe('amount');
    expect(r.stepUpCorpus).toBeGreaterThan(r.normalCorpus);
  });
});

describe('auto-generated growth table', () => {
  it('returns engine values for 10/20/30 years with step-up beating normal', () => {
    const rows = buildStepUpGrowthTable();
    expect(rows.map((r) => r.years)).toEqual([10, 20, 30]);
    for (const row of rows) {
      expect(row.normal).toBeGreaterThan(0);
      expect(row.pct5).toBeGreaterThan(row.normal);
      expect(row.pct10).toBeGreaterThan(row.pct5);
      expect(row.pct15).toBeGreaterThan(row.pct10);
    }
  });
});

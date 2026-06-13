import { describe, expect, it } from 'vitest';
import {
  computeSip,
  computeSipComparison,
  corpusForMonthlySip,
  DEFAULT_SIP_INPUTS,
  requiredMonthlySip,
  type SipInputs,
} from '../sipModel';
import { buildSipTargetRows } from '../sipContent';

const base: SipInputs = DEFAULT_SIP_INPUTS;

describe('computeSip — primary results', () => {
  it('invests the SIP and creates additional wealth', () => {
    const r = computeSip({ ...base, monthlySip: 25_000, durationYears: 15, annualStepUpPct: 0 });
    expect(r.totalInvested).toBeCloseTo(25_000 * 12 * 15, 0);
    expect(r.maturityValue).toBeGreaterThan(r.totalInvested);
    expect(r.wealthCreated).toBeCloseTo(r.maturityValue - r.totalInvested, 0);
    expect(r.wealthMultiplier).toBeCloseTo(r.maturityValue / r.totalInvested, 6);
    expect(r.totalGainPct).toBeCloseTo((r.wealthMultiplier - 1) * 100, 4);
  });

  it('includes existing corpus and lumpsum in the invested base', () => {
    const r = computeSip({ ...base, existingCorpus: 1_000_000, lumpsumInvestment: 500_000 });
    expect(r.totalInvested).toBeGreaterThan(1_500_000);
  });
});

describe('computeSip — advanced results', () => {
  it('discounts the corpus for inflation and equals nominal at 0%', () => {
    const withInflation = computeSip({ ...base, inflationPct: 6, durationYears: 15 });
    expect(withInflation.inflationAdjustedCorpus).toBeCloseTo(
      withInflation.maturityValue / Math.pow(1.06, 15),
      0,
    );
    expect(withInflation.inflationAdjustedCorpus).toBeLessThan(withInflation.maturityValue);

    const noInflation = computeSip({ ...base, inflationPct: 0 });
    expect(noInflation.inflationAdjustedCorpus).toBeCloseTo(noInflation.maturityValue, 0);
  });

  it('reports zero step-up benefit when step-up is off and a positive benefit when on', () => {
    const flat = computeSip({ ...base, annualStepUpPct: 0 });
    expect(flat.stepUpBenefit).toBe(0);

    const stepped = computeSip({ ...base, annualStepUpPct: 10 });
    expect(stepped.stepUpBenefit).toBeGreaterThan(0);
    expect(stepped.maturityValue).toBeGreaterThan(flat.maturityValue);
  });

  it('computes a sensible XIRR close to the assumed return', () => {
    const r = computeSip({ ...base, expectedReturnPct: 12 });
    expect(Number.isFinite(r.xirrPct)).toBe(true);
    expect(r.xirrPct).toBeGreaterThan(8);
    expect(r.xirrPct).toBeLessThan(15);
  });
});

describe('computeSip — series', () => {
  it('spans the term and ends at the maturity value', () => {
    const r = computeSip({ ...base, durationYears: 15 });
    expect(r.series).toHaveLength(16); // year 0..15
    expect(r.series[0].year).toBe(0);
    expect(r.series[r.series.length - 1].corpus).toBeCloseTo(r.maturityValue, 0);
    // Invested + gain = corpus at each point.
    for (const point of r.series) {
      expect(point.invested + point.gain).toBeCloseTo(point.corpus, 0);
    }
  });
});

describe('SIP comparison + reverse target maths', () => {
  it('corpus scales linearly with the monthly SIP amount', () => {
    const c10k = corpusForMonthlySip(10_000, 12, 20, 0);
    const c20k = corpusForMonthlySip(20_000, 12, 20, 0);
    expect(c20k).toBeCloseTo(c10k * 2, 0);
  });

  it('produces a comparison row per preset amount with increasing corpus', () => {
    const rows = computeSipComparison({ ...base, durationYears: 20, expectedReturnPct: 12 });
    expect(rows.map((r) => r.monthlySip)).toEqual([5_000, 10_000, 25_000, 50_000, 100_000]);
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i].corpus).toBeGreaterThan(rows[i - 1].corpus);
    }
  });

  it('requiredMonthlySip reaches (approximately) the requested target', () => {
    const sip = requiredMonthlySip(10_000_000, 12, 20);
    expect(sip).toBeGreaterThan(0);
    const corpus = corpusForMonthlySip(sip, 12, 20, 0);
    expect(corpus).toBeGreaterThan(9_900_000);
    expect(corpus).toBeLessThan(10_100_000);
  });

  it('buildSipTargetRows returns engine values for ₹1cr / ₹5cr / ₹10cr', () => {
    const rows = buildSipTargetRows();
    expect(rows.map((r) => r.label)).toEqual(['₹1 Crore', '₹5 Crore', '₹10 Crore']);
    for (const row of rows) {
      expect(row.durations).toHaveLength(3);
      for (const d of row.durations) {
        expect(d.monthlySip).toBeGreaterThan(0);
      }
    }
    // Bigger target needs a bigger SIP for the same duration.
    expect(rows[2].durations[0].monthlySip).toBeGreaterThan(rows[0].durations[0].monthlySip);
  });
});

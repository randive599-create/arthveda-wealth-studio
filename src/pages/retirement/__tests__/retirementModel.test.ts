import { describe, expect, it } from 'vitest';
import {
  computeRetirement,
  DEFAULT_RETIREMENT_INPUTS,
  LIFE_EXPECTANCY,
  type RetirementInputs,
} from '../retirementModel';

const base: RetirementInputs = DEFAULT_RETIREMENT_INPUTS;

describe('computeRetirement — phases & series', () => {
  it('derives the accumulation and drawdown horizons from the ages', () => {
    const r = computeRetirement({ ...base, currentAge: 30, retirementAge: 60 });
    expect(r.yearsToRetirement).toBe(30);
    expect(r.retirementYears).toBe(LIFE_EXPECTANCY - 60);
  });

  it('accumulation starts at the current corpus and ends at the projected corpus', () => {
    const r = computeRetirement({ ...base, currentAge: 30, retirementAge: 60, currentCorpus: 1_000_000 });
    expect(r.accumulationSeries[0]).toEqual({ age: 30, corpus: 1_000_000 });
    const last = r.accumulationSeries[r.accumulationSeries.length - 1];
    expect(last.age).toBe(60);
    expect(last.corpus).toBeCloseTo(r.projectedCorpus, 0);
  });

  it('drawdown starts at retirement age with the projected corpus', () => {
    const r = computeRetirement({ ...base, retirementAge: 60 });
    expect(r.drawdownSeries[0].age).toBe(60);
    expect(r.drawdownSeries[0].corpus).toBeCloseTo(r.projectedCorpus, 0);
    expect(r.drawdownSeries[r.drawdownSeries.length - 1].age).toBe(LIFE_EXPECTANCY);
  });
});

describe('computeRetirement — outputs', () => {
  it('inflates the monthly income need to the retirement age', () => {
    const r = computeRetirement({
      ...base,
      currentAge: 30,
      retirementAge: 60,
      inflationPct: 6,
      expectedMonthlyIncome: 50_000,
    });
    expect(r.inflationAdjustedMonthlyNeed).toBeCloseTo(50_000 * Math.pow(1.06, 30), 0);
    expect(r.inflationAdjustedMonthlyNeed).toBeGreaterThan(50_000);
  });

  it('computes a positive required corpus and a consistent wealth gap', () => {
    const r = computeRetirement(base);
    expect(r.requiredCorpus).toBeGreaterThan(0);
    expect(r.wealthGap).toBeCloseTo(r.requiredCorpus - r.projectedCorpus, 0);
  });

  it('flags a well-funded plan as sustainable with a surplus', () => {
    const r = computeRetirement({
      ...base,
      currentCorpus: 5_000_000,
      monthlyInvestment: 100_000,
      expectedMonthlyIncome: 40_000,
    });
    expect(r.sustainable).toBe(true);
    expect(r.surplus).toBeGreaterThan(0);
    expect(r.shortfall).toBe(0);
    expect(r.incomeSustainedToAge).toBe(LIFE_EXPECTANCY);
    expect(r.projectedCorpus).toBeGreaterThanOrEqual(r.requiredCorpus);
  });

  it('flags an under-funded plan as a shortfall that runs out early', () => {
    const r = computeRetirement({
      ...base,
      currentCorpus: 0,
      monthlyInvestment: 2_000,
      expectedMonthlyIncome: 200_000,
    });
    expect(r.sustainable).toBe(false);
    expect(r.shortfall).toBeGreaterThan(0);
    expect(r.surplus).toBe(0);
    expect(r.incomeSustainedToAge).toBeLessThan(LIFE_EXPECTANCY);
    expect(r.projectedCorpus).toBeLessThan(r.requiredCorpus);
  });
});

/**
 * Retirement planner calculation model.
 *
 * Pure, self-contained model for the dedicated /retirement-calculator (no React,
 * no DOM, no store). It models BOTH phases with the existing ArthVeda engine via
 * `buildProjection` — so the maths is identical to the rest of the site and NO
 * existing formula is changed:
 *
 *   1. Accumulation (current age -> retirement age): current corpus + a monthly
 *      investment with annual step-up, compounding at the expected return.
 *   2. Drawdown (retirement age -> life expectancy): the corpus funds an
 *      inflation-growing monthly income while the balance earns the same return.
 *
 * Derived outputs: Retirement Corpus Required, Projected Corpus, Retirement
 * Income Sustainability, Wealth Gap, and the Inflation-Adjusted Retirement Need.
 *
 * Assumptions kept out of the input set: a life expectancy of 85 (the drawdown
 * horizon), and the same expected return for both phases.
 */

import { buildProjection } from '../../engine';
import type { Currency } from '../../engine/types';
import { MAX_DURATION_YEARS, MIN_DURATION_YEARS } from '../../engine/constants';
import { DEFAULT_INPUTS } from '../../state/defaults';
import { clampInputs } from '../../state/schema';

/** The eight retirement inputs. Monetary values are whole INR. */
export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  currentCorpus: number;
  monthlyInvestment: number;
  annualStepUpPct: number;
  expectedReturnPct: number;
  inflationPct: number;
  expectedMonthlyIncome: number;
}

export const RETIREMENT_CURRENCY: Currency = 'INR';

/** Drawdown horizon assumption: income must last until this age. */
export const LIFE_EXPECTANCY = 85;

export const DEFAULT_RETIREMENT_INPUTS: RetirementInputs = {
  currentAge: 30,
  retirementAge: 60,
  currentCorpus: 1_000_000,
  monthlyInvestment: 30_000,
  annualStepUpPct: 10,
  expectedReturnPct: 12,
  inflationPct: 6,
  expectedMonthlyIncome: 50_000,
};

export interface RetirementPoint {
  age: number;
  corpus: number;
}

export interface RetirementResult {
  currency: Currency;
  lifeExpectancy: number;
  yearsToRetirement: number;
  retirementYears: number;
  /** Corpus you are projected to have at retirement age. */
  projectedCorpus: number;
  /** Corpus required at retirement to fund the desired (inflated) income. */
  requiredCorpus: number;
  /** required - projected (positive = shortfall, negative = surplus). */
  wealthGap: number;
  surplus: number;
  shortfall: number;
  /** Whether the projected corpus sustains the income to life expectancy. */
  sustainable: boolean;
  /** Age until which the income is sustained (life expectancy if sustainable). */
  incomeSustainedToAge: number;
  /** Desired monthly income inflated to the retirement age (nominal). */
  inflationAdjustedMonthlyNeed: number;
  accumulationSeries: RetirementPoint[];
  drawdownSeries: RetirementPoint[];
}

function clampYears(rawYears: number): number {
  return Math.min(Math.max(Math.round(rawYears), MIN_DURATION_YEARS), MAX_DURATION_YEARS);
}

/** Compute the full retirement result. Pure and total. */
export function computeRetirement(inputs: RetirementInputs): RetirementResult {
  const yearsToRetirement = clampYears(inputs.retirementAge - inputs.currentAge);
  const retirementYears = clampYears(LIFE_EXPECTANCY - inputs.retirementAge);
  const inflation = inputs.inflationPct / 100;

  // --- Phase 1: accumulation -------------------------------------------------
  const accProjection = buildProjection(
    clampInputs(
      {
        ...DEFAULT_INPUTS,
        currency: RETIREMENT_CURRENCY,
        mode: 'accumulation',
        lumpsum: inputs.currentCorpus,
        monthlySip: inputs.monthlyInvestment,
        sipStepUp: { method: 'percentage', percentage: inputs.annualStepUpPct, amount: 0 },
        annualReturnRate: inputs.expectedReturnPct,
        durationYears: yearsToRetirement,
        sipStopYear: yearsToRetirement,
        withdrawalStartYear: yearsToRetirement,
        inflation: { enabled: false, rate: inputs.inflationPct },
      },
      DEFAULT_INPUTS,
    ),
  );
  const projectedCorpus = accProjection.summary.finalCorpus;
  const accumulationSeries: RetirementPoint[] = [
    { age: inputs.currentAge, corpus: inputs.currentCorpus },
    ...accProjection.yearly.map((row) => ({ age: inputs.currentAge + row.year, corpus: row.corpus })),
  ];

  // Monthly income required at retirement, inflated from today's money.
  const inflationAdjustedMonthlyNeed =
    inputs.expectedMonthlyIncome * Math.pow(1 + inflation, yearsToRetirement);

  // --- Phase 2: drawdown -----------------------------------------------------
  const drawdown = (startCorpus: number) =>
    buildProjection(
      clampInputs(
        {
          ...DEFAULT_INPUTS,
          currency: RETIREMENT_CURRENCY,
          mode: 'income',
          lumpsum: startCorpus,
          monthlySip: 0,
          sipStepUp: { method: 'percentage', percentage: 0, amount: 0 },
          annualReturnRate: inputs.expectedReturnPct,
          durationYears: retirementYears,
          sipStopYear: 1,
          withdrawalStartYear: 1,
          withdrawalReturnRate: inputs.expectedReturnPct,
          monthlySwp: inflationAdjustedMonthlyNeed,
          swpStepUp: { method: 'percentage', percentage: inputs.inflationPct, amount: 0 },
          inflation: { enabled: false, rate: inputs.inflationPct },
        },
        DEFAULT_INPUTS,
      ),
    );

  // Required corpus: the engine drawdown's final balance is linear in the
  // starting corpus (withdrawals are fixed amounts), so two non-depleting
  // reference runs recover the line, and we solve final balance = 0.
  const withdrawalUpperBound =
    inflationAdjustedMonthlyNeed * 12 * retirementYears * Math.pow(1 + inflation, retirementYears) +
    1;
  const ref1 = withdrawalUpperBound;
  const ref2 = withdrawalUpperBound * 2;
  const f1 = drawdown(ref1).summary.finalCorpus;
  const f2 = drawdown(ref2).summary.finalCorpus;
  const slope = (f2 - f1) / (ref2 - ref1);
  const intercept = f1 - slope * ref1;
  const requiredCorpus = slope > 1e-9 ? Math.max(0, -intercept / slope) : 0;

  // Actual drawdown of the projected corpus (chart + sustainability).
  const projDrawdown = drawdown(projectedCorpus);
  const drawdownSeries: RetirementPoint[] = [
    { age: inputs.retirementAge, corpus: projectedCorpus },
    ...projDrawdown.yearly.map((row) => ({
      age: inputs.retirementAge + row.year,
      corpus: Math.max(0, row.corpus),
    })),
  ];
  const sustainable = !projDrawdown.flags.depleted;
  const incomeSustainedToAge = sustainable
    ? LIFE_EXPECTANCY
    : inputs.retirementAge + (projDrawdown.flags.depletionYear ?? retirementYears);

  const wealthGap = requiredCorpus - projectedCorpus;

  return {
    currency: RETIREMENT_CURRENCY,
    lifeExpectancy: LIFE_EXPECTANCY,
    yearsToRetirement,
    retirementYears,
    projectedCorpus,
    requiredCorpus,
    wealthGap,
    surplus: Math.max(0, -wealthGap),
    shortfall: Math.max(0, wealthGap),
    sustainable,
    incomeSustainedToAge,
    inflationAdjustedMonthlyNeed,
    accumulationSeries,
    drawdownSeries,
  };
}

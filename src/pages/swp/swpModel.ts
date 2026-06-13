/**
 * SWP (Systematic Withdrawal Plan) calculation model.
 *
 * Pure, self-contained model for the /swp-calculator page (no React, no DOM, no
 * store). The deterministic withdrawal projection — an initial corpus drawn down
 * by a flat monthly withdrawal while the balance compounds — is produced by the
 * existing ArthVeda engine via `buildProjection` (income mode), so the maths is
 * identical to the rest of the site and NO existing formula is changed.
 *
 * On top of that projection this module derives the SWP-specific outputs:
 *   - Corpus Longevity                — how long the corpus lasts (month precision)
 *   - Total Withdrawals               — sum actually withdrawn
 *   - Remaining Corpus                — balance at the end of the term
 *   - Inflation-Adjusted Income       — real (today's money) value of the withdrawal
 *   - Portfolio Survival Probability  — a seeded Monte-Carlo estimate
 */

import { buildProjection } from '../../engine';
import type { Currency } from '../../engine/types';
import { MAX_DURATION_YEARS, MIN_DURATION_YEARS } from '../../engine/constants';
import { DEFAULT_INPUTS } from '../../state/defaults';
import { clampInputs } from '../../state/schema';

/** The five SWP-specific inputs. Monetary values are whole INR. */
export interface SwpInputs {
  initialCorpus: number;
  monthlyWithdrawal: number;
  annualReturnPct: number;
  inflationPct: number;
  durationYears: number;
}

export const SWP_CURRENCY: Currency = 'INR';

/**
 * Assumed annual return volatility used only by the survival-probability Monte
 * Carlo (a balanced-portfolio standard deviation). The deterministic outputs do
 * not use it.
 */
export const ASSUMED_ANNUAL_VOLATILITY_PCT = 12;

/** Number of Monte-Carlo paths for the survival estimate (seeded → deterministic). */
const MONTE_CARLO_RUNS = 600;

export const DEFAULT_SWP_INPUTS: SwpInputs = {
  initialCorpus: 10_000_000,
  monthlyWithdrawal: 50_000,
  annualReturnPct: 8,
  inflationPct: 6,
  durationYears: 25,
};

/** One year on the withdrawal journey (drives the depletion curve). */
export interface SwpSeriesPoint {
  year: number;
  corpus: number;
  /** Cumulative amount withdrawn by the end of this year. */
  withdrawn: number;
}

export interface SwpResult {
  currency: Currency;
  durationYears: number;
  /** Whether the corpus is exhausted before the end of the term. */
  depleted: boolean;
  /** Whole months the corpus sustains the withdrawals (<= durationYears * 12). */
  longevityMonths: number;
  /** True when the corpus lasts the entire term. */
  survivesFullTerm: boolean;
  /** Total amount actually withdrawn over the term. */
  totalWithdrawals: number;
  /** Corpus remaining at the end of the term (0 if depleted). */
  remainingCorpus: number;
  /** Real (today's-money) value of the monthly withdrawal at the end of the term. */
  inflationAdjustedMonthlyIncome: number;
  /** Monte-Carlo probability (0..1) the corpus survives the full term. */
  survivalProbability: number;
  series: SwpSeriesPoint[];
}

function clampYears(rawYears: number): number {
  const y = Math.round(rawYears);
  return Math.min(Math.max(y, MIN_DURATION_YEARS), MAX_DURATION_YEARS);
}

/** Seeded PRNG (mulberry32) so the survival probability is reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Monte-Carlo probability the corpus survives the full term, drawing monthly
 * real returns from a normal distribution around the expected return with an
 * assumed volatility. Flat nominal withdrawals (matching the deterministic
 * projection and the depletion curve).
 */
function survivalProbability(inputs: SwpInputs, years: number): number {
  const months = years * 12;
  if (inputs.monthlyWithdrawal <= 0) {
    return 1;
  }
  if (inputs.initialCorpus <= 0) {
    return 0;
  }
  const monthlyMean = Math.pow(1 + inputs.annualReturnPct / 100, 1 / 12) - 1;
  const monthlySigma = ASSUMED_ANNUAL_VOLATILITY_PCT / 100 / Math.sqrt(12);
  const rand = mulberry32(0x9e3779b9);

  let survivors = 0;
  for (let run = 0; run < MONTE_CARLO_RUNS; run += 1) {
    let corpus = inputs.initialCorpus;
    let alive = true;
    for (let m = 0; m < months; m += 1) {
      const u1 = Math.max(rand(), 1e-12);
      const u2 = rand();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const monthlyReturn = monthlyMean + monthlySigma * z;
      corpus = corpus * (1 + monthlyReturn) - inputs.monthlyWithdrawal;
      if (corpus <= 0) {
        alive = false;
        break;
      }
    }
    if (alive) {
      survivors += 1;
    }
  }
  return survivors / MONTE_CARLO_RUNS;
}

/** Compute the full SWP result. Pure and total. */
export function computeSwp(inputs: SwpInputs): SwpResult {
  const years = clampYears(inputs.durationYears);
  const inflation = inputs.inflationPct / 100;

  // Reuse the production engine for the withdrawal projection (income mode:
  // initial corpus, no SIP, flat monthly withdrawal from year 1).
  const projInputs = clampInputs(
    {
      ...DEFAULT_INPUTS,
      currency: SWP_CURRENCY,
      mode: 'income',
      lumpsum: inputs.initialCorpus,
      monthlySip: 0,
      sipStepUp: { method: 'percentage', percentage: 0, amount: 0 },
      annualReturnRate: inputs.annualReturnPct,
      durationYears: years,
      sipStopYear: 1,
      withdrawalStartYear: 1,
      withdrawalReturnRate: inputs.annualReturnPct,
      monthlySwp: inputs.monthlyWithdrawal,
      swpStepUp: { method: 'percentage', percentage: 0, amount: 0 },
      inflation: { enabled: false, rate: inputs.inflationPct },
    },
    DEFAULT_INPUTS,
  );
  const projection = buildProjection(projInputs);

  const depleted = projection.flags.depleted;
  const totalMonths = projection.monthly.length;
  let longevityMonths = totalMonths;
  if (depleted) {
    const idx = projection.monthly.findIndex((row) => row.corpus <= 0);
    longevityMonths = idx >= 0 ? projection.monthly[idx].month : totalMonths;
  }

  const series: SwpSeriesPoint[] = [{ year: 0, corpus: inputs.initialCorpus, withdrawn: 0 }];
  for (const row of projection.yearly) {
    series.push({ year: row.year, corpus: row.corpus, withdrawn: row.totalWithdrawn });
  }

  return {
    currency: SWP_CURRENCY,
    durationYears: years,
    depleted,
    longevityMonths,
    survivesFullTerm: !depleted,
    totalWithdrawals: projection.summary.totalWithdrawn,
    remainingCorpus: projection.summary.finalCorpus,
    inflationAdjustedMonthlyIncome: inputs.monthlyWithdrawal / Math.pow(1 + inflation, years),
    survivalProbability: survivalProbability(inputs, years),
    series,
  };
}

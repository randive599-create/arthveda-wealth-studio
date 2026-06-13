/**
 * FIRE (Financial Independence, Retire Early) calculation model.
 *
 * This is a dedicated, self-contained model for the /fire-calculator page. It
 * is pure (no React, no DOM, no store) and is unit-testable in isolation.
 *
 * The accumulation projection (current net worth + a monthly investment with an
 * annual step-up, compounding at the expected return) is produced by the
 * existing ArthVeda engine via `buildProjection` — so the compounding is
 * identical to the rest of the site and NO existing formula is changed. On top
 * of that corpus, this module derives the FIRE-specific outputs:
 *
 *   - FIRE Number Required        — annual expenses / safe-withdrawal-rate (today's money)
 *   - Inflation-Adjusted FIRE No. — future annual expenses at FIRE age / SWR (the corpus actually needed)
 *   - Projected Corpus at FIRE Age
 *   - Years Remaining to FIRE
 *   - FIRE Success Indicator      — projected corpus >= inflation-adjusted FIRE number
 *   - Wealth Gap                  — shortfall (or surplus) at FIRE age
 */

import { buildProjection } from '../../engine';
import type { Currency } from '../../engine/types';
import { MAX_DURATION_YEARS, MIN_DURATION_YEARS } from '../../engine/constants';
import { DEFAULT_INPUTS } from '../../state/defaults';
import { clampInputs } from '../../state/schema';

/** The nine FIRE-specific inputs. All monetary values are in whole INR. */
export interface FireInputs {
  currentAge: number;
  targetFireAge: number;
  currentNetWorth: number;
  monthlyInvestment: number;
  annualStepUpPct: number;
  expectedReturnPct: number;
  inflationPct: number;
  annualExpensesToday: number;
  safeWithdrawalRatePct: number;
}

/** The FIRE calculator works in INR (matching the FIRE preset). */
export const FIRE_CURRENCY: Currency = 'INR';

export const DEFAULT_FIRE_INPUTS: FireInputs = {
  currentAge: 30,
  targetFireAge: 45,
  currentNetWorth: 1_000_000,
  monthlyInvestment: 50_000,
  annualStepUpPct: 10,
  expectedReturnPct: 12,
  inflationPct: 6,
  annualExpensesToday: 1_200_000,
  safeWithdrawalRatePct: 4,
};

/** One year on the FIRE journey (used by every chart). */
export interface FireSeriesPoint {
  /** Age at this point. */
  age: number;
  /** Years from today (0 = now). */
  year: number;
  /** Projected corpus at this age. */
  corpus: number;
  /** Inflation-adjusted FIRE number (required corpus) at this age. */
  fireNumber: number;
  /** fireNumber - corpus (positive = shortfall, negative = surplus). */
  gap: number;
}

export interface FireResult {
  currency: Currency;
  /** Whole years from now until the target FIRE age. */
  yearsToFire: number;
  /** Corpus needed today to fund expenses indefinitely (expenses / SWR). */
  fireNumberToday: number;
  /** Corpus needed at the FIRE age, after inflating expenses. */
  inflationAdjustedFireNumber: number;
  /** Projected corpus at the FIRE age. */
  projectedCorpusAtFire: number;
  /** inflationAdjustedFireNumber - projectedCorpusAtFire. */
  wealthGap: number;
  /** Surplus over the FIRE number (0 when short). */
  surplus: number;
  /** Shortfall below the FIRE number (0 when on track). */
  shortfall: number;
  /** Whether the projected corpus meets the inflation-adjusted FIRE number. */
  onTrack: boolean;
  /** False when the target age is not strictly after the current age. */
  validHorizon: boolean;
  /** Year-by-year corpus vs. FIRE number, age `currentAge` .. FIRE age. */
  series: FireSeriesPoint[];
}

function clampYears(rawYears: number): number {
  const y = Math.round(rawYears);
  return Math.min(Math.max(y, MIN_DURATION_YEARS), MAX_DURATION_YEARS);
}

/**
 * Compute the full FIRE result for a set of inputs. Pure and total: always
 * returns a valid result (the horizon is clamped to the engine's bounds, and
 * the safe-withdrawal rate is floored to avoid division by zero).
 */
export function computeFire(inputs: FireInputs): FireResult {
  const rawYears = inputs.targetFireAge - inputs.currentAge;
  const validHorizon = rawYears >= MIN_DURATION_YEARS;
  const years = clampYears(rawYears);

  // Guard the SWR so the FIRE number is always finite.
  const swr = Math.max(inputs.safeWithdrawalRatePct, 0.1) / 100;
  const inflation = inputs.inflationPct / 100;

  // Reuse the production engine for the accumulation curve — identical monthly
  // compounding + annual step-up to the rest of the site. Inflation adjustment
  // is computed here (against the FIRE number), so the engine runs nominal.
  const projInputs = clampInputs(
    {
      ...DEFAULT_INPUTS,
      currency: FIRE_CURRENCY,
      mode: 'accumulation',
      lumpsum: inputs.currentNetWorth,
      monthlySip: inputs.monthlyInvestment,
      sipStepUp: { method: 'percentage', percentage: inputs.annualStepUpPct, amount: 0 },
      annualReturnRate: inputs.expectedReturnPct,
      durationYears: years,
      sipStopYear: years,
      withdrawalStartYear: years,
      inflation: { enabled: false, rate: inputs.inflationPct },
    },
    DEFAULT_INPUTS,
  );
  const projection = buildProjection(projInputs);

  const corpusByYear = new Map<number, number>();
  for (const row of projection.yearly) {
    corpusByYear.set(row.year, row.corpus);
  }

  /** Inflation-adjusted FIRE number at `t` years from now. */
  const requiredAt = (t: number): number =>
    (inputs.annualExpensesToday * Math.pow(1 + inflation, t)) / swr;

  const series: FireSeriesPoint[] = [];
  for (let t = 0; t <= years; t += 1) {
    const corpus = t === 0 ? inputs.currentNetWorth : (corpusByYear.get(t) ?? 0);
    const fireNumber = requiredAt(t);
    series.push({
      age: inputs.currentAge + t,
      year: t,
      corpus,
      fireNumber,
      gap: fireNumber - corpus,
    });
  }

  const fireNumberToday = requiredAt(0);
  const inflationAdjustedFireNumber = requiredAt(years);
  const projectedCorpusAtFire = projection.summary.finalCorpus;
  const wealthGap = inflationAdjustedFireNumber - projectedCorpusAtFire;
  const onTrack = projectedCorpusAtFire >= inflationAdjustedFireNumber;

  return {
    currency: FIRE_CURRENCY,
    yearsToFire: years,
    fireNumberToday,
    inflationAdjustedFireNumber,
    projectedCorpusAtFire,
    wealthGap,
    surplus: Math.max(0, -wealthGap),
    shortfall: Math.max(0, wealthGap),
    onTrack,
    validHorizon,
    series,
  };
}

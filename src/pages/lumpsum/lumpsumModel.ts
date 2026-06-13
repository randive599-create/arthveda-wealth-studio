/**
 * Lumpsum calculation model.
 *
 * Pure, self-contained model for the /lumpsum-calculator page (no React, no
 * DOM, no store). The one-time investment compounding is produced by the
 * existing ArthVeda engine via `buildProjection` (accumulation mode, no SIP), so
 * the maths is identical to the rest of the site and NO existing formula is
 * changed. On top of that it derives the lumpsum-specific outputs: Final Corpus,
 * Total Gain, CAGR, Inflation-Adjusted Corpus, and Wealth Multiplier.
 *
 * An Inflation % input is included because it is required to produce the
 * Inflation-Adjusted Corpus output; the three headline inputs (One-Time
 * Investment, Expected Return, Duration) drive the nominal growth.
 */

import { buildProjection } from '../../engine';
import type { Currency } from '../../engine/types';
import { MAX_DURATION_YEARS, MIN_DURATION_YEARS } from '../../engine/constants';
import { DEFAULT_INPUTS } from '../../state/defaults';
import { clampInputs } from '../../state/schema';

/** The lumpsum inputs. Monetary values are whole INR. */
export interface LumpsumInputs {
  oneTimeInvestment: number;
  expectedReturnPct: number;
  inflationPct: number;
  durationYears: number;
}

export const LUMPSUM_CURRENCY: Currency = 'INR';

export const DEFAULT_LUMPSUM_INPUTS: LumpsumInputs = {
  oneTimeInvestment: 1_000_000,
  expectedReturnPct: 12,
  inflationPct: 6,
  durationYears: 20,
};

/** One year on the growth journey (drives the investment growth curve). */
export interface LumpsumSeriesPoint {
  year: number;
  corpus: number;
  invested: number;
}

export interface LumpsumResult {
  currency: Currency;
  durationYears: number;
  /** The one-time amount invested. */
  invested: number;
  /** Nominal corpus at the end of the term. */
  finalCorpus: number;
  /** finalCorpus - invested. */
  totalGain: number;
  /** Compound annual growth rate of the corpus (percent). */
  cagrPct: number;
  /** Real (today's-money) value of the final corpus. */
  inflationAdjustedCorpus: number;
  /** finalCorpus / invested. */
  wealthMultiplier: number;
  series: LumpsumSeriesPoint[];
}

function clampYears(rawYears: number): number {
  return Math.min(Math.max(Math.round(rawYears), MIN_DURATION_YEARS), MAX_DURATION_YEARS);
}

/** Compute the full lumpsum result. Pure and total. */
export function computeLumpsum(inputs: LumpsumInputs): LumpsumResult {
  const years = clampYears(inputs.durationYears);
  const inflation = inputs.inflationPct / 100;
  const invested = inputs.oneTimeInvestment;

  // Reuse the production engine for the compounding (accumulation, no SIP).
  const projInputs = clampInputs(
    {
      ...DEFAULT_INPUTS,
      currency: LUMPSUM_CURRENCY,
      mode: 'accumulation',
      lumpsum: invested,
      monthlySip: 0,
      sipStepUp: { method: 'percentage', percentage: 0, amount: 0 },
      annualReturnRate: inputs.expectedReturnPct,
      durationYears: years,
      sipStopYear: years,
      withdrawalStartYear: years,
      inflation: { enabled: false, rate: inputs.inflationPct },
    },
    DEFAULT_INPUTS,
  );
  const projection = buildProjection(projInputs);

  const finalCorpus = projection.summary.finalCorpus;
  const totalGain = finalCorpus - invested;
  const wealthMultiplier = invested > 0 ? finalCorpus / invested : 0;
  const cagrPct =
    invested > 0 && years > 0 ? (Math.pow(finalCorpus / invested, 1 / years) - 1) * 100 : 0;
  const inflationAdjustedCorpus = finalCorpus / Math.pow(1 + inflation, years);

  const series: LumpsumSeriesPoint[] = [{ year: 0, corpus: invested, invested }];
  for (const row of projection.yearly) {
    series.push({ year: row.year, corpus: row.corpus, invested });
  }

  return {
    currency: LUMPSUM_CURRENCY,
    durationYears: years,
    invested,
    finalCorpus,
    totalGain,
    cagrPct,
    inflationAdjustedCorpus,
    wealthMultiplier,
    series,
  };
}

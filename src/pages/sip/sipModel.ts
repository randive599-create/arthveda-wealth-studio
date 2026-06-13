/**
 * SIP calculation model.
 *
 * Pure, self-contained model for the dedicated /sip-calculator experience (no
 * React, no DOM, no store). The monthly compounding + annual step-up projection
 * is produced by the existing ArthVeda engine via `buildProjection`
 * (accumulation mode), so the maths is identical to the rest of the site and NO
 * existing formula is changed. On top of that it derives the SIP-specific
 * primary and advanced outputs, the comparison rows, and the reverse
 * "SIP required for a target corpus" figures.
 */

import { buildProjection } from '../../engine';
import type { Currency, ProjectionInputs } from '../../engine/types';
import { MAX_DURATION_YEARS, MIN_DURATION_YEARS } from '../../engine/constants';
import { DEFAULT_INPUTS } from '../../state/defaults';
import { clampInputs } from '../../state/schema';

/** SIP inputs. Basic = first three; advanced = the rest. Monetary values in INR. */
export interface SipInputs {
  monthlySip: number;
  durationYears: number;
  expectedReturnPct: number;
  // Advanced
  annualStepUpPct: number;
  inflationPct: number;
  existingCorpus: number;
  lumpsumInvestment: number;
}

export const SIP_CURRENCY: Currency = 'INR';

export const DEFAULT_SIP_INPUTS: SipInputs = {
  monthlySip: 25_000,
  durationYears: 15,
  expectedReturnPct: 12,
  annualStepUpPct: 0,
  inflationPct: 6,
  existingCorpus: 0,
  lumpsumInvestment: 0,
};

/** SIP amount quick-presets and duration quick-presets. */
export const SIP_AMOUNT_PRESETS = [5_000, 10_000, 25_000, 50_000] as const;
export const SIP_DURATION_PRESETS = [10, 15, 20, 25, 30] as const;
/** Monthly SIP amounts shown in the comparison table. */
export const SIP_COMPARISON_AMOUNTS = [5_000, 10_000, 25_000, 50_000, 100_000] as const;

export interface SipSeriesPoint {
  year: number;
  /** Cumulative amount invested by end of year. */
  invested: number;
  /** Returns earned (corpus - invested). */
  gain: number;
  /** Total corpus. */
  corpus: number;
  /** Inflation-adjusted (real) corpus. */
  realCorpus: number;
}

export interface SipResult {
  currency: Currency;
  durationYears: number;
  // Primary
  totalInvested: number;
  maturityValue: number;
  wealthCreated: number;
  totalGainPct: number;
  wealthMultiplier: number;
  // Advanced
  inflationAdjustedCorpus: number;
  realWealthMultiplier: number;
  stepUpBenefit: number;
  xirrPct: number;
  series: SipSeriesPoint[];
}

function clampYears(rawYears: number): number {
  return Math.min(Math.max(Math.round(rawYears), MIN_DURATION_YEARS), MAX_DURATION_YEARS);
}

/** Build a valid engine input for a SIP scenario. */
function sipProjectionInputs(
  monthlySip: number,
  years: number,
  returnPct: number,
  stepUpPct: number,
  lumpsum: number,
): ProjectionInputs {
  return clampInputs(
    {
      ...DEFAULT_INPUTS,
      currency: SIP_CURRENCY,
      mode: 'accumulation',
      lumpsum,
      monthlySip,
      sipStepUp: { method: 'percentage', percentage: stepUpPct, amount: 0 },
      annualReturnRate: returnPct,
      durationYears: years,
      sipStopYear: years,
      withdrawalStartYear: years,
      inflation: { enabled: false, rate: 0 },
    },
    DEFAULT_INPUTS,
  );
}

/** Final corpus for a flat-or-stepped SIP (used by the comparison + target maths). */
export function corpusForMonthlySip(
  monthlySip: number,
  returnPct: number,
  years: number,
  stepUpPct = 0,
  lumpsum = 0,
): number {
  return buildProjection(
    sipProjectionInputs(monthlySip, clampYears(years), returnPct, stepUpPct, lumpsum),
  ).summary.finalCorpus;
}

/**
 * Reverse calculation: the flat monthly SIP needed to reach `targetCorpus`.
 * Corpus is linear in the SIP amount (no lumpsum, step-up applied uniformly), so
 * we scale a reference run. Rounded to the nearest ₹100.
 */
export function requiredMonthlySip(targetCorpus: number, returnPct: number, years: number): number {
  const reference = 10_000;
  const corpusPerReference = corpusForMonthlySip(reference, returnPct, years, 0);
  if (corpusPerReference <= 0) {
    return 0;
  }
  const raw = (targetCorpus * reference) / corpusPerReference;
  return Math.round(raw / 100) * 100;
}

/** Annual XIRR via bisection on engine-derived yearly cashflows. */
function annualXirr(lumpsum: number, cumulativeInvested: number[], finalCorpus: number): number {
  const years = cumulativeInvested.length;
  const totalInvested = lumpsum + (years > 0 ? cumulativeInvested[years - 1] : 0);
  if (totalInvested <= 0 || finalCorpus <= 0) {
    return 0;
  }
  const contributions: number[] = [];
  for (let y = 1; y <= years; y += 1) {
    const prev = y === 1 ? 0 : cumulativeInvested[y - 2];
    contributions.push(cumulativeInvested[y - 1] - prev);
  }
  const npv = (rate: number): number => {
    let value = -lumpsum;
    for (let y = 1; y <= years; y += 1) {
      value -= contributions[y - 1] / Math.pow(1 + rate, y - 1);
    }
    value += finalCorpus / Math.pow(1 + rate, years);
    return value;
  };

  let lo = -0.9;
  let hi = 5;
  let fLo = npv(lo);
  if (fLo * npv(hi) > 0) {
    return 0;
  }
  for (let i = 0; i < 100; i += 1) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);
    if (Math.abs(fMid) < 1e-4) {
      return mid;
    }
    if (fLo * fMid < 0) {
      hi = mid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

/** Compute the full SIP result. Pure and total. */
export function computeSip(inputs: SipInputs): SipResult {
  const years = clampYears(inputs.durationYears);
  const inflation = inputs.inflationPct / 100;
  const lumpsum = inputs.existingCorpus + inputs.lumpsumInvestment;

  const projection = buildProjection(
    sipProjectionInputs(
      inputs.monthlySip,
      years,
      inputs.expectedReturnPct,
      inputs.annualStepUpPct,
      lumpsum,
    ),
  );

  const totalInvested = projection.summary.totalInvestment;
  const maturityValue = projection.summary.finalCorpus;
  const wealthCreated = maturityValue - totalInvested;
  const wealthMultiplier = totalInvested > 0 ? maturityValue / totalInvested : 0;
  const totalGainPct = totalInvested > 0 ? (maturityValue / totalInvested - 1) * 100 : 0;

  const inflationAdjustedCorpus = maturityValue / Math.pow(1 + inflation, years);
  const realWealthMultiplier = totalInvested > 0 ? inflationAdjustedCorpus / totalInvested : 0;

  // Step-up benefit = extra maturity value vs. an equivalent flat SIP.
  const flatCorpus =
    inputs.annualStepUpPct > 0
      ? buildProjection(
          sipProjectionInputs(inputs.monthlySip, years, inputs.expectedReturnPct, 0, lumpsum),
        ).summary.finalCorpus
      : maturityValue;
  const stepUpBenefit = maturityValue - flatCorpus;

  const cumulativeInvested = projection.yearly.map((row) => row.totalInvested - lumpsum);
  const xirrPct = annualXirr(lumpsum, cumulativeInvested, maturityValue) * 100;

  const series: SipSeriesPoint[] = [
    { year: 0, invested: lumpsum, gain: 0, corpus: lumpsum, realCorpus: lumpsum },
  ];
  for (const row of projection.yearly) {
    series.push({
      year: row.year,
      invested: row.totalInvested,
      gain: row.returns,
      corpus: row.corpus,
      realCorpus: row.corpus / Math.pow(1 + inflation, row.year),
    });
  }

  return {
    currency: SIP_CURRENCY,
    durationYears: years,
    totalInvested,
    maturityValue,
    wealthCreated,
    totalGainPct,
    wealthMultiplier,
    inflationAdjustedCorpus,
    realWealthMultiplier,
    stepUpBenefit,
    xirrPct,
    series,
  };
}

export interface SipComparisonRow {
  monthlySip: number;
  corpus: number;
}

/** Corpus for each comparison SIP amount at the current duration/return/step-up. */
export function computeSipComparison(inputs: SipInputs): SipComparisonRow[] {
  return SIP_COMPARISON_AMOUNTS.map((monthlySip) => ({
    monthlySip,
    corpus: corpusForMonthlySip(
      monthlySip,
      inputs.expectedReturnPct,
      inputs.durationYears,
      inputs.annualStepUpPct,
    ),
  }));
}

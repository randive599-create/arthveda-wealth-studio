/**
 * SIP vs. Step-Up SIP comparison model.
 *
 * Pure, self-contained model for the dedicated /sip-vs-stepup-sip-calculator
 * page (no React, no DOM, no store). Both scenarios — a normal flat SIP and a
 * step-up SIP (percentage OR fixed-amount) — are produced by the existing
 * ArthVeda engine via `buildProjection`, so the maths is identical to the rest
 * of the site and NO existing formula is changed.
 *
 * On top of the two projections it derives the comparison outputs plus four
 * unique ArthVeda insights: Years Saved, Equivalent SIP, Wealth Acceleration %,
 * and Extra Wealth Created.
 */

import { buildProjection } from '../../engine';
import { steppedAmount } from '../../engine/stepUp';
import type { Currency, StepUpConfig } from '../../engine/types';
import { MAX_DURATION_YEARS, MIN_DURATION_YEARS } from '../../engine/constants';
import { DEFAULT_INPUTS } from '../../state/defaults';
import { clampInputs } from '../../state/schema';

export type StepUpMethod = 'percentage' | 'amount';

/** Inputs. Only one step-up method is active at a time (the `method` field). */
export interface StepUpInputs {
  monthlySip: number;
  durationYears: number;
  expectedReturnPct: number;
  method: StepUpMethod;
  stepUpPercent: number;
  stepUpAmount: number;
}

export const STEPUP_CURRENCY: Currency = 'INR';

export const DEFAULT_STEPUP_INPUTS: StepUpInputs = {
  monthlySip: 10_000,
  durationYears: 20,
  expectedReturnPct: 12,
  method: 'percentage',
  stepUpPercent: 10,
  stepUpAmount: 1_000,
};

export const STEPUP_SIP_PRESETS = [5_000, 10_000, 25_000, 50_000, 100_000] as const;
export const STEPUP_DURATION_PRESETS = [10, 15, 20, 25, 30] as const;
export const STEPUP_PERCENT_PRESETS = [5, 10, 15] as const;
export const STEPUP_AMOUNT_PRESETS = [500, 1_000, 2_000, 5_000] as const;

function clampYears(rawYears: number): number {
  return Math.min(Math.max(Math.round(rawYears), MIN_DURATION_YEARS), MAX_DURATION_YEARS);
}

const FLAT: StepUpConfig = { method: 'percentage', percentage: 0, amount: 0 };

/** The active step-up configuration for the selected method. */
export function stepUpConfigFor(inputs: StepUpInputs): StepUpConfig {
  return inputs.method === 'percentage'
    ? { method: 'percentage', percentage: inputs.stepUpPercent, amount: 0 }
    : { method: 'fixed', percentage: 0, amount: inputs.stepUpAmount };
}

/** The monthly SIP for a given (1-based) year under a step-up config. */
export function monthlySipForYear(monthlySip: number, year: number, config: StepUpConfig): number {
  return steppedAmount(monthlySip, year - 1, config);
}

function project(monthlySip: number, returnPct: number, years: number, stepUp: StepUpConfig) {
  return buildProjection(
    clampInputs(
      {
        ...DEFAULT_INPUTS,
        currency: STEPUP_CURRENCY,
        mode: 'accumulation',
        lumpsum: 0,
        monthlySip,
        sipStepUp: stepUp,
        annualReturnRate: returnPct,
        durationYears: years,
        sipStopYear: years,
        withdrawalStartYear: years,
        inflation: { enabled: false, rate: 0 },
      },
      DEFAULT_INPUTS,
    ),
  );
}

/** Final corpus for a SIP scenario — used by the auto-generated SEO tables. */
export function corpusForStepUpSip(
  monthlySip: number,
  returnPct: number,
  years: number,
  config: StepUpConfig = FLAT,
): number {
  return project(monthlySip, returnPct, clampYears(years), config).summary.finalCorpus;
}

/**
 * Additional years a flat normal SIP would need (beyond the chosen duration) to
 * reach the step-up SIP's final corpus. Interpolated for a fractional answer.
 */
function computeYearsSaved(
  monthlySip: number,
  returnPct: number,
  years: number,
  targetCorpus: number,
): number {
  const extended = Math.min(years + 50, MAX_DURATION_YEARS);
  const rows = project(monthlySip, returnPct, extended, FLAT).yearly;
  for (let y = years; y <= extended; y += 1) {
    const corpusY = rows[y - 1].corpus;
    if (corpusY >= targetCorpus) {
      if (y === years) {
        return 0;
      }
      const corpusPrev = rows[y - 2].corpus;
      const frac = corpusY > corpusPrev ? (targetCorpus - corpusPrev) / (corpusY - corpusPrev) : 0;
      return Math.max(0, y - 1 + frac - years);
    }
  }
  return extended - years;
}

export interface StepUpSeriesPoint {
  year: number;
  normalCorpus: number;
  stepUpCorpus: number;
  difference: number;
  invested: number;
  wealthCreated: number;
  normalMonthlySip: number;
  stepUpMonthlySip: number;
}

export interface StepUpComparisonRow {
  year: number;
  monthlySip: number;
  annualInvestment: number;
  normalCorpus: number;
  stepUpCorpus: number;
  difference: number;
}

export interface StepUpResult {
  currency: Currency;
  durationYears: number;
  method: StepUpMethod;
  // Primary
  normalCorpus: number;
  stepUpCorpus: number;
  additionalWealthCreated: number;
  differenceInCorpus: number;
  totalInvested: number;
  totalGain: number;
  wealthMultiplier: number;
  // Unique ArthVeda outputs
  yearsSaved: number;
  equivalentSip: number;
  wealthAccelerationPct: number;
  extraWealthCreated: number;
  series: StepUpSeriesPoint[];
  comparison: StepUpComparisonRow[];
}

export function computeStepUp(inputs: StepUpInputs): StepUpResult {
  const years = clampYears(inputs.durationYears);
  const config = stepUpConfigFor(inputs);

  const normalProj = project(inputs.monthlySip, inputs.expectedReturnPct, years, FLAT);
  const stepUpProj = project(inputs.monthlySip, inputs.expectedReturnPct, years, config);

  const normalCorpus = normalProj.summary.finalCorpus;
  const stepUpCorpus = stepUpProj.summary.finalCorpus;
  const normalInvested = normalProj.summary.totalInvestment;
  const stepUpInvested = stepUpProj.summary.totalInvestment;
  const normalGain = normalCorpus - normalInvested;
  const stepUpGain = stepUpCorpus - stepUpInvested;

  const differenceInCorpus = stepUpCorpus - normalCorpus;
  const equivalentSip =
    normalCorpus > 0
      ? Math.round((inputs.monthlySip * stepUpCorpus) / normalCorpus / 50) * 50
      : 0;
  const wealthAccelerationPct = normalCorpus > 0 ? (stepUpCorpus / normalCorpus - 1) * 100 : 0;

  const series: StepUpSeriesPoint[] = [
    {
      year: 0,
      normalCorpus: 0,
      stepUpCorpus: 0,
      difference: 0,
      invested: 0,
      wealthCreated: 0,
      normalMonthlySip: inputs.monthlySip,
      stepUpMonthlySip: inputs.monthlySip,
    },
  ];
  const comparison: StepUpComparisonRow[] = [];
  for (let y = 1; y <= years; y += 1) {
    const nRow = normalProj.yearly[y - 1];
    const sRow = stepUpProj.yearly[y - 1];
    const stepUpMonthly = monthlySipForYear(inputs.monthlySip, y, config);
    series.push({
      year: y,
      normalCorpus: nRow.corpus,
      stepUpCorpus: sRow.corpus,
      difference: sRow.corpus - nRow.corpus,
      invested: sRow.totalInvested,
      wealthCreated: sRow.returns,
      normalMonthlySip: inputs.monthlySip,
      stepUpMonthlySip: stepUpMonthly,
    });
    comparison.push({
      year: y,
      monthlySip: stepUpMonthly,
      annualInvestment: stepUpMonthly * 12,
      normalCorpus: nRow.corpus,
      stepUpCorpus: sRow.corpus,
      difference: sRow.corpus - nRow.corpus,
    });
  }

  return {
    currency: STEPUP_CURRENCY,
    durationYears: years,
    method: inputs.method,
    normalCorpus,
    stepUpCorpus,
    additionalWealthCreated: stepUpGain - normalGain,
    differenceInCorpus,
    totalInvested: stepUpInvested,
    totalGain: stepUpGain,
    wealthMultiplier: stepUpInvested > 0 ? stepUpCorpus / stepUpInvested : 0,
    yearsSaved: computeYearsSaved(inputs.monthlySip, inputs.expectedReturnPct, years, stepUpCorpus),
    equivalentSip,
    wealthAccelerationPct,
    extraWealthCreated: differenceInCorpus,
    series,
    comparison,
  };
}

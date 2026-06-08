/**
 * Headline dashboard metrics derived from the ledger and yearly snapshots.
 *
 * Nominal metrics:
 *   - totalInvestment   = final cumulative invested (lumpsum + all SIPs)
 *   - corpusAtSipStop   = corpus at the end of sipStopYear
 *   - totalWithdrawn    = final cumulative withdrawn
 *   - finalCorpus       = corpus at the end of the final year
 *   - totalReturns      = finalCorpus + totalWithdrawn - totalInvestment
 *   - wealthMultiplier  = (finalCorpus + totalWithdrawn) / totalInvestment
 *
 * Inflation-adjusted metrics (present value at Year 0; null when disabled):
 *   - inflationAdjustedCorpus            = finalCorpus discounted by `duration` years
 *   - inflationAdjustedTotalWithdrawn    = each year's withdrawal discounted, summed
 *   - inflationAdjustedWealthMultiplier  = (realCorpus + realWithdrawn) / realInvested
 */

import { presentValue } from './inflation';
import { headlineMilestoneValue, firstYearReaching } from './milestones';
import type { MonthRow, ProjectionInputs, Summary, YearRow } from './types';

/** Safe division that returns 0 when the denominator is non-positive. */
function safeRatio(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

export function computeSummary(
  inputs: ProjectionInputs,
  monthly: MonthRow[],
  yearly: YearRow[],
): Summary {
  const finalRow = yearly[yearly.length - 1];
  const totalInvestment = finalRow.totalInvested;
  const totalWithdrawn = finalRow.totalWithdrawn;
  const finalCorpus = finalRow.corpus;
  const totalReturns = finalCorpus + totalWithdrawn - totalInvestment;
  const wealthMultiplier = safeRatio(finalCorpus + totalWithdrawn, totalInvestment);

  // Corpus at the end of sipStopYear (clamped to the available range for safety).
  const sipStopIndex = Math.min(Math.max(inputs.sipStopYear, 1), yearly.length) - 1;
  const corpusAtSipStop = yearly[sipStopIndex].corpus;

  const firstCroreYear = firstYearReaching(monthly, headlineMilestoneValue(inputs.currency));

  let inflationAdjustedCorpus: number | null = null;
  let inflationAdjustedTotalWithdrawn: number | null = null;
  let inflationAdjustedWealthMultiplier: number | null = null;

  if (inputs.inflation.enabled) {
    const rate = inputs.inflation.rate;

    inflationAdjustedCorpus = presentValue(finalCorpus, inputs.durationYears, rate);

    // Real invested: lumpsum at Year 0, plus each year's contributions discounted.
    let realInvested = inputs.lumpsum;
    let realWithdrawn = 0;
    for (const row of yearly) {
      realInvested += presentValue(row.sipAnnual, row.year, rate);
      realWithdrawn += presentValue(row.swpAnnual, row.year, rate);
    }

    inflationAdjustedTotalWithdrawn = realWithdrawn;
    inflationAdjustedWealthMultiplier = safeRatio(
      inflationAdjustedCorpus + realWithdrawn,
      realInvested,
    );
  }

  return {
    totalInvestment,
    corpusAtSipStop,
    totalWithdrawn,
    finalCorpus,
    totalReturns,
    wealthMultiplier,
    firstCroreYear,
    inflationAdjustedCorpus,
    inflationAdjustedTotalWithdrawn,
    inflationAdjustedWealthMultiplier,
  };
}

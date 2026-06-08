/**
 * The month-by-month simulation — the single source of truth for the engine.
 *
 * For each month, in order:
 *   1. (Month 1 only) inject the lumpsum.
 *   2. Apply the start-of-month flow for the phase:
 *        - accumulation: add the (stepped) SIP contribution
 *        - growth:       no flow
 *        - withdrawal:   subtract the (stepped) SWP, capped at the balance
 *   3. Apply that month's growth (annuity-due: contribute/withdraw, then grow).
 *
 * The corpus is floored at zero. If a withdrawal cannot be fully met, only the
 * remaining balance is paid out and the run is flagged as depleted.
 */

import { MONTHS_PER_YEAR } from './constants';
import { monthlyGrowthFactor } from './rates';
import { phaseOfYear, yearOfMonth } from './phases';
import { steppedAmount } from './stepUp';
import type { MonthRow, ProjectionInputs } from './types';

export interface LedgerResult {
  rows: MonthRow[];
  depleted: boolean;
  depletionMonth: number | null;
  depletionYear: number | null;
}

/**
 * Run the full monthly simulation for the given (already validated) inputs.
 */
export function runLedger(inputs: ProjectionInputs): LedgerResult {
  const totalMonths = inputs.durationYears * MONTHS_PER_YEAR;

  const withdrawalEnabled = inputs.mode === 'income';
  const accumulationFactor = monthlyGrowthFactor(inputs.annualReturnRate);
  const withdrawalFactor = monthlyGrowthFactor(inputs.withdrawalReturnRate);

  const rows: MonthRow[] = new Array<MonthRow>(totalMonths);

  let corpus = 0;
  let totalInvested = 0;
  let totalWithdrawn = 0;
  let depleted = false;
  let depletionMonth: number | null = null;
  let depletionYear: number | null = null;

  for (let month = 1; month <= totalMonths; month += 1) {
    const year = yearOfMonth(month);
    const phase = phaseOfYear(
      year,
      inputs.sipStopYear,
      inputs.withdrawalStartYear,
      withdrawalEnabled,
    );

    let sip = 0;
    let swp = 0;
    let lumpsum = 0;

    // 1. Initial lumpsum, before any other flow, in the very first month.
    if (month === 1 && inputs.lumpsum > 0) {
      lumpsum = inputs.lumpsum;
      corpus += lumpsum;
      totalInvested += lumpsum;
    }

    // 2. Phase flow, then 3. growth.
    if (phase === 'accumulation') {
      const stepIndex = year - 1;
      sip = steppedAmount(inputs.monthlySip, stepIndex, inputs.sipStepUp);
      corpus += sip;
      totalInvested += sip;
      corpus *= accumulationFactor;
    } else if (phase === 'growth') {
      corpus *= accumulationFactor;
    } else {
      // Withdrawal phase.
      const stepIndex = year - inputs.withdrawalStartYear;
      const demand = steppedAmount(inputs.monthlySwp, stepIndex, inputs.swpStepUp);
      const paid = Math.min(demand, corpus);
      swp = paid;
      corpus -= paid;
      totalWithdrawn += paid;

      if (!depleted && demand > 0 && paid < demand) {
        depleted = true;
        depletionMonth = month;
        depletionYear = year;
      }

      corpus *= withdrawalFactor;
    }

    // Numerical safety: never report a negative or non-finite corpus.
    if (!Number.isFinite(corpus) || corpus < 0) {
      corpus = corpus < 0 ? 0 : corpus;
    }

    const returns = corpus + totalWithdrawn - totalInvested;

    rows[month - 1] = {
      month,
      year,
      phase,
      sip,
      swp,
      lumpsum,
      corpus,
      totalInvested,
      totalWithdrawn,
      returns,
    };
  }

  return { rows, depleted, depletionMonth, depletionYear };
}

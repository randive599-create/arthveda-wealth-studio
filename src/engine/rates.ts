/**
 * Rate conversion utilities.
 *
 * The entire engine compounds monthly. An annual nominal rate is converted to
 * its equivalent monthly rate such that twelve months of compounding reproduce
 * the annual rate exactly:
 *
 *   monthlyRate = (1 + annualRate / 100) ^ (1 / 12) - 1
 */

import { MONTHS_PER_YEAR } from './constants';

/**
 * Convert an annual nominal rate (in percent) to its equivalent monthly growth
 * factor component. A rate of 0 returns 0.
 *
 * @param annualRatePercent annual rate, e.g. 12 for 12%.
 * @returns the per-month rate as a decimal (e.g. ~0.009489 for 12%).
 */
export function monthlyRate(annualRatePercent: number): number {
  if (annualRatePercent === 0) {
    return 0;
  }
  return Math.pow(1 + annualRatePercent / 100, 1 / MONTHS_PER_YEAR) - 1;
}

/**
 * The monthly growth multiplier, i.e. `1 + monthlyRate(annualRatePercent)`.
 * Multiplying a balance by this value advances it one month.
 */
export function monthlyGrowthFactor(annualRatePercent: number): number {
  return 1 + monthlyRate(annualRatePercent);
}

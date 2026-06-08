/**
 * Annual step-up calculation for SIP contributions and SWP withdrawals.
 *
 * Step-ups apply at the start of a year: the increased amount is effective from
 * the first contribution/withdrawal of the new year. The amount for a given
 * year is therefore a function of the base amount and the number of completed
 * step-ups (`stepIndex`) since the base year.
 *
 *   percentage: amount = base * (1 + percentage/100) ^ stepIndex
 *   fixed:      amount = base + amount * stepIndex
 *
 * Examples (base 25,000):
 *   stepIndex 0 -> 25,000
 *   stepIndex 1 -> 27,500  (10% step-up) or base + flat amount (fixed)
 */

import type { StepUpConfig } from './types';

/**
 * Compute the per-period amount for a given step index.
 *
 * @param base the base amount for step index 0 (must be >= 0).
 * @param stepIndex number of annual step-ups applied (0 for the base year).
 * @param config the step-up configuration.
 * @returns the stepped amount, never negative.
 */
export function steppedAmount(base: number, stepIndex: number, config: StepUpConfig): number {
  if (base <= 0 || stepIndex < 0) {
    return Math.max(0, base);
  }

  if (config.method === 'percentage') {
    const factor = Math.pow(1 + config.percentage / 100, stepIndex);
    return Math.max(0, base * factor);
  }

  // Fixed-amount step-up.
  return Math.max(0, base + config.amount * stepIndex);
}

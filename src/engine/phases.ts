/**
 * Phase resolution.
 *
 * A projection has three sequential phases, determined per calendar year:
 *
 *   - Accumulation: year <= sipStopYear            (SIP contributions, growth rate)
 *   - Growth:       sipStopYear < year < withdrawalStartYear (compounding only)
 *   - Withdrawal:   year >= withdrawalStartYear     (SWP withdrawals, withdrawal rate)
 *
 * Withdrawal takes precedence where the boundaries meet. This makes the edge
 * case `withdrawalStartYear === sipStopYear` well-defined: that shared year is a
 * withdrawal year and the growth phase has zero length.
 *
 * In "No Withdrawal" mode (`withdrawalEnabled = false`), the withdrawal phase is
 * never entered: no year is reserved for withdrawals, so SIP runs through
 * `sipStopYear` (which may be the full horizon) and the corpus then compounds.
 */

import { MONTHS_PER_YEAR } from './constants';
import type { Phase } from './types';

/** Convert a 1-based month index to its 1-based calendar year. */
export function yearOfMonth(month: number): number {
  return Math.ceil(month / MONTHS_PER_YEAR);
}

/** True when `month` is the first month of a calendar year (1, 13, 25, ...). */
export function isStartOfYear(month: number): boolean {
  return (month - 1) % MONTHS_PER_YEAR === 0;
}

/**
 * Resolve the phase for a given calendar year. Withdrawal is evaluated first so
 * that it wins any overlap with accumulation. When `withdrawalEnabled` is false
 * the withdrawal phase is never returned (No Withdrawal mode).
 */
export function phaseOfYear(
  year: number,
  sipStopYear: number,
  withdrawalStartYear: number,
  withdrawalEnabled = true,
): Phase {
  if (withdrawalEnabled && year >= withdrawalStartYear) {
    return 'withdrawal';
  }
  if (year <= sipStopYear) {
    return 'accumulation';
  }
  return 'growth';
}

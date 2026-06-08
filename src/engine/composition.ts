/**
 * Wealth composition: the split between invested capital and the returns
 * generated through compounding.
 *
 * Gross value created = investedCapital + returnsGenerated. The donut and the
 * "XX% of projected wealth comes from compounding" insight are derived from
 * `returnsPercentage`.
 */

import type { Composition } from './types';

/**
 * Compute the composition from total invested capital and total returns.
 *
 * @param totalInvestment total capital invested (lumpsum + all SIPs).
 * @param totalReturns total returns (`finalCorpus + totalWithdrawn - totalInvestment`);
 *   may be negative in adverse scenarios and is floored at 0 for display.
 */
export function computeComposition(totalInvestment: number, totalReturns: number): Composition {
  const investedCapital = Math.max(0, totalInvestment);
  const returnsGenerated = Math.max(0, totalReturns);
  const totalValue = investedCapital + returnsGenerated;
  const returnsPercentage = totalValue > 0 ? (returnsGenerated / totalValue) * 100 : 0;

  return {
    investedCapital,
    returnsGenerated,
    totalValue,
    returnsPercentage,
  };
}

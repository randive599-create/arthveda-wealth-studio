/**
 * Inflation adjustment via present-value (Year 0) deflation.
 *
 *   realValue = futureValue / (1 + inflationRate/100) ^ years
 *
 * A year-end figure for calendar year `y` is discounted by `y` years. Lumpsum
 * (invested at Year 0) is discounted by 0 years.
 */

import type { InflationYear, YearRow } from './types';

/**
 * Deflate a future nominal value to its present value at Year 0.
 *
 * @param nominal the nominal (future) value.
 * @param years the number of years from Year 0.
 * @param ratePercent the annual inflation rate in percent.
 */
export function presentValue(nominal: number, years: number, ratePercent: number): number {
  if (ratePercent === 0) {
    return nominal;
  }
  return nominal / Math.pow(1 + ratePercent / 100, years);
}

/**
 * Build the per-year inflation-adjusted series from the yearly snapshots.
 */
export function buildInflationSeries(yearly: YearRow[], ratePercent: number): InflationYear[] {
  return yearly.map((row) => ({
    year: row.year,
    nominalCorpus: row.corpus,
    realCorpus: presentValue(row.corpus, row.year, ratePercent),
    nominalWithdrawal: row.swpAnnual,
    realWithdrawal: presentValue(row.swpAnnual, row.year, ratePercent),
  }));
}

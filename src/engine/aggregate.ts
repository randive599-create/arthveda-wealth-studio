/**
 * Aggregate the monthly ledger into year-end snapshots.
 *
 * Each calendar year contains exactly `MONTHS_PER_YEAR` months (the horizon is
 * always a whole number of years), so a year's snapshot is taken from its final
 * month, with per-year flow totals summed across the year's months.
 */

import { MONTHS_PER_YEAR } from './constants';
import type { MonthRow, YearRow } from './types';

/**
 * Convert a monthly ledger into an array of year-end rows, ordered by year.
 */
export function aggregateYearly(rows: MonthRow[]): YearRow[] {
  if (rows.length === 0) {
    return [];
  }

  const totalYears = Math.ceil(rows.length / MONTHS_PER_YEAR);
  const yearly: YearRow[] = new Array<YearRow>(totalYears);

  for (let yearIndex = 0; yearIndex < totalYears; yearIndex += 1) {
    const year = yearIndex + 1;
    const startMonth = yearIndex * MONTHS_PER_YEAR;
    const endMonth = Math.min(startMonth + MONTHS_PER_YEAR, rows.length);

    let sipAnnual = 0;
    let swpAnnual = 0;
    for (let i = startMonth; i < endMonth; i += 1) {
      const row = rows[i];
      sipAnnual += row.sip;
      swpAnnual += row.swp;
    }

    const last = rows[endMonth - 1];

    yearly[yearIndex] = {
      year,
      phase: last.phase,
      sipAnnual,
      swpAnnual,
      totalInvested: last.totalInvested,
      totalWithdrawn: last.totalWithdrawn,
      returns: last.returns,
      corpus: last.corpus,
    };
  }

  return yearly;
}

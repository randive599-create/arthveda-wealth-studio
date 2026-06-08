/**
 * Currency-aware wealth milestone detection.
 *
 *   - INR:      ₹10 Lakh, ₹25 Lakh, ₹50 Lakh, ₹1 Crore, ₹5 Crore, ₹10 Crore,
 *               ₹25 Crore, ₹50 Crore, ₹100 Crore
 *               (section title: "Crorepati Countdown")
 *   - USD:      $100K, $250K, $500K, $1M, $5M, $10M, $25M
 *   - EUR:      €100K, €250K, €500K, €1M, €5M, €10M, €25M
 *               (section title: "Milestone Countdown")
 *
 * Only milestones actually reached within the projection horizon are returned.
 * Detection uses the monthly ledger for precision.
 */

import { yearOfMonth } from './phases';
import type { Currency, Milestone, MonthRow } from './types';

interface MilestoneTier {
  value: number;
  label: string;
}

const INR_TIERS: readonly MilestoneTier[] = [
  { value: 1_000_000, label: '₹10 Lakh' },
  { value: 2_500_000, label: '₹25 Lakh' },
  { value: 5_000_000, label: '₹50 Lakh' },
  { value: 10_000_000, label: '₹1 Crore' },
  { value: 50_000_000, label: '₹5 Crore' },
  { value: 100_000_000, label: '₹10 Crore' },
  { value: 250_000_000, label: '₹25 Crore' },
  { value: 500_000_000, label: '₹50 Crore' },
  { value: 1_000_000_000, label: '₹100 Crore' },
] as const;

const USD_TIERS: readonly MilestoneTier[] = [
  { value: 100_000, label: '$100K' },
  { value: 250_000, label: '$250K' },
  { value: 500_000, label: '$500K' },
  { value: 1_000_000, label: '$1M' },
  { value: 5_000_000, label: '$5M' },
  { value: 10_000_000, label: '$10M' },
  { value: 25_000_000, label: '$25M' },
] as const;

const EUR_TIERS: readonly MilestoneTier[] = [
  { value: 100_000, label: '€100K' },
  { value: 250_000, label: '€250K' },
  { value: 500_000, label: '€500K' },
  { value: 1_000_000, label: '€1M' },
  { value: 5_000_000, label: '€5M' },
  { value: 10_000_000, label: '€10M' },
  { value: 25_000_000, label: '€25M' },
] as const;

/** The milestone tier table for a currency. */
function tiersFor(currency: Currency): readonly MilestoneTier[] {
  switch (currency) {
    case 'INR':
      return INR_TIERS;
    case 'USD':
      return USD_TIERS;
    case 'EUR':
      return EUR_TIERS;
  }
}

/** The headline ("first crore") threshold used by the summary: ₹1 Crore for INR, 1M otherwise. */
export function headlineMilestoneValue(currency: Currency): number {
  return currency === 'INR' ? 10_000_000 : 1_000_000;
}

/** Section title that adapts to the active currency. */
export function milestoneTitle(currency: Currency): string {
  return currency === 'INR' ? 'Crorepati Countdown' : 'Milestone Countdown';
}

/**
 * Find the 1-based month at which `corpus` first reaches `threshold`, or null.
 * Rows are ordered by month, but the corpus is not necessarily monotonic (it
 * can fall during withdrawals), so we scan for the first crossing.
 */
export function firstMonthReaching(rows: MonthRow[], threshold: number): number | null {
  for (const row of rows) {
    if (row.corpus >= threshold) {
      return row.month;
    }
  }
  return null;
}

/**
 * The calendar year at which `corpus` first reaches `threshold`, or null.
 */
export function firstYearReaching(rows: MonthRow[], threshold: number): number | null {
  const month = firstMonthReaching(rows, threshold);
  return month === null ? null : yearOfMonth(month);
}

/**
 * Detect all achieved milestones for the given currency, in ascending order of
 * threshold value.
 */
export function detectMilestones(rows: MonthRow[], currency: Currency): Milestone[] {
  const achieved: Milestone[] = [];

  for (const tier of tiersFor(currency)) {
    const month = firstMonthReaching(rows, tier.value);
    if (month === null) {
      continue;
    }
    const reachedYear = yearOfMonth(month);
    achieved.push({
      value: tier.value,
      label: tier.label,
      reachedMonth: month,
      reachedYear,
      yearsRemaining: reachedYear,
      corpusAtAchievement: rows[month - 1].corpus,
    });
  }

  return achieved;
}

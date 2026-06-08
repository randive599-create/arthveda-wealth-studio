/**
 * Hard limits, ranges, and defaults for the projection engine.
 *
 * These are the single source of truth for validation (`state/schema.ts`) and
 * for UI control bounds. Keep them free of any logic.
 */

import type { Currency } from './types';

/** Number of compounding periods per year. */
export const MONTHS_PER_YEAR = 12;

/** Investment-return rate bounds (percent). */
export const MIN_RETURN_RATE = 0;
export const MAX_RETURN_RATE = 100;

/** Projection horizon bounds (whole years). */
export const MIN_DURATION_YEARS = 1;
export const MAX_DURATION_YEARS = 100;

/** Year-index bounds for SIP stop and withdrawal start. */
export const MIN_YEAR_INDEX = 1;

/** Inflation rate bounds (percent). */
export const MIN_INFLATION_RATE = 0;
export const MAX_INFLATION_RATE = 20;
export const DEFAULT_INFLATION_RATE = 6;

/** Step-up bounds. */
export const MIN_STEPUP_PERCENT = 0;
export const MAX_STEPUP_PERCENT = 100;
export const MIN_STEPUP_AMOUNT = 0;
/** Upper guard for a fixed step-up amount, to keep clamped values finite and sane. */
export const MAX_STEPUP_AMOUNT_GUARD = Number.MAX_SAFE_INTEGER;

/** Minimum allowed monetary input (no negative money). */
export const MIN_MONEY = 0;

/** The set of supported currencies. */
export const SUPPORTED_CURRENCIES: readonly Currency[] = ['INR', 'USD', 'EUR'] as const;

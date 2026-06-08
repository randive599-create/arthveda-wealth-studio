/**
 * Currency-aware formatting via the platform `Intl.NumberFormat`.
 *
 * Every monetary value rendered anywhere in the studio (dashboard, charts,
 * tooltips, tables, reports) flows through these helpers so the active currency
 * is reflected instantly and consistently. Formatters are memoized per currency
 * because constructing `Intl.NumberFormat` is comparatively expensive.
 */

import type { Currency } from '../engine/types';

/** Locale chosen per currency so grouping matches local convention (e.g. INR lakh/crore grouping). */
const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'en-IE',
};

/** The currency symbol used in compact/inline contexts. */
export const CURRENCY_SYMBOL: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

const fullCache = new Map<Currency, Intl.NumberFormat>();
const compactCache = new Map<Currency, Intl.NumberFormat>();

function fullFormatter(currency: Currency): Intl.NumberFormat {
  let fmt = fullCache.get(currency);
  if (!fmt) {
    fmt = new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    fullCache.set(currency, fmt);
  }
  return fmt;
}

function compactFormatter(currency: Currency): Intl.NumberFormat {
  let fmt = compactCache.get(currency);
  if (!fmt) {
    fmt = new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 2,
    });
    compactCache.set(currency, fmt);
  }
  return fmt;
}

/** Guard non-finite engine output so the UI never prints "NaN"/"Infinity". */
function safe(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/**
 * Format a value as whole-unit currency, e.g. `₹1,23,45,678` / `$1,234,567`.
 */
export function formatCurrency(value: number, currency: Currency): string {
  return fullFormatter(currency).format(Math.round(safe(value)));
}

/**
 * Format a value in compact notation, e.g. `₹1.23Cr` / `$1.23M`. Useful for
 * chart axes and tight card subtitles.
 */
export function formatCompactCurrency(value: number, currency: Currency): string {
  return compactFormatter(currency).format(safe(value));
}

/**
 * Format a multiplier as `4.65x`. Non-finite inputs render as `0.00x`.
 */
export function formatMultiplier(value: number): string {
  return `${safe(value).toFixed(2)}x`;
}

/**
 * Format a 0–100 percentage as `78.5%`.
 */
export function formatPercent(value: number, fractionDigits = 1): string {
  return `${safe(value).toFixed(fractionDigits)}%`;
}

/**
 * Per-currency UI scales for the monetary sliders. INR plans are typically
 * denominated in much larger nominal figures than USD/EUR, so slider ceilings
 * and step sizes are scaled accordingly. These bound the slider only — the
 * number input and the store clamp authoritatively, so users can still type
 * larger values where the schema permits.
 */
export interface MoneyScale {
  lumpsumMax: number;
  sipMax: number;
  swpMax: number;
  stepAmountMax: number;
  moneyStep: number;
  stepAmountStep: number;
}

const INR_SCALE: MoneyScale = {
  lumpsumMax: 100_000_000,
  sipMax: 1_000_000,
  swpMax: 2_000_000,
  stepAmountMax: 500_000,
  moneyStep: 5_000,
  stepAmountStep: 1_000,
};

const WESTERN_SCALE: MoneyScale = {
  lumpsumMax: 2_000_000,
  sipMax: 50_000,
  swpMax: 100_000,
  stepAmountMax: 25_000,
  moneyStep: 100,
  stepAmountStep: 100,
};

export function moneyScale(currency: Currency): MoneyScale {
  return currency === 'INR' ? INR_SCALE : WESTERN_SCALE;
}

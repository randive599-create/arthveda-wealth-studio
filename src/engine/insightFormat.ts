/**
 * Minimal, self-contained currency formatting for insight copy.
 *
 * The engine is intentionally free of UI dependencies, so it cannot import the
 * application's `format/currency` module. Insight explanations need a compact,
 * human-readable money string, which this helper provides via the platform
 * `Intl.NumberFormat`. It mirrors the locale choices used in the UI layer.
 */

import type { Currency } from './types';

const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'en-IE',
};

/** Format a value as whole-unit currency, e.g. `₹1,23,45,678` / `$1,234,567`. */
export function formatInsightCurrency(value: number, currency: Currency): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(safe));
}

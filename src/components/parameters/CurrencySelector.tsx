/**
 * CurrencySelector — chooses the active currency (INR / USD / EUR). Rendered as
 * a native <select> for full keyboard and mobile support; changing it updates
 * the store, which re-formats every value in the studio instantly and switches
 * the milestone vocabulary (Crorepati vs Milestone).
 */

import { useId } from 'react';
import { SUPPORTED_CURRENCIES } from '../../engine/constants';
import type { Currency } from '../../engine/types';
import { CURRENCY_SYMBOL } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';

const CURRENCY_LABEL: Record<Currency, string> = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
};

export interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        Currency
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
        data-testid={TESTIDS.currencySelector}
        className="
          rounded-[var(--radius-control)] border border-hairline bg-canvas px-3 py-1.5
          font-mono text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent
        "
      >
        {SUPPORTED_CURRENCIES.map((currency) => (
          <option key={currency} value={currency}>
            {CURRENCY_SYMBOL[currency]} {currency} — {CURRENCY_LABEL[currency]}
          </option>
        ))}
      </select>
    </div>
  );
}

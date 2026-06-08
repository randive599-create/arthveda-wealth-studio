/**
 * Custom tooltip for the Wealth Mountain chart.
 *
 * Institutional styling: white surface, hairline border, monospace figures.
 * Shows the year, corpus, invested capital, and returns at the hovered point,
 * plus the lifecycle phase. All values are currency-formatted.
 */

import type { TooltipProps } from 'recharts';
import type { Currency, Phase } from '../../engine/types';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { CHART_COLORS } from './chartTheme';

const PHASE_LABEL: Record<Phase, string> = {
  accumulation: 'Accumulation',
  growth: 'Growth',
  withdrawal: 'Withdrawal',
};

export interface MountainDatum {
  year: number;
  corpus: number;
  invested: number;
  returns: number;
  phase: Phase;
}

interface Row {
  label: string;
  value: string;
  swatch?: string;
}

export function WealthMountainTooltip({
  active,
  payload,
  currency,
}: TooltipProps<number, string> & { currency: Currency }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const datum = payload[0]?.payload as MountainDatum | undefined;
  if (!datum) {
    return null;
  }

  const rows: Row[] = [
    { label: 'Corpus', value: formatCurrency(datum.corpus, currency), swatch: CHART_COLORS.accent },
    {
      label: 'Invested',
      value: formatCurrency(datum.invested, currency),
      swatch: CHART_COLORS.invested,
    },
    {
      label: 'Returns',
      value: formatCurrency(datum.returns, currency),
      swatch: CHART_COLORS.returns,
    },
  ];

  return (
    <div
      data-testid={TESTIDS.wealthMountainTooltip}
      className="min-w-[180px] rounded-[var(--radius-control)] border border-hairline bg-canvas p-3 shadow-none"
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink">
          Year {datum.year}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
          {PHASE_LABEL[datum.phase]}
        </span>
      </div>
      <dl className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-6">
            <dt className="flex items-center gap-1.5 text-xs text-ink-secondary">
              {row.swatch ? (
                <span
                  className="inline-block h-2 w-2 rounded-[2px]"
                  style={{ backgroundColor: row.swatch }}
                  aria-hidden="true"
                />
              ) : null}
              {row.label}
            </dt>
            <dd className="font-mono text-xs font-semibold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

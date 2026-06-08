/**
 * Wealth Composition Donut.
 *
 * Splits the gross projected value into Invested Capital vs. Wealth Generated
 * Through Returns. The donut center carries the headline compounding share; a
 * breakdown beneath lists both figures, followed by the institutional insight
 * line: "XX% of projected wealth comes from compounding."
 *
 * Sourced from the engine's `composition` derivation via a scoped selector, so
 * it is always consistent with the dashboard and the mountain chart.
 */

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useStudioStore } from '../../state/useStudioStore';
import { selectComposition, selectCurrency } from '../../state/selectors';
import { formatCurrency, formatPercent } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { ChartFrame } from './ChartFrame';
import { CHART_COLORS } from './chartTheme';

interface Segment {
  key: 'invested' | 'returns';
  label: string;
  value: number;
  color: string;
}

export function WealthDonut() {
  const composition = useStudioStore(selectComposition);
  const currency = useStudioStore(selectCurrency);

  const segments = useMemo<Segment[]>(
    () => [
      {
        key: 'invested',
        label: 'Invested Capital',
        value: composition.investedCapital,
        color: CHART_COLORS.invested,
      },
      {
        key: 'returns',
        label: 'Investment Returns',
        value: composition.returnsGenerated,
        color: CHART_COLORS.returns,
      },
    ],
    [composition],
  );

  const hasValue = composition.totalValue > 0;
  const returnsPct = formatPercent(composition.returnsPercentage);

  return (
    <ChartFrame
      eyebrow="Secondary Visualization"
      title="Wealth Composition"
      description="How much of the projected wealth is your capital versus returns generated through compounding."
      testId={TESTIDS.wealthDonut}
    >
      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
        {/* Donut with centered headline */}
        <div className="relative mx-auto h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={hasValue ? segments : [{ key: 'empty', label: 'No value', value: 1, color: CHART_COLORS.hairline }]}
                dataKey="value"
                nameKey="label"
                innerRadius={64}
                outerRadius={92}
                startAngle={90}
                endAngle={-270}
                stroke={CHART_COLORS.canvas}
                strokeWidth={2}
                isAnimationActive={false}
              >
                {(hasValue ? segments : [{ key: 'empty', color: CHART_COLORS.hairline }]).map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-semibold text-ink">{returnsPct}</span>
            <span className="mt-0.5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-secondary">
              From Compounding
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <dl className="space-y-3">
          <div className="flex items-center justify-between gap-4" data-testid={TESTIDS.compositionInvested}>
            <dt className="flex items-center gap-2 text-sm text-ink-secondary">
              <span
                className="inline-block h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: CHART_COLORS.invested }}
                aria-hidden="true"
              />
              Invested Capital
            </dt>
            <dd className="font-mono text-sm font-semibold text-ink">
              {formatCurrency(composition.investedCapital, currency)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4" data-testid={TESTIDS.compositionReturns}>
            <dt className="flex items-center gap-2 text-sm text-ink-secondary">
              <span
                className="inline-block h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: CHART_COLORS.returns }}
                aria-hidden="true"
              />
              Investment Returns
            </dt>
            <dd className="font-mono text-sm font-semibold text-ink">
              {formatCurrency(composition.returnsGenerated, currency)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-hairline pt-3">
            <dt className="text-sm font-medium text-ink">Total Value</dt>
            <dd className="font-mono text-sm font-semibold text-ink">
              {formatCurrency(composition.totalValue, currency)}
            </dd>
          </div>
        </dl>
      </div>

      <p
        className="mt-6 border-t border-hairline pt-4 text-sm leading-relaxed text-ink-secondary"
        data-testid={TESTIDS.compositionInsight}
      >
        <span className="font-semibold text-accent">{returnsPct}</span> of projected wealth comes
        from compounding.
      </p>
    </ChartFrame>
  );
}

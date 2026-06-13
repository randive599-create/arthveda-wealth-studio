/**
 * SWP chart — the Corpus Depletion Curve.
 *
 * Plots the projected corpus balance year by year as it is drawn down (or
 * sustained) by the withdrawals, built on the existing chart library (Recharts)
 * and shared chart theme/frame. When the corpus is exhausted before the end of
 * the term, a reference line marks the depletion year.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartFrame } from '../../components/charts/ChartFrame';
import { AXIS_TICK, CHART_COLORS } from '../../components/charts/chartTheme';
import { formatCompactCurrency, formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import type { SwpResult } from './swpModel';

export interface SwpChartProps {
  result: SwpResult;
}

export function SwpChart({ result }: SwpChartProps) {
  const { currency, series, depleted, longevityMonths } = result;
  const moneyAxis = (value: number) => formatCompactCurrency(value, currency);
  const depletionYear = depleted ? Math.round((longevityMonths / 12) * 10) / 10 : null;

  return (
    <ChartFrame
      eyebrow="Visualization"
      title="Corpus Depletion Curve"
      description="Your projected corpus balance over the withdrawal term. A falling curve means withdrawals outpace returns; a rising curve means the corpus keeps growing."
      testId={TESTIDS.swpChart('depletion')}
    >
      <div className="h-[300px] w-full sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="year"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.hairline }}
              minTickGap={24}
              tickFormatter={(year: number) => `Y${year}`}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={moneyAxis}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value, currency), 'Corpus']}
              labelFormatter={(year: number | string) => `Year ${year}`}
              contentStyle={{
                fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                fontSize: 12,
                borderRadius: 8,
                border: `1px solid ${CHART_COLORS.hairline}`,
              }}
            />
            {depletionYear !== null ? (
              <ReferenceLine
                x={Math.ceil(longevityMonths / 12)}
                stroke={CHART_COLORS.inkSecondary}
                strokeDasharray="4 4"
                label={{
                  value: `Depletes ~Y${depletionYear}`,
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: CHART_COLORS.inkSecondary,
                }}
              />
            ) : null}
            <Area
              type="monotone"
              dataKey="corpus"
              stroke={CHART_COLORS.accent}
              strokeWidth={2}
              fill={CHART_COLORS.accent}
              fillOpacity={0.1}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

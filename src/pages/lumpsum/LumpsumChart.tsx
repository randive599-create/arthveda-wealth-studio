/**
 * Lumpsum chart — the Investment Growth Curve.
 *
 * Plots the projected corpus year by year as the one-time investment compounds,
 * built on the existing chart library (Recharts) and shared chart theme/frame.
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
import type { LumpsumResult } from './lumpsumModel';

export interface LumpsumChartProps {
  result: LumpsumResult;
}

export function LumpsumChart({ result }: LumpsumChartProps) {
  const { currency, series, invested } = result;
  const moneyAxis = (value: number) => formatCompactCurrency(value, currency);

  return (
    <ChartFrame
      eyebrow="Visualization"
      title="Investment Growth Curve"
      description="How your one-time investment compounds into its final corpus over the full term."
      testId={TESTIDS.lumpsumChart('growth')}
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
            <ReferenceLine
              y={invested}
              stroke={CHART_COLORS.inkSecondary}
              strokeDasharray="4 4"
              label={{
                value: 'Invested',
                position: 'insideBottomRight',
                fontSize: 10,
                fill: CHART_COLORS.inkSecondary,
              }}
            />
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

/**
 * FIRE charts — three FIRE-specific visualizations built on the existing chart
 * library (Recharts) and shared chart theme/frame:
 *
 *   1. Corpus Growth          — projected corpus by age (area).
 *   2. FIRE Number Growth     — the inflation-adjusted FIRE number by age (line).
 *   3. Gap Analysis           — corpus vs. FIRE number overlaid; the crossover
 *                               is the point at which FIRE is reached.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartFrame } from '../../components/charts/ChartFrame';
import { AXIS_TICK, CHART_COLORS } from '../../components/charts/chartTheme';
import { formatCompactCurrency, formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import type { FireResult } from './fireModel';

export interface FireChartsProps {
  result: FireResult;
}

export function FireCharts({ result }: FireChartsProps) {
  const { currency, series } = result;
  const moneyAxis = (value: number) => formatCompactCurrency(value, currency);
  const tooltipFormatter = (value: number) => formatCurrency(value, currency);
  const labelFormatter = (age: number | string) => `Age ${age}`;
  const tooltipStyle = {
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    fontSize: 12,
    borderRadius: 8,
    border: `1px solid ${CHART_COLORS.hairline}`,
  } as const;

  return (
    <div className="space-y-8">
      {/* 1 — Corpus Growth */}
      <ChartFrame
        eyebrow="Visualization"
        title="Corpus Growth"
        description="Your projected investment corpus growing each year on the way to financial independence."
        testId={TESTIDS.fireChart('corpus')}
      >
        <div className="h-[280px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="age"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.hairline }}
                minTickGap={24}
                tickFormatter={(age: number) => `${age}`}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={moneyAxis}
              />
              <Tooltip
                formatter={(value: number) => [tooltipFormatter(value), 'Corpus']}
                labelFormatter={labelFormatter}
                contentStyle={tooltipStyle}
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

      {/* 2 — FIRE Number Growth (inflation-adjusted) */}
      <ChartFrame
        eyebrow="Visualization"
        title="FIRE Number Growth"
        description="The corpus you need to retire, rising each year as inflation lifts your future expenses."
        testId={TESTIDS.fireChart('fire-number')}
      >
        <div className="h-[280px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="age"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.hairline }}
                minTickGap={24}
                tickFormatter={(age: number) => `${age}`}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={moneyAxis}
              />
              <Tooltip
                formatter={(value: number) => [tooltipFormatter(value), 'FIRE Number']}
                labelFormatter={labelFormatter}
                contentStyle={tooltipStyle}
              />
              <Line
                type="monotone"
                dataKey="fireNumber"
                stroke={CHART_COLORS.inkSecondary}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>

      {/* 3 — Gap Analysis */}
      <ChartFrame
        eyebrow="Visualization"
        title="Gap Analysis"
        description="Corpus vs. FIRE number. Where the corpus area rises above the FIRE-number line, you have reached financial independence."
        testId={TESTIDS.fireChart('gap')}
      >
        <div className="h-[280px] w-full sm:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="age"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.hairline }}
                minTickGap={24}
                tickFormatter={(age: number) => `${age}`}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={moneyAxis}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  tooltipFormatter(value),
                  name === 'corpus' ? 'Projected Corpus' : 'FIRE Number',
                ]}
                labelFormatter={labelFormatter}
                contentStyle={tooltipStyle}
              />
              <Legend
                formatter={(value: string) =>
                  value === 'corpus' ? 'Projected Corpus' : 'FIRE Number'
                }
                wrapperStyle={{
                  fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="corpus"
                stroke={CHART_COLORS.accent}
                strokeWidth={2}
                fill={CHART_COLORS.accent}
                fillOpacity={0.12}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="fireNumber"
                stroke={CHART_COLORS.inkSecondary}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </div>
  );
}

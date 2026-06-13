/**
 * SIP charts — three SIP-specific visualizations built on the existing chart
 * library (Recharts) and shared chart theme/frame:
 *
 *   1. SIP Growth Curve              — projected corpus by year (area).
 *   2. Invested vs. Wealth Created   — invested capital and returns, stacked.
 *   3. Inflation-Adjusted Wealth     — nominal corpus vs. real (today's-money) corpus.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartFrame } from '../../components/charts/ChartFrame';
import { AXIS_TICK, CHART_COLORS } from '../../components/charts/chartTheme';
import { formatCompactCurrency, formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import type { SipResult } from './sipModel';

export interface SipChartsProps {
  result: SipResult;
}

export function SipCharts({ result }: SipChartsProps) {
  const { currency, series } = result;
  const moneyAxis = (value: number) => formatCompactCurrency(value, currency);
  const money = (value: number) => formatCurrency(value, currency);
  const labelFormatter = (year: number | string) => `Year ${year}`;
  const tooltipStyle = {
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    fontSize: 12,
    borderRadius: 8,
    border: `1px solid ${CHART_COLORS.hairline}`,
  } as const;
  const legendStyle = {
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    fontSize: 11,
  } as const;

  const xAxis = (
    <XAxis
      dataKey="year"
      tick={AXIS_TICK}
      tickLine={false}
      axisLine={{ stroke: CHART_COLORS.hairline }}
      minTickGap={24}
      tickFormatter={(year: number) => `Y${year}`}
    />
  );
  const yAxis = (
    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} tickFormatter={moneyAxis} />
  );

  return (
    <div className="space-y-8">
      {/* 1 — SIP Growth Curve */}
      <ChartFrame
        eyebrow="Visualization"
        title="SIP Growth Curve"
        description="How your SIP corpus compounds and grows year after year over the full horizon."
        testId={TESTIDS.sipChart('growth')}
      >
        <div className="h-[280px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              {xAxis}
              {yAxis}
              <Tooltip
                formatter={(value: number) => [money(value), 'Corpus']}
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

      {/* 2 — Invested vs. Wealth Created */}
      <ChartFrame
        eyebrow="Visualization"
        title="Invested Amount vs Wealth Created"
        description="Your own contributions (invested) and the returns they generate (wealth created), stacked to the total corpus."
        testId={TESTIDS.sipChart('invested-vs-wealth')}
      >
        <div className="h-[280px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              {xAxis}
              {yAxis}
              <Tooltip
                formatter={(value: number, name: string) => [
                  money(value),
                  name === 'invested' ? 'Invested' : 'Wealth Created',
                ]}
                labelFormatter={labelFormatter}
                contentStyle={tooltipStyle}
              />
              <Legend
                formatter={(value: string) => (value === 'invested' ? 'Invested' : 'Wealth Created')}
                wrapperStyle={legendStyle}
              />
              <Area
                type="monotone"
                dataKey="invested"
                stackId="sip"
                stroke={CHART_COLORS.inkSecondary}
                strokeWidth={2}
                fill={CHART_COLORS.inkSecondary}
                fillOpacity={0.18}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="gain"
                stackId="sip"
                stroke={CHART_COLORS.accent}
                strokeWidth={2}
                fill={CHART_COLORS.accent}
                fillOpacity={0.18}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>

      {/* 3 — Inflation-Adjusted Wealth Curve */}
      <ChartFrame
        eyebrow="Visualization"
        title="Inflation-Adjusted Wealth Curve"
        description="Your nominal corpus against its real (today's-money) value once inflation is taken into account."
        testId={TESTIDS.sipChart('inflation-adjusted')}
      >
        <div className="h-[280px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              {xAxis}
              {yAxis}
              <Tooltip
                formatter={(value: number, name: string) => [
                  money(value),
                  name === 'corpus' ? 'Nominal Corpus' : 'Real Corpus',
                ]}
                labelFormatter={labelFormatter}
                contentStyle={tooltipStyle}
              />
              <Legend
                formatter={(value: string) =>
                  value === 'corpus' ? 'Nominal Corpus' : 'Real Corpus'
                }
                wrapperStyle={legendStyle}
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
              <Line
                type="monotone"
                dataKey="realCorpus"
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

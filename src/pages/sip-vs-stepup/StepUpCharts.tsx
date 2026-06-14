/**
 * SIP vs Step-Up SIP charts (Recharts + shared theme/frame):
 *   1. Normal SIP vs Step-Up SIP Growth Curve (two lines)
 *   2. Corpus Difference Over Time (area of the gap)
 *   3. Invested Amount vs Wealth Created (stacked area, step-up scenario)
 *   4. Monthly SIP Progression Over Time (normal flat vs step-up rising)
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
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
import type { StepUpResult } from './stepUpModel';

export interface StepUpChartsProps {
  result: StepUpResult;
}

export function StepUpCharts({ result }: StepUpChartsProps) {
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
  const yAxisMoney = (
    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} tickFormatter={moneyAxis} />
  );

  return (
    <div className="space-y-8">
      {/* 1 — Normal vs Step-Up growth */}
      <ChartFrame
        eyebrow="Visualization"
        title="Normal SIP vs Step-Up SIP Growth"
        description="How each strategy's corpus compounds year by year. The gap is the extra wealth a step-up SIP creates."
        testId={TESTIDS.stepUpChart('growth')}
      >
        <div className="h-[280px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              {xAxis}
              {yAxisMoney}
              <Tooltip
                formatter={(value: number, name: string) => [
                  money(value),
                  name === 'stepUpCorpus' ? 'Step-Up SIP' : 'Normal SIP',
                ]}
                labelFormatter={labelFormatter}
                contentStyle={tooltipStyle}
              />
              <Legend
                formatter={(value: string) => (value === 'stepUpCorpus' ? 'Step-Up SIP' : 'Normal SIP')}
                wrapperStyle={legendStyle}
              />
              <Line
                type="monotone"
                dataKey="normalCorpus"
                stroke={CHART_COLORS.inkSecondary}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="stepUpCorpus"
                stroke={CHART_COLORS.accent}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>

      {/* 2 — Corpus difference over time */}
      <ChartFrame
        eyebrow="Visualization"
        title="Corpus Difference Over Time"
        description="The widening gap between the step-up and normal SIP corpus — the compounding advantage of stepping up."
        testId={TESTIDS.stepUpChart('difference')}
      >
        <div className="h-[280px] w-full sm:h-[330px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              {xAxis}
              {yAxisMoney}
              <Tooltip
                formatter={(value: number) => [money(value), 'Extra corpus']}
                labelFormatter={labelFormatter}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="difference"
                stroke={CHART_COLORS.accent}
                strokeWidth={2}
                fill={CHART_COLORS.accent}
                fillOpacity={0.12}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>

      {/* 3 — Invested vs wealth created (step-up) */}
      <ChartFrame
        eyebrow="Visualization"
        title="Invested Amount vs Wealth Created"
        description="Your step-up SIP contributions and the returns they generate, stacked to the total corpus."
        testId={TESTIDS.stepUpChart('invested-vs-wealth')}
      >
        <div className="h-[280px] w-full sm:h-[330px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              {xAxis}
              {yAxisMoney}
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
                stackId="s"
                stroke={CHART_COLORS.inkSecondary}
                strokeWidth={2}
                fill={CHART_COLORS.inkSecondary}
                fillOpacity={0.18}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="wealthCreated"
                stackId="s"
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

      {/* 4 — Monthly SIP progression */}
      <ChartFrame
        eyebrow="Visualization"
        title="Monthly SIP Progression Over Time"
        description="Your monthly SIP stays flat in a normal plan but rises every year in a step-up plan."
        testId={TESTIDS.stepUpChart('sip-progression')}
      >
        <div className="h-[280px] w-full sm:h-[330px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              {xAxis}
              {yAxisMoney}
              <Tooltip
                formatter={(value: number, name: string) => [
                  money(value),
                  name === 'stepUpMonthlySip' ? 'Step-Up SIP' : 'Normal SIP',
                ]}
                labelFormatter={labelFormatter}
                contentStyle={tooltipStyle}
              />
              <Legend
                formatter={(value: string) =>
                  value === 'stepUpMonthlySip' ? 'Step-Up SIP' : 'Normal SIP'
                }
                wrapperStyle={legendStyle}
              />
              <Line
                type="monotone"
                dataKey="normalMonthlySip"
                stroke={CHART_COLORS.inkSecondary}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="stepUpMonthlySip"
                stroke={CHART_COLORS.accent}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </div>
  );
}

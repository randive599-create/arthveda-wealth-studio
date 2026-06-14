/**
 * Retirement charts — three retirement-specific visualizations on the existing
 * chart library (Recharts) and shared chart theme/frame:
 *
 *   1. Corpus Accumulation — corpus growth from now until retirement age (area).
 *   2. Retirement Drawdown — corpus drawdown from retirement to life expectancy (area).
 *   3. Gap Analysis        — Required vs. Projected corpus at retirement (bars).
 */

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import type { RetirementResult } from './retirementModel';

export interface RetirementChartsProps {
  result: RetirementResult;
}

/** Risk colour (matches the design's risk-strong token) for the depletion case. */
const RISK = '#b91c1c';

export function RetirementCharts({ result }: RetirementChartsProps) {
  const { currency } = result;
  const moneyAxis = (value: number) => formatCompactCurrency(value, currency);
  const money = (value: number) => formatCurrency(value, currency);
  const ageLabel = (age: number | string) => `Age ${age}`;
  const tooltipStyle = {
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    fontSize: 12,
    borderRadius: 8,
    border: `1px solid ${CHART_COLORS.hairline}`,
  } as const;

  const gapData = [
    { name: 'Required', value: result.requiredCorpus },
    { name: 'Projected', value: result.projectedCorpus },
  ];

  return (
    <div className="space-y-8">
      {/* 1 — Corpus Accumulation */}
      <ChartFrame
        eyebrow="Visualization"
        title="Corpus Accumulation"
        description="How your corpus grows from today until your retirement age, before any withdrawals."
        testId={TESTIDS.retirementChart('accumulation')}
      >
        <div className="h-[280px] w-full sm:h-[330px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.accumulationSeries} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="age"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.hairline }}
                minTickGap={24}
                tickFormatter={(age: number) => `${age}`}
              />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} tickFormatter={moneyAxis} />
              <Tooltip
                formatter={(value: number) => [money(value), 'Corpus']}
                labelFormatter={ageLabel}
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

      {/* 2 — Retirement Drawdown */}
      <ChartFrame
        eyebrow="Visualization"
        title="Retirement Drawdown"
        description="How your corpus is drawn down through retirement as it funds your inflation-growing monthly income."
        testId={TESTIDS.retirementChart('drawdown')}
      >
        <div className="h-[280px] w-full sm:h-[330px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.drawdownSeries} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="age"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.hairline }}
                minTickGap={24}
                tickFormatter={(age: number) => `${age}`}
              />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} tickFormatter={moneyAxis} />
              <Tooltip
                formatter={(value: number) => [money(value), 'Corpus']}
                labelFormatter={ageLabel}
                contentStyle={tooltipStyle}
              />
              {!result.sustainable ? (
                <ReferenceLine
                  x={result.incomeSustainedToAge}
                  stroke={CHART_COLORS.inkSecondary}
                  strokeDasharray="4 4"
                  label={{
                    value: `Depletes age ${result.incomeSustainedToAge}`,
                    position: 'insideTopRight',
                    fontSize: 10,
                    fill: CHART_COLORS.inkSecondary,
                  }}
                />
              ) : null}
              <Area
                type="monotone"
                dataKey="corpus"
                stroke={result.sustainable ? CHART_COLORS.accent : RISK}
                strokeWidth={2}
                fill={result.sustainable ? CHART_COLORS.accent : RISK}
                fillOpacity={0.1}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>

      {/* 3 — Gap Analysis */}
      <ChartFrame
        eyebrow="Visualization"
        title="Gap Analysis"
        description="Your projected corpus against the corpus required at retirement. The difference is your wealth gap (or surplus)."
        testId={TESTIDS.retirementChart('gap')}
      >
        <div className="h-[280px] w-full sm:h-[330px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gapData} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={CHART_COLORS.hairline} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: CHART_COLORS.hairline }} />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} tickFormatter={moneyAxis} />
              <Tooltip
                formatter={(value: number) => [money(value), 'Corpus']}
                cursor={{ fill: 'transparent' }}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={120} isAnimationActive={false}>
                <Cell fill={CHART_COLORS.inkSecondary} />
                <Cell fill={result.sustainable ? CHART_COLORS.accent : RISK} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </div>
  );
}

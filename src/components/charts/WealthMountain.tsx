/**
 * Wealth Mountain — the hero visualization.
 *
 * A smooth, filled area chart of the year-end corpus across the entire horizon.
 * The compounding "acceleration" is emphasized two ways:
 *   1. A solid, low-opacity emerald area fill that grows visually with the
 *      corpus (no gradient, per the design system — a flat tint).
 *   2. Reference bands behind the accumulation / growth / withdrawal phases,
 *      so the curve's steepening is read against its lifecycle context.
 *
 * Data is derived from the yearly ledger via a memoized selector. The chart is
 * fully responsive through Recharts' ResponsiveContainer and currency-aware via
 * the active formatter.
 */

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStudioStore } from '../../state/useStudioStore';
import { selectCurrency, selectInputs, selectYearly } from '../../state/selectors';
import { formatCompactCurrency } from '../../format/currency';
import type { Phase } from '../../engine/types';
import { TESTIDS } from '../../lib/testids';
import { ChartFrame } from './ChartFrame';
import { AXIS_TICK, CHART_COLORS } from './chartTheme';
import { WealthMountainTooltip, type MountainDatum } from './WealthMountainTooltip';

interface PhaseBand {
  start: number;
  end: number;
  phase: Phase;
}

/** Collapse the yearly phase sequence into contiguous bands for ReferenceArea shading. */
function computePhaseBands(rows: { year: number; phase: Phase }[]): PhaseBand[] {
  const bands: PhaseBand[] = [];
  for (const row of rows) {
    const last = bands[bands.length - 1];
    if (last && last.phase === row.phase) {
      last.end = row.year;
    } else {
      bands.push({ start: row.year, end: row.year, phase: row.phase });
    }
  }
  return bands;
}

const PHASE_FILL: Record<Phase, string> = {
  accumulation: '#f9fafb',
  growth: '#f3f4f6',
  withdrawal: '#ecfdf5',
};

const PHASE_LABEL: Record<Phase, string> = {
  accumulation: 'Accumulation',
  growth: 'Growth',
  withdrawal: 'Withdrawal',
};

export function WealthMountain() {
  const yearly = useStudioStore(selectYearly);
  const currency = useStudioStore(selectCurrency);
  const inputs = useStudioStore(selectInputs);

  const data = useMemo<MountainDatum[]>(
    () =>
      yearly.map((row) => ({
        year: row.year,
        corpus: Math.max(0, row.corpus),
        invested: row.totalInvested,
        returns: Math.max(0, row.returns),
        phase: row.phase,
      })),
    [yearly],
  );

  const bands = useMemo(() => computePhaseBands(yearly), [yearly]);

  // Show every band that exists; legend only lists phases actually present.
  const presentPhases = useMemo(() => {
    const seen = new Set<Phase>();
    for (const b of bands) {
      seen.add(b.phase);
    }
    return Array.from(seen);
  }, [bands]);

  const legend = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {presentPhases.map((phase) => (
        <span key={phase} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-[2px] border border-hairline"
            style={{ backgroundColor: PHASE_FILL[phase] }}
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-secondary">
            {PHASE_LABEL[phase]}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <ChartFrame
      eyebrow="Primary Visualization"
      title="Wealth Mountain"
      description="Projected corpus across every stage of the journey. The curve steepens as compounding accelerates."
      aside={legend}
      testId={TESTIDS.wealthMountain}
    >
      <div className="h-[280px] w-full sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
            {bands.map((band) => (
              <ReferenceArea
                key={`${band.phase}-${band.start}`}
                x1={band.start}
                x2={band.end}
                fill={PHASE_FILL[band.phase]}
                fillOpacity={1}
                stroke="none"
                ifOverflow="extendDomain"
              />
            ))}

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
              tickFormatter={(value: number) => formatCompactCurrency(value, currency)}
            />
            <Tooltip
              content={<WealthMountainTooltip currency={currency} />}
              cursor={{ stroke: CHART_COLORS.accent, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="corpus"
              stroke={CHART_COLORS.accent}
              strokeWidth={2}
              fill={CHART_COLORS.accent}
              fillOpacity={0.1}
              activeDot={{ r: 4, fill: CHART_COLORS.accent, stroke: CHART_COLORS.canvas, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 font-mono text-[11px] text-ink-secondary">
        Horizon: {inputs.durationYears} years · {currency}
      </p>
    </ChartFrame>
  );
}

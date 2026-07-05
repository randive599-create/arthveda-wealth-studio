/**
 * Rupee-cost averaging — an inline SVG showing that a fixed monthly amount buys
 * MORE units when the price (NAV) is low and FEWER when it is high. Uses the
 * same figures as the article's worked example (₹1,000/month).
 *
 * Bars = units bought; gold line = NAV (price). Token-driven, responsive,
 * accessible, dependency-free and server-safe.
 */

import type { IllustrationProps } from './SipFlowDiagram';

interface MonthPoint {
  month: string;
  nav: number;
  units: number;
}

const DATA: MonthPoint[] = [
  { month: 'M1', nav: 20, units: 50 },
  { month: 'M2', nav: 25, units: 40 },
  { month: 'M3', nav: 10, units: 100 },
  { month: 'M4', nav: 25, units: 40 },
];

const BASELINE = 200;
const SLOT_W = 75;
const SLOT_X0 = 30;
const BAR_W = 34;

// NAV (10..25) mapped into a price band (y 70..20) that sits clear of the bars.
function navY(nav: number): number {
  return 70 - ((nav - 10) / 15) * 50;
}

export function RupeeCostAveraging({ className }: IllustrationProps) {
  const centers = DATA.map((_, i) => SLOT_X0 + SLOT_W / 2 + i * SLOT_W);
  const pricePoints = DATA.map((d, i) => `${centers[i]},${navY(d.nav)}`).join(' ');

  return (
    <svg
      viewBox="0 0 360 244"
      className={className ?? 'mx-auto h-auto w-full max-w-[440px]'}
      role="img"
      aria-labelledby="rca-title"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="rca-title">
        Rupee-cost averaging: with a fixed monthly investment, a lower price buys more units. In
        month three the price falls to ten rupees and the same amount buys one hundred units — far
        more than in the other months.
      </title>

      {/* Baseline */}
      <line x1={20} y1={BASELINE} x2={340} y2={BASELINE} stroke="var(--color-hairline)" strokeWidth={1.5} />

      {/* Unit bars */}
      {DATA.map((d, i) => {
        const height = d.units; // 1 unit = 1px (max 100)
        const x = centers[i] - BAR_W / 2;
        const y = BASELINE - height;
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={BAR_W} height={height} rx={3} fill="var(--color-returns)" />
            <text
              x={centers[i]}
              y={y - 6}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={10}
              fontWeight={600}
              fill="var(--color-ink)"
            >
              {d.units}u
            </text>
            <text
              x={centers[i]}
              y={BASELINE + 16}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={10}
              fill="var(--color-ink-secondary)"
            >
              {d.month}
            </text>
          </g>
        );
      })}

      {/* NAV price line + points */}
      <polyline
        points={pricePoints}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth={2}
        aria-hidden="true"
      />
      {DATA.map((d, i) => (
        <g key={`nav-${d.month}`} aria-hidden="true">
          <circle cx={centers[i]} cy={navY(d.nav)} r={3.5} fill="var(--color-gold)" />
          <text
            x={centers[i]}
            y={navY(d.nav) - 8}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={10}
            fill="var(--color-gold)"
          >
            ₹{d.nav}
          </text>
        </g>
      ))}

      {/* Legend */}
      <g fontFamily="var(--font-mono)" fontSize={10} fill="var(--color-ink-secondary)">
        <rect x={70} y={228} width={10} height={10} rx={2} fill="var(--color-returns)" />
        <text x={85} y={237}>
          Units bought
        </text>
        <line x1={188} y1={233} x2={206} y2={233} stroke="var(--color-gold)" strokeWidth={2} />
        <circle cx={197} cy={233} r={3} fill="var(--color-gold)" />
        <text x={212} y={237}>
          NAV (price)
        </text>
      </g>
    </svg>
  );
}

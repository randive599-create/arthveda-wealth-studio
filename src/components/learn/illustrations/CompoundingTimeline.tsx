/**
 * Compounding timeline — an inline SVG contrasting the money you *invest*
 * (a roughly straight line) with the *value* it can grow into (an accelerating
 * curve). The widening shaded gap is the compounding effect.
 *
 * Illustrative only — no axes values are promised. Token-driven, responsive,
 * accessible, dependency-free and server-safe.
 */

import type { IllustrationProps } from './SipFlowDiagram';

export function CompoundingTimeline({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 360 220"
      className={className ?? 'mx-auto h-auto w-full max-w-[440px]'}
      role="img"
      aria-labelledby="compounding-title"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="compounding-title">
        Compounding over time: the amount invested rises steadily in a straight line, while the
        portfolio value curves upward ever more steeply, and the gap between them widens the longer
        you stay invested.
      </title>

      {/* Baseline (x-axis) */}
      <line x1={44} y1={180} x2={344} y2={180} stroke="var(--color-hairline)" strokeWidth={1.5} />

      {/* Shaded compounding gap between the value curve and the invested line */}
      <path
        d="M44 180 C 200 175 280 120 344 34 L344 110 L44 180 Z"
        fill="var(--color-accent-wash)"
      />

      {/* Amount invested — near-linear */}
      <line x1={44} y1={180} x2={344} y2={110} stroke="var(--color-invested)" strokeWidth={2} />

      {/* Portfolio value — accelerating curve */}
      <path
        d="M44 180 C 200 175 280 120 344 34"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Inline series labels */}
      <text
        x={340}
        y={28}
        textAnchor="end"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fontWeight={600}
        fill="var(--color-accent)"
      >
        Value
      </text>
      <text
        x={340}
        y={124}
        textAnchor="end"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--color-invested)"
      >
        Invested
      </text>

      {/* Axis captions */}
      <text x={44} y={198} fontFamily="var(--font-mono)" fontSize={10} fill="var(--color-ink-secondary)">
        Start
      </text>
      <text
        x={344}
        y={198}
        textAnchor="end"
        fontFamily="var(--font-mono)"
        fontSize={10}
        fill="var(--color-ink-secondary)"
      >
        Years of investing →
      </text>
    </svg>
  );
}

/**
 * SIP flow diagram — a lightweight, inline SVG showing how money moves through
 * a Systematic Investment Plan:
 *
 *   Bank Account → Monthly SIP → Mutual Fund → Units Purchased → Long-Term Wealth
 *
 * Token-driven (var(--color-*)) so it matches the ArthVeda palette and follows
 * any future theme, responsive (scales via viewBox), accessible (role="img" +
 * <title>), dependency-free, and server-safe for the static prerender.
 */

export interface IllustrationProps {
  className?: string;
}

const STEPS = ['Bank Account', 'Monthly SIP', 'Mutual Fund', 'Units Purchased'];

const NODE_X = 30;
const NODE_W = 260;
const NODE_H = 44;
const STEP_GAP = 80; // top-to-top distance between nodes

export function SipFlowDiagram({ className }: IllustrationProps) {
  const finalTop = STEPS.length * STEP_GAP + 6;
  const height = finalTop + NODE_H + 8;
  const centerX = NODE_X + NODE_W / 2;

  return (
    <svg
      viewBox={`0 0 320 ${height}`}
      className={className ?? 'mx-auto h-auto w-full max-w-[320px]'}
      role="img"
      aria-labelledby="sip-flow-title"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="sip-flow-title">
        How a SIP works: money moves from your bank account to a monthly SIP, into a mutual fund,
        buying units, and compounding into long-term wealth.
      </title>

      {/* Connecting arrows between each step */}
      {STEPS.map((_, i) => {
        const gapTop = 6 + i * STEP_GAP + NODE_H;
        return (
          <g key={`arrow-${i}`} aria-hidden="true">
            <line
              x1={centerX}
              y1={gapTop + 4}
              x2={centerX}
              y2={gapTop + STEP_GAP - NODE_H - 2}
              stroke="var(--color-accent)"
              strokeWidth={1.5}
            />
            <path
              d={`M${centerX - 5} ${gapTop + STEP_GAP - NODE_H - 4} L${centerX} ${
                gapTop + STEP_GAP - NODE_H + 2
              } L${centerX + 5} ${gapTop + STEP_GAP - NODE_H - 4} Z`}
              fill="var(--color-accent)"
            />
          </g>
        );
      })}

      {/* Intermediate step nodes (outlined) */}
      {STEPS.map((label, i) => {
        const top = 6 + i * STEP_GAP;
        return (
          <g key={label}>
            <rect
              x={NODE_X}
              y={top}
              width={NODE_W}
              height={NODE_H}
              rx={6}
              fill="var(--color-canvas)"
              stroke="var(--color-hairline)"
              strokeWidth={1.5}
            />
            <text
              x={centerX}
              y={top + NODE_H / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="var(--font-body)"
              fontSize={13}
              fontWeight={500}
              fill="var(--color-ink)"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Final outcome node (emerald, emphasised) */}
      <g>
        <rect
          x={NODE_X}
          y={finalTop}
          width={NODE_W}
          height={NODE_H}
          rx={6}
          fill="var(--color-accent)"
        />
        <text
          x={centerX}
          y={finalTop + NODE_H / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-body)"
          fontSize={13}
          fontWeight={600}
          fill="#ffffff"
        >
          Long-Term Wealth Creation
        </text>
      </g>
    </svg>
  );
}

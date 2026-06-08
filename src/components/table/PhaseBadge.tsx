/**
 * PhaseBadge — a subtle, institutional indicator for a projection phase.
 *
 * No bright fills: each phase uses a hairline-bordered pill with a small dot in
 * the phase's accent. Matches the engine's three phases exactly.
 */

import type { Phase } from '../../engine/types';
import { PHASE_LABEL } from './projectionRows';

const DOT: Record<Phase, string> = {
  accumulation: 'bg-invested',
  growth: 'bg-ink-secondary',
  withdrawal: 'bg-accent',
};

export interface PhaseBadgeProps {
  phase: Phase;
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2 py-0.5">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[phase]}`} aria-hidden="true" />
      <span className="text-xs font-medium text-ink-secondary">{PHASE_LABEL[phase]}</span>
    </span>
  );
}

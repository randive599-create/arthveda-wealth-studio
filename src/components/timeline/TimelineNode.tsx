/**
 * A single Wealth Journey Timeline node.
 *
 * Renders an emerald marker, a Cormorant milestone heading, the year and
 * elapsed duration, and a set of IBM Plex Mono figures (corpus, invested, and
 * — where applicable — withdrawn). Used in both the horizontal (desktop) and
 * vertical (mobile) layouts; the orientation only affects the surrounding
 * connector, not this card.
 */

import type { TimelineNode as TimelineNodeData } from '../../engine/timeline';
import type { Currency } from '../../engine/types';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';

export interface TimelineNodeProps {
  node: TimelineNodeData;
  currency: Currency;
  /** Whether to show the withdrawn figure (income mode only). */
  showWithdrawn: boolean;
}

function durationLabel(yearsFromStart: number): string {
  if (yearsFromStart <= 0) {
    return 'Today';
  }
  if (yearsFromStart === 1) {
    return 'In 1 year';
  }
  return `In ${yearsFromStart} years`;
}

interface FigureProps {
  label: string;
  value: string;
}

function Figure({ label, value }: FigureProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-ink-secondary">{label}</dt>
      <dd className="font-mono text-xs font-semibold text-ink">{value}</dd>
    </div>
  );
}

export function TimelineNode({ node, currency, showWithdrawn }: TimelineNodeProps) {
  const yearLabel = node.year === 0 ? 'Year 0' : `Year ${node.year}`;

  return (
    <div
      className="group rounded-[var(--radius-card)] border border-hairline bg-canvas p-4 transition-colors duration-150 hover:border-accent focus-within:border-accent"
      data-testid={TESTIDS.timelineNode(node.kind)}
      tabIndex={0}
      role="group"
      aria-label={`${node.label}, ${yearLabel}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
          {yearLabel}
        </span>
        <span className="font-mono text-[10px] text-ink-secondary">· {durationLabel(node.yearsFromStart)}</span>
      </div>

      <h4 className="mt-1 font-heading text-lg font-bold leading-tight text-ink">{node.label}</h4>

      <dl className="mt-3 space-y-1.5 border-t border-hairline pt-3">
        <Figure label="Corpus" value={formatCurrency(node.corpus, currency)} />
        <Figure label="Invested" value={formatCurrency(node.totalInvested, currency)} />
        {showWithdrawn ? (
          <Figure label="Withdrawn" value={formatCurrency(node.totalWithdrawn, currency)} />
        ) : null}
      </dl>
    </div>
  );
}

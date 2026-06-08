/**
 * A single AI Wealth Insight card.
 *
 * Category is conveyed with a subtle left accent rail and a small mono label —
 * emerald for Opportunity, charcoal for Observation, amber for Risk. No icons,
 * badges, emojis, or warning glyphs: the treatment is deliberately restrained
 * to read as private-wealth commentary rather than a consumer alert.
 */

import type { Insight, InsightCategory } from '../../engine/types';
import { TESTIDS } from '../../lib/testids';

const CATEGORY_LABEL: Record<InsightCategory, string> = {
  opportunity: 'Opportunity',
  observation: 'Observation',
  risk: 'Risk',
};

/** Left accent rail color + label color per category (hex-token-aligned classes). */
const CATEGORY_RAIL: Record<InsightCategory, string> = {
  opportunity: 'before:bg-accent',
  observation: 'before:bg-ink-secondary',
  risk: 'before:bg-risk',
};

const CATEGORY_LABEL_COLOR: Record<InsightCategory, string> = {
  opportunity: 'text-accent',
  observation: 'text-ink-secondary',
  risk: 'text-risk-strong',
};

export interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <article
      data-testid={TESTIDS.insightCard(insight.id)}
      className={`
        relative h-full overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-canvas
        p-5 pl-6
        before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']
        ${CATEGORY_RAIL[insight.category]}
      `}
    >
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.18em] ${CATEGORY_LABEL_COLOR[insight.category]}`}
      >
        {CATEGORY_LABEL[insight.category]}
      </p>
      <h4 className="mt-2 font-heading text-lg font-bold leading-snug text-ink">
        {insight.headline}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{insight.explanation}</p>
    </article>
  );
}

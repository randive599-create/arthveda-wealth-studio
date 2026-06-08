/**
 * AI Wealth Insights section.
 *
 * Presents the deterministic, locally-generated observations from the engine's
 * rules engine (no LLM, no API). Insights are pre-ranked by the engine; this
 * component only renders them in a responsive grid — two columns on desktop,
 * a single column on mobile.
 *
 * Accessibility: the section is a labelled region; insights form a list so
 * assistive technology can enumerate them.
 */

import { useStudioStore } from '../../state/useStudioStore';
import { selectInsights } from '../../state/selectors';
import { TESTIDS } from '../../lib/testids';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';
import { InsightCard } from './InsightCard';

export function AIWealthInsights() {
  const insights = useStudioStore(selectInsights);

  return (
    <Card className="p-6" data-testid={TESTIDS.insights}>
      <SectionHeading
        eyebrow="AI Wealth Insights"
        title="Institutional Observations"
        description="Institutional observations derived from your projection assumptions."
      />

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
        {insights.map((insight) => (
          <li key={insight.id} className="h-full">
            <InsightCard insight={insight} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

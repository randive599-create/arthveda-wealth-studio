/**
 * Wealth Journey Timeline.
 *
 * Presents the lifecycle nodes (Investment Start → SIP Stop → [Withdrawal
 * Start] → Final Projection Year) derived by the engine. The section adapts to
 * plan mode (the withdrawal node is present only in income mode — no empty
 * states) and to currency.
 *
 * Layout:
 *   - Desktop (lg+): a horizontal timeline — nodes in a row joined by an
 *     emerald connector rail with markers.
 *   - Mobile: a vertical timeline — nodes stacked, joined by a left-side rail.
 *
 * Each node is keyboard-focusable and labelled for assistive technology; the
 * connectors and markers are decorative and hidden from screen readers.
 */

import { useStudioStore } from '../../state/useStudioStore';
import { selectCurrency, selectMode, selectTimeline } from '../../state/selectors';
import { TESTIDS } from '../../lib/testids';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';
import { TimelineNode } from './TimelineNode';

/** Decorative emerald marker dot. */
function Marker() {
  return (
    <span
      className="relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent ring-4 ring-canvas"
      aria-hidden="true"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-canvas" />
    </span>
  );
}

export function WealthJourneyTimeline() {
  const timeline = useStudioStore(selectTimeline);
  const currency = useStudioStore(selectCurrency);
  const mode = useStudioStore(selectMode);
  const showWithdrawn = mode === 'income';

  return (
    <Card className="p-6" data-testid={TESTIDS.timeline}>
      <SectionHeading
        eyebrow="Wealth Journey"
        title="Lifecycle Timeline"
        description="The progression of your plan from first investment to the final projection year."
      />

      {/* Desktop: horizontal timeline */}
      <div className="mt-8 hidden lg:block">
        <div className="relative">
          {/* Connector rail */}
          <div
            className="absolute left-0 right-0 top-[7px] h-px bg-hairline"
            aria-hidden="true"
          />
          <ol
            className="relative grid gap-5"
            style={{ gridTemplateColumns: `repeat(${timeline.length}, minmax(0, 1fr))` }}
          >
            {timeline.map((node) => (
              <li key={node.kind} className="flex flex-col items-stretch">
                <div className="mb-5 flex justify-center">
                  <Marker />
                </div>
                <TimelineNode node={node} currency={currency} showWithdrawn={showWithdrawn} />
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="mt-8 lg:hidden">
        <ol className="relative space-y-5 pl-8">
          {/* Vertical rail */}
          <div className="absolute bottom-2 left-[6px] top-2 w-px bg-hairline" aria-hidden="true" />
          {timeline.map((node) => (
            <li key={node.kind} className="relative">
              <span className="absolute -left-8 top-1.5">
                <Marker />
              </span>
              <TimelineNode node={node} currency={currency} showWithdrawn={showWithdrawn} />
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}

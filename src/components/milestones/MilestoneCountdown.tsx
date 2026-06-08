/**
 * Crorepati / Milestone Countdown.
 *
 * Lists the wealth milestones actually achieved within the horizon, in
 * chronological order, with the expected year, years from today, and the corpus
 * value at achievement. The section title adapts to currency: "Crorepati
 * Countdown" for INR, "Milestone Countdown" for USD/EUR (provided by the engine
 * as `milestoneTitle`).
 *
 * When no milestone is reached, an institutional informational state is shown
 * rather than an empty section. No emojis, no celebration graphics — a private
 * wealth dashboard treatment only.
 */

import { Landmark } from 'lucide-react';
import { useStudioStore } from '../../state/useStudioStore';
import { selectCurrency, selectMilestoneTitle, selectMilestones } from '../../state/selectors';
import { TESTIDS } from '../../lib/testids';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';
import { MilestoneRow } from './MilestoneRow';

export function MilestoneCountdown() {
  const milestones = useStudioStore(selectMilestones);
  const title = useStudioStore(selectMilestoneTitle);
  const currency = useStudioStore(selectCurrency);

  const hasMilestones = milestones.length > 0;

  return (
    <Card className="p-6" data-testid={TESTIDS.milestoneCountdown}>
      <SectionHeading
        eyebrow="Wealth Milestones"
        title={title}
        description="Milestones your projected corpus is expected to reach, in chronological order."
      />

      {hasMilestones ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <caption className="sr-only">{title}: achieved wealth milestones</caption>
            <thead>
              <tr>
                <th scope="col" className="pb-2 pr-3 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Milestone
                </th>
                <th scope="col" className="pb-2 px-3 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Expected Year
                </th>
                <th scope="col" className="pb-2 px-3 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  From Today
                </th>
                <th scope="col" className="pb-2 pl-3 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Corpus at Achievement
                </th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((milestone) => (
                <MilestoneRow key={milestone.value} milestone={milestone} currency={currency} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="mt-6 flex items-start gap-3 rounded-[var(--radius-control)] border border-dashed border-hairline bg-mist px-4 py-6 text-ink-secondary"
          data-testid={TESTIDS.milestoneEmpty}
        >
          <Landmark size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <p className="text-sm leading-relaxed">
            No wealth milestones are reached within the current projection. Increase the
            investment amount, return rate, or horizon to see milestones appear here.
          </p>
        </div>
      )}
    </Card>
  );
}

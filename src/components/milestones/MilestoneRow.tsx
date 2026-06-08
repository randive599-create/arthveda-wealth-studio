/**
 * A single achieved-milestone row for the Countdown section.
 *
 * Presents the milestone label, the expected calendar year, the years from
 * today until achievement, and the corpus value at achievement — all in the
 * institutional IBM Plex Mono treatment. Rendered as a table row for correct
 * semantics and screen-reader association with the column headers.
 */

import type { Currency, Milestone } from '../../engine/types';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';

export interface MilestoneRowProps {
  milestone: Milestone;
  currency: Currency;
}

function yearsRemainingLabel(years: number): string {
  if (years <= 0) {
    return 'Reached';
  }
  if (years === 1) {
    return '1 year';
  }
  return `${years} years`;
}

export function MilestoneRow({ milestone, currency }: MilestoneRowProps) {
  return (
    <tr
      className="border-t border-hairline transition-colors duration-150 hover:bg-mist"
      data-testid={TESTIDS.milestoneRow(milestone.value)}
    >
      <th scope="row" className="py-3 pr-3 text-left">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          <span className="font-heading text-base font-bold text-ink">{milestone.label}</span>
        </span>
      </th>
      <td className="py-3 px-3 text-right font-mono text-sm text-ink">Year {milestone.reachedYear}</td>
      <td className="py-3 px-3 text-right font-mono text-sm text-ink-secondary">
        {yearsRemainingLabel(milestone.yearsRemaining)}
      </td>
      <td className="py-3 pl-3 text-right font-mono text-sm font-semibold text-ink">
        {formatCurrency(milestone.corpusAtAchievement, currency)}
      </td>
    </tr>
  );
}

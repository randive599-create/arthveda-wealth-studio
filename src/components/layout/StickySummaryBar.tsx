/**
 * Sticky Projection Summary Bar.
 *
 * Remains visible during scrolling so the headline numbers are always at hand.
 * On desktop it sticks to the top of the studio column; on mobile it becomes a
 * fixed, thumb-reachable bar pinned to the bottom of the viewport. Shows Total
 * Investment, Final Corpus, and the first-milestone year.
 */

import { useStudioStore } from '../../state/useStudioStore';
import { selectCurrency, selectSummary } from '../../state/selectors';
import { formatCompactCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';

interface SummaryItem {
  label: string;
  value: string;
  testId: string;
}

export function StickySummaryBar() {
  const summary = useStudioStore(selectSummary);
  const currency = useStudioStore(selectCurrency);

  const items: SummaryItem[] = [
    {
      label: 'Total Investment',
      value: formatCompactCurrency(summary.totalInvestment, currency),
      testId: TESTIDS.summaryBarTotalInvestment,
    },
    {
      label: 'Final Corpus',
      value: formatCompactCurrency(summary.finalCorpus, currency),
      testId: TESTIDS.summaryBarFinalCorpus,
    },
    {
      label: 'First Crore',
      value: summary.firstCroreYear !== null ? `Yr ${summary.firstCroreYear}` : '—',
      testId: TESTIDS.summaryBarFirstCrore,
    },
  ];

  return (
    <div
      className="
        sticky top-0 z-30 border-b border-hairline bg-canvas/95 backdrop-blur
        max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto
        max-lg:border-b-0 max-lg:border-t
      "
      data-testid={TESTIDS.summaryBar}
    >
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-3 divide-x divide-hairline px-1">
        {items.map((item) => (
          <div key={item.testId} className="px-3 py-3 text-center" data-testid={item.testId}>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-secondary">
              {item.label}
            </p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-ink sm:text-base">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

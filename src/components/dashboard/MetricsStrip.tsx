/**
 * Supporting metrics strip beneath the primary cards.
 *
 * Always shows Total Returns and Wealth Multiplier. When inflation is enabled,
 * it additionally surfaces the inflation-adjusted corpus and the real wealth
 * multiplier. Rendered as a single bordered card divided into columns.
 */

import { useStudioStore } from '../../state/useStudioStore';
import { selectCurrency, selectSummary } from '../../state/selectors';
import {
  formatCurrency,
  formatMultiplier,
} from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { Card } from '../primitives/Card';

interface StripItem {
  label: string;
  value: string;
  testId: string;
}

export function MetricsStrip() {
  const summary = useStudioStore(selectSummary);
  const currency = useStudioStore(selectCurrency);

  const items: StripItem[] = [
    {
      label: 'Total Returns',
      value: formatCurrency(summary.totalReturns, currency),
      testId: TESTIDS.metricTotalReturns,
    },
    {
      label: 'Wealth Multiplier',
      value: formatMultiplier(summary.wealthMultiplier),
      testId: TESTIDS.metricWealthMultiplier,
    },
  ];

  if (summary.inflationAdjustedCorpus !== null) {
    items.push({
      label: 'Inflation Adj. Corpus',
      value: formatCurrency(summary.inflationAdjustedCorpus, currency),
      testId: TESTIDS.metricInflationAdjustedCorpus,
    });
  }
  if (summary.inflationAdjustedWealthMultiplier !== null) {
    items.push({
      label: 'Inflation Adj. Multiplier',
      value: formatMultiplier(summary.inflationAdjustedWealthMultiplier),
      testId: TESTIDS.metricInflationAdjustedMultiplier,
    });
  }

  return (
    <Card className="overflow-hidden" data-testid={TESTIDS.metricsStrip}>
      <dl className="grid grid-cols-2 divide-hairline lg:grid-cols-4 lg:divide-x">
        {items.map((item, index) => (
          <div
            key={item.testId}
            className={`p-5 ${index >= 2 ? 'border-t border-hairline lg:border-t-0' : ''} ${
              index % 2 === 1 ? 'border-l border-hairline lg:border-l-0' : ''
            }`}
            data-testid={item.testId}
          >
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
              {item.label}
            </dt>
            <dd className="mt-2 font-mono text-lg font-semibold text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

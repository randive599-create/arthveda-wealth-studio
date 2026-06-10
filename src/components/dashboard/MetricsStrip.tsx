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
            className={`min-w-0 p-5 ${index >= 2 ? 'border-t border-hairline lg:border-t-0' : ''} ${
              index % 2 === 1 ? 'border-l border-hairline lg:border-l-0' : ''
            }`}
            data-testid={item.testId}
          >
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
              {item.label}
            </dt>
            {/*
              Narrow 2-up cells on mobile: the value uses a viewport clamp so
              large INR figures fit each cell on 320–430px screens. The clamp
              caps at 1.125rem (= text-lg), so the value is identical to the
              previous design at ≥640px. break-words is the wrap fallback.
            */}
            <dd className="mt-2 font-mono text-[clamp(0.9rem,3.4vw,1.125rem)] font-semibold text-ink break-words">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

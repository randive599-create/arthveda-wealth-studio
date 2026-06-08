/**
 * The dashboard: four primary cards in the exact spec order, followed by the
 * supporting metrics strip.
 *
 *   Card 1 — Total Investment
 *   Card 2 — Corpus @ SIP Stop · Yr {sipStopYear}
 *   Card 3 — Total SWP Withdrawal
 *   Card 4 — Final Corpus · Yr {duration}   (hero: emerald accent, larger)
 *
 * Cards 1–3 sit on a three-up row (single column on mobile). Card 4 spans the
 * full width beneath them so the headline outcome is unmistakable.
 */

import { Landmark, PiggyBank, TrendingUp } from 'lucide-react';
import { useStudioStore } from '../../state/useStudioStore';
import { selectCurrency, selectInputs, selectSummary } from '../../state/selectors';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { MetricCard } from './MetricCard';
import { FinalCorpusCard } from './FinalCorpusCard';
import { MetricsStrip } from './MetricsStrip';

export function DashboardGrid() {
  const summary = useStudioStore(selectSummary);
  const inputs = useStudioStore(selectInputs);
  const currency = useStudioStore(selectCurrency);

  const isIncome = inputs.mode === 'income';

  const finalCorpusSub =
    summary.inflationAdjustedCorpus !== null
      ? `${formatCurrency(summary.inflationAdjustedCorpus, currency)} in today's value`
      : undefined;

  return (
    <section className="space-y-5" data-testid={TESTIDS.dashboard} aria-label="Wealth summary">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
        Wealth Summary
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Investment"
          value={formatCurrency(summary.totalInvestment, currency)}
          icon={<PiggyBank size={18} strokeWidth={1.75} aria-hidden="true" />}
          testId={TESTIDS.cardTotalInvestment}
        />
        <MetricCard
          label={`Corpus @ SIP Stop · Yr ${inputs.sipStopYear}`}
          value={formatCurrency(summary.corpusAtSipStop, currency)}
          icon={<Landmark size={18} strokeWidth={1.75} aria-hidden="true" />}
          testId={TESTIDS.cardCorpusAtSipStop}
        />
        <MetricCard
          label="Total SWP Withdrawal"
          value={formatCurrency(summary.totalWithdrawn, currency)}
          subValue={isIncome ? undefined : 'No withdrawals in this plan'}
          icon={<TrendingUp size={18} strokeWidth={1.75} aria-hidden="true" />}
          testId={TESTIDS.cardTotalWithdrawal}
        />
      </div>

      <div className="pt-1">
        <FinalCorpusCard
          label={`Final Corpus · Yr ${inputs.durationYears}`}
          value={formatCurrency(summary.finalCorpus, currency)}
          subValue={finalCorpusSub}
          testId={TESTIDS.cardFinalCorpus}
        />
      </div>

      <MetricsStrip />
    </section>
  );
}

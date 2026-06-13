/**
 * SWP summary cards — the SWP-specific output dashboard.
 *
 * The five SWP outputs: Corpus Longevity, Total Withdrawals, Remaining Corpus,
 * Inflation-Adjusted Income, and the Portfolio Survival Probability (shown as
 * the prominent verdict card). Built from the shared Card / MetricCard
 * primitives.
 */

import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import type { SwpResult } from './swpModel';

export interface SwpSummaryCardsProps {
  result: SwpResult;
}

function formatLongevity(months: number): string {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  return `${years}y ${rem}m`;
}

export function SwpSummaryCards({ result }: SwpSummaryCardsProps) {
  const money = (value: number) => formatCurrency(value, result.currency);
  const survivalPct = Math.round(result.survivalProbability * 100);
  const strong = survivalPct >= 75;

  const longevityValue = result.survivesFullTerm
    ? `${result.durationYears}+ years`
    : formatLongevity(result.longevityMonths);

  return (
    <div className="space-y-4" data-testid={TESTIDS.swpSummary}>
      {/* Portfolio survival probability — the headline verdict. */}
      <Card
        className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between ${
          strong ? 'border-accent bg-mist' : 'border-risk-strong'
        }`}
        data-testid={TESTIDS.swpSurvivalIndicator}
      >
        <div className="flex items-center gap-3">
          <span className={strong ? 'text-accent' : 'text-risk-strong'}>
            {strong ? (
              <ShieldCheck size={28} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <ShieldAlert size={28} strokeWidth={1.75} aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
              Portfolio Survival Probability
            </p>
            <p
              className={`font-heading text-2xl font-bold leading-tight ${
                strong ? 'text-accent' : 'text-risk-strong'
              }`}
            >
              {survivalPct}% chance of lasting {result.durationYears} years
            </p>
          </div>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">
          {strong
            ? 'Across simulated market paths, the corpus reliably sustains your withdrawals for the full term.'
            : 'Across simulated market paths, the corpus is at meaningful risk of running out before the term ends.'}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Corpus Longevity"
          value={longevityValue}
          subValue={result.survivesFullTerm ? 'Lasts the full term' : 'Until the corpus is exhausted'}
          testId={TESTIDS.swpOutput('longevity')}
        />
        <MetricCard
          label="Total Withdrawals"
          value={money(result.totalWithdrawals)}
          subValue="Income drawn over the term"
          testId={TESTIDS.swpOutput('total-withdrawals')}
        />
        <MetricCard
          label="Remaining Corpus"
          value={money(result.remainingCorpus)}
          subValue={result.depleted ? 'Corpus depleted' : `At end of year ${result.durationYears}`}
          testId={TESTIDS.swpOutput('remaining-corpus')}
        />
        <MetricCard
          label="Inflation-Adjusted Income"
          value={`${money(result.inflationAdjustedMonthlyIncome)}/mo`}
          subValue={`Real value of your withdrawal at year ${result.durationYears}`}
          testId={TESTIDS.swpOutput('inflation-adjusted-income')}
        />
        <MetricCard
          label="Portfolio Survival Probability"
          value={`${survivalPct}%`}
          subValue={`Over ${result.durationYears} years`}
          testId={TESTIDS.swpOutput('survival-probability')}
        />
      </div>
    </div>
  );
}

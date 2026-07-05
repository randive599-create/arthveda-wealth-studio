/**
 * Lumpsum summary cards — the lumpsum-specific output dashboard.
 *
 * The five lumpsum outputs: Final Corpus (the headline card), Total Gain, CAGR,
 * Inflation-Adjusted Corpus, and Wealth Multiplier. Built from the shared Card /
 * MetricCard primitives.
 */

import { TrendingUp } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import type { LumpsumResult } from './lumpsumModel';

export interface LumpsumSummaryCardsProps {
  result: LumpsumResult;
}

export function LumpsumSummaryCards({ result }: LumpsumSummaryCardsProps) {
  const money = (value: number) => formatCurrency(value, result.currency);

  return (
    <div className="space-y-4" data-testid={TESTIDS.lumpsumSummary}>
      {/* Final Corpus — the headline output. */}
      <Card
        className="flex flex-col gap-3 border-accent bg-mist p-5 sm:flex-row sm:items-center sm:justify-between"
        data-testid={TESTIDS.lumpsumOutput('final-corpus')}
      >
        <div className="flex items-center gap-3">
          <span className="text-accent">
            <TrendingUp size={28} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
              Final Value (Corpus)
            </p>
            <p className="font-heading text-3xl font-bold leading-tight text-accent">
              {money(result.finalCorpus)}
            </p>
          </div>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">
          {money(result.invested)} grows {result.wealthMultiplier.toFixed(2)}× over{' '}
          {result.durationYears} years at an assumed {result.cagrPct.toFixed(1)}% CAGR.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Investment Gains (Returns Earned)"
          value={money(result.totalGain)}
          subValue="Corpus minus investment"
          testId={TESTIDS.lumpsumOutput('total-gain')}
        />
        <MetricCard
          label="Annual Growth Rate (CAGR)"
          value={`${result.cagrPct.toFixed(2)}%`}
          subValue="Compound annual growth"
          testId={TESTIDS.lumpsumOutput('cagr')}
        />
        <MetricCard
          label="Inflation-Adjusted Corpus"
          value={money(result.inflationAdjustedCorpus)}
          subValue="In today's money"
          testId={TESTIDS.lumpsumOutput('inflation-adjusted-corpus')}
        />
        <MetricCard
          label="Wealth Multiplier"
          value={`${result.wealthMultiplier.toFixed(2)}×`}
          subValue="Final corpus / investment"
          testId={TESTIDS.lumpsumOutput('wealth-multiplier')}
        />
      </div>
    </div>
  );
}

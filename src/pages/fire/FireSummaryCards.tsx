/**
 * FIRE summary cards — the FIRE-specific output dashboard.
 *
 * Replaces the generic studio metric cards with the six FIRE outputs:
 * FIRE Number Required, Inflation-Adjusted FIRE Number, Projected Corpus at
 * FIRE Age, Years Remaining to FIRE, the FIRE Success indicator, and the
 * Wealth Gap. Built from the shared Card / MetricCard primitives.
 */

import { CheckCircle2, TriangleAlert } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import type { FireResult } from './fireModel';

export interface FireSummaryCardsProps {
  result: FireResult;
  fireAge: number;
}

export function FireSummaryCards({ result, fireAge }: FireSummaryCardsProps) {
  const money = (value: number) => formatCurrency(value, result.currency);

  return (
    <div className="space-y-4" data-testid={TESTIDS.fireSummary}>
      {/* FIRE Success indicator — the headline verdict. */}
      <Card
        className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between ${
          result.onTrack ? 'border-accent bg-mist' : 'border-risk-strong'
        }`}
        data-testid={TESTIDS.fireSuccessIndicator}
      >
        <div className="flex items-center gap-3">
          <span className={result.onTrack ? 'text-accent' : 'text-risk-strong'}>
            {result.onTrack ? (
              <CheckCircle2 size={28} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <TriangleAlert size={28} strokeWidth={1.75} aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
              FIRE Success Indicator
            </p>
            <p
              className={`font-heading text-2xl font-bold leading-tight ${
                result.onTrack ? 'text-accent' : 'text-risk-strong'
              }`}
            >
              {result.onTrack ? 'On Track for FIRE' : 'Shortfall — Not Yet on Track'}
            </p>
          </div>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">
          {result.onTrack
            ? `Your projected corpus clears the FIRE number at age ${fireAge}, with a surplus of ${money(
                result.surplus,
              )}.`
            : `Your projected corpus falls ${money(
                result.shortfall,
              )} short of the FIRE number at age ${fireAge}.`}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="FIRE Number Required"
          value={money(result.fireNumberToday)}
          subValue="In today's money"
          testId={TESTIDS.fireOutput('fire-number')}
        />
        <MetricCard
          label="Inflation-Adjusted FIRE Number"
          value={money(result.inflationAdjustedFireNumber)}
          subValue={`Needed at age ${fireAge}`}
          testId={TESTIDS.fireOutput('inflation-adjusted')}
        />
        <MetricCard
          label="Projected Corpus at FIRE Age"
          value={money(result.projectedCorpusAtFire)}
          subValue={`At age ${fireAge}`}
          testId={TESTIDS.fireOutput('projected-corpus')}
        />
        <MetricCard
          label="Years Remaining to FIRE"
          value={`${result.yearsToFire} ${result.yearsToFire === 1 ? 'year' : 'years'}`}
          subValue="From today"
          testId={TESTIDS.fireOutput('years-remaining')}
        />
        <MetricCard
          label={result.onTrack ? 'Wealth Surplus' : 'Wealth Gap'}
          value={result.onTrack ? money(result.surplus) : money(result.shortfall)}
          subValue={result.onTrack ? 'Above your FIRE number' : 'Below your FIRE number'}
          testId={TESTIDS.fireOutput('wealth-gap')}
        />
      </div>
    </div>
  );
}

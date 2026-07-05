/**
 * SIP results — the SIP-specific output dashboard.
 *
 * Primary results: Total Invested, Wealth Created, Estimated Maturity Value (the
 * headline), Total Gain, Wealth Multiplier. Advanced results: Inflation-Adjusted
 * Corpus, Real Wealth Multiplier, Step-Up Benefit, and XIRR/CAGR. Built from the
 * shared Card / MetricCard primitives.
 */

import { TrendingUp } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import type { SipResult } from './sipModel';

export interface SipSummaryProps {
  result: SipResult;
}

export function SipSummary({ result }: SipSummaryProps) {
  const money = (value: number) => formatCurrency(value, result.currency);

  return (
    <div className="space-y-6" data-testid={TESTIDS.sipSummary}>
      {/* Estimated Maturity Value — the headline output. */}
      <Card
        className="flex flex-col gap-3 border-accent bg-mist p-5 sm:flex-row sm:items-center sm:justify-between"
        data-testid={TESTIDS.sipOutput('maturity-value')}
      >
        <div className="flex items-center gap-3">
          <span className="text-accent">
            <TrendingUp size={28} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
              Estimated Maturity Value
            </p>
            <p className="font-heading text-3xl font-bold leading-tight text-accent">
              {money(result.maturityValue)}
            </p>
          </div>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">
          You invest {money(result.totalInvested)} and create {money(result.wealthCreated)} of wealth
          over {result.durationYears} years — a {result.wealthMultiplier.toFixed(2)}× multiplier.
        </p>
      </Card>

      {/* Primary results. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Invested Amount"
          value={money(result.totalInvested)}
          subValue="Your contributions"
          testId={TESTIDS.sipOutput('total-invested')}
        />
        <MetricCard
          label="Wealth Created"
          value={money(result.wealthCreated)}
          subValue="Returns earned"
          testId={TESTIDS.sipOutput('wealth-created')}
        />
        <MetricCard
          label="Total Return (%)"
          value={`${result.totalGainPct.toFixed(1)}%`}
          subValue="Absolute return"
          testId={TESTIDS.sipOutput('total-gain')}
        />
        <MetricCard
          label="Wealth Multiplier"
          value={`${result.wealthMultiplier.toFixed(2)}×`}
          subValue="Maturity / invested"
          testId={TESTIDS.sipOutput('wealth-multiplier')}
        />
      </div>

      {/* Advanced results. */}
      <div data-testid={TESTIDS.sipAdvancedResults}>
        <SectionHeading eyebrow="Advanced" title="Advanced results" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Inflation-Adjusted Corpus"
            value={money(result.inflationAdjustedCorpus)}
            subValue="In today's money"
            testId={TESTIDS.sipOutput('inflation-adjusted')}
          />
          <MetricCard
            label="Real Wealth Multiplier"
            value={`${result.realWealthMultiplier.toFixed(2)}×`}
            subValue="Inflation-adjusted"
            testId={TESTIDS.sipOutput('real-multiplier')}
          />
          <MetricCard
            label="Step-Up Benefit"
            value={money(result.stepUpBenefit)}
            subValue={result.stepUpBenefit > 0 ? 'Extra from step-up' : 'Enable step-up to see this'}
            testId={TESTIDS.sipOutput('step-up-benefit')}
          />
          <MetricCard
            label="Annualised Return (XIRR / CAGR)"
            value={`${result.xirrPct.toFixed(2)}%`}
            subValue="Annualised return (approx.)"
            testId={TESTIDS.sipOutput('xirr')}
          />
        </div>
      </div>
    </div>
  );
}

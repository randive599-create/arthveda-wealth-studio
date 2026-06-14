/**
 * Retirement summary cards — the retirement-specific output dashboard.
 *
 * Retirement Income Sustainability is the prominent verdict; alongside it the
 * five outputs: Retirement Corpus Required, Projected Corpus, Wealth Gap, and
 * the Inflation-Adjusted Retirement Need. Built from the shared Card / MetricCard
 * primitives.
 */

import { CheckCircle2, TriangleAlert } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import type { RetirementResult } from './retirementModel';

export interface RetirementSummaryCardsProps {
  result: RetirementResult;
}

export function RetirementSummaryCards({ result }: RetirementSummaryCardsProps) {
  const money = (value: number) => formatCurrency(value, result.currency);
  const retirementAge = result.lifeExpectancy - result.retirementYears;

  return (
    <div className="space-y-4" data-testid={TESTIDS.retirementSummary}>
      {/* Retirement Income Sustainability — the headline verdict. */}
      <Card
        className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between ${
          result.sustainable ? 'border-accent bg-mist' : 'border-risk-strong'
        }`}
        data-testid={TESTIDS.retirementSustainability}
      >
        <div className="flex items-center gap-3">
          <span className={result.sustainable ? 'text-accent' : 'text-risk-strong'}>
            {result.sustainable ? (
              <CheckCircle2 size={28} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <TriangleAlert size={28} strokeWidth={1.75} aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
              Retirement Income Sustainability
            </p>
            <p
              className={`font-heading text-2xl font-bold leading-tight ${
                result.sustainable ? 'text-accent' : 'text-risk-strong'
              }`}
            >
              {result.sustainable
                ? `Income sustained to age ${result.lifeExpectancy}`
                : `Income runs out at age ${result.incomeSustainedToAge}`}
            </p>
          </div>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">
          {result.sustainable
            ? `Your projected corpus comfortably funds your retirement income, with a ${money(
                result.surplus,
              )} surplus over the corpus required.`
            : `Your projected corpus falls ${money(
                result.shortfall,
              )} short of the corpus required to fund your income to age ${result.lifeExpectancy}.`}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Retirement Corpus Required"
          value={money(result.requiredCorpus)}
          subValue={`At age ${retirementAge}`}
          testId={TESTIDS.retirementOutput('required-corpus')}
        />
        <MetricCard
          label="Projected Corpus"
          value={money(result.projectedCorpus)}
          subValue="At your retirement age"
          testId={TESTIDS.retirementOutput('projected-corpus')}
        />
        <MetricCard
          label={result.wealthGap > 0 ? 'Wealth Gap' : 'Wealth Surplus'}
          value={result.wealthGap > 0 ? money(result.shortfall) : money(result.surplus)}
          subValue={result.wealthGap > 0 ? 'Shortfall vs required' : 'Above required'}
          testId={TESTIDS.retirementOutput('wealth-gap')}
        />
        <MetricCard
          label="Inflation-Adjusted Retirement Need"
          value={`${money(result.inflationAdjustedMonthlyNeed)}/mo`}
          subValue="Your income need at retirement"
          testId={TESTIDS.retirementOutput('inflation-adjusted-need')}
        />
        <MetricCard
          label="Income Sustainability"
          value={result.sustainable ? 'Sustainable' : 'At Risk'}
          subValue={`Income lasts to age ${result.incomeSustainedToAge}`}
          testId={TESTIDS.retirementOutput('sustainability')}
        />
      </div>
    </div>
  );
}

/**
 * SIP vs Step-Up SIP results — primary comparison outputs plus the four unique
 * ArthVeda insights (Years Saved, Equivalent SIP, Wealth Acceleration %, Extra
 * Wealth Created). Built from the shared Card / MetricCard primitives.
 */

import { Rocket, Clock, Repeat, Gauge } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import type { StepUpResult } from './stepUpModel';

export interface StepUpSummaryProps {
  result: StepUpResult;
}

export function StepUpSummary({ result }: StepUpSummaryProps) {
  const money = (value: number) => formatCurrency(value, result.currency);

  const uniqueCards = [
    {
      key: 'years-saved',
      icon: <Clock size={22} strokeWidth={1.75} aria-hidden="true" />,
      label: 'Years Saved',
      value: `${result.yearsSaved.toFixed(1)} years`,
      blurb:
        result.yearsSaved > 0
          ? `You reach the same wealth ${result.yearsSaved.toFixed(1)} years earlier than a normal SIP.`
          : 'Add a step-up to reach your target sooner.',
    },
    {
      key: 'equivalent-sip',
      icon: <Repeat size={22} strokeWidth={1.75} aria-hidden="true" />,
      label: 'Equivalent SIP',
      value: `${money(result.equivalentSip)}/mo`,
      blurb: `Without step-up, you would need ${money(result.equivalentSip)}/month to reach the same corpus.`,
    },
    {
      key: 'acceleration',
      icon: <Gauge size={22} strokeWidth={1.75} aria-hidden="true" />,
      label: 'Wealth Acceleration',
      value: `${result.wealthAccelerationPct.toFixed(0)}% faster`,
      blurb: `Your wealth grows ${result.wealthAccelerationPct.toFixed(0)}% faster than a normal SIP.`,
    },
    {
      key: 'extra-wealth',
      icon: <Rocket size={22} strokeWidth={1.75} aria-hidden="true" />,
      label: 'Extra Wealth Created',
      value: money(result.extraWealthCreated),
      blurb: `Step-Up SIP generated an additional ${money(result.extraWealthCreated)}.`,
    },
  ];

  return (
    <div className="space-y-6" data-testid={TESTIDS.stepUpSummary}>
      {/* Headline: step-up corpus vs normal. */}
      <Card className="border-accent bg-mist p-5" data-testid={TESTIDS.stepUpOutput('stepup-corpus')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
              Step-Up SIP Corpus
            </p>
            <p className="font-heading text-3xl font-bold leading-tight text-accent">
              {money(result.stepUpCorpus)}
            </p>
          </div>
          <div className="sm:text-right" data-testid={TESTIDS.stepUpOutput('normal-corpus')}>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
              Normal SIP Corpus
            </p>
            <p className="font-heading text-2xl font-bold leading-tight text-ink">
              {money(result.normalCorpus)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Stepping up creates {money(result.extraWealthCreated)} more wealth — your money grows{' '}
          {result.wealthAccelerationPct.toFixed(0)}% faster.
        </p>
      </Card>

      {/* Primary comparison outputs. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Additional Investment Gains"
          value={money(result.additionalWealthCreated)}
          subValue="Extra returns vs normal SIP"
          testId={TESTIDS.stepUpOutput('additional-wealth')}
        />
        <MetricCard
          label="Difference in Final Corpus"
          value={money(result.differenceInCorpus)}
          subValue="Step-Up minus Normal"
          testId={TESTIDS.stepUpOutput('difference')}
        />
        <MetricCard
          label="Total Invested Amount"
          value={money(result.totalInvested)}
          subValue="Step-Up SIP contributions"
          testId={TESTIDS.stepUpOutput('total-invested')}
        />
        <MetricCard
          label="Investment Gains (Returns Earned)"
          value={money(result.totalGain)}
          subValue="Step-Up SIP returns"
          testId={TESTIDS.stepUpOutput('total-gain')}
        />
        <MetricCard
          label="Wealth Multiplier"
          value={`${result.wealthMultiplier.toFixed(2)}×`}
          subValue="Corpus / invested"
          testId={TESTIDS.stepUpOutput('wealth-multiplier')}
        />
      </div>

      {/* Unique ArthVeda insights. */}
      <div data-testid={TESTIDS.stepUpUnique}>
        <SectionHeading eyebrow="ArthVeda exclusive" title="Unique insights" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {uniqueCards.map((card) => (
            <div
              key={card.key}
              data-testid={TESTIDS.stepUpOutput(card.key)}
              className="rounded-[var(--radius-control)] border border-hairline p-4"
            >
              <div className="flex items-center gap-2 text-accent">
                {card.icon}
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
                  {card.label}
                </span>
              </div>
              <p className="mt-2 font-heading text-2xl font-bold leading-tight text-ink">
                {card.value}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{card.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

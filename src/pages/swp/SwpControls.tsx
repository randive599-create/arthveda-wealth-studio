/**
 * SWP input controls — the dedicated SWP parameter panel.
 *
 * Replaces the generic SIP-oriented parameters on /swp-calculator with the five
 * withdrawal-focused inputs. There is deliberately NO Monthly SIP and NO Annual
 * SIP Step-Up field. Slider ranges stay within the engine's validated bounds.
 */

import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { SliderInput } from '../../components/primitives/SliderInput';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { SWP_CURRENCY, type SwpInputs } from './swpModel';

export interface SwpControlsProps {
  inputs: SwpInputs;
  onChange: (patch: Partial<SwpInputs>) => void;
}

export function SwpControls({ inputs, onChange }: SwpControlsProps) {
  const money = (value: number) => formatCurrency(value, SWP_CURRENCY);

  return (
    <Card className="p-6" data-testid={TESTIDS.swpControls}>
      <SectionHeading
        eyebrow="SWP Inputs"
        title="Your withdrawal plan"
        description="Set your starting corpus, the income you withdraw, and your assumptions to see how long it lasts."
      />

      <div className="mt-6 space-y-6">
        <SliderInput
          label="Initial Corpus"
          value={inputs.initialCorpus}
          min={100_000}
          max={100_000_000}
          step={100_000}
          displayValue={money(inputs.initialCorpus)}
          onChange={(v) => onChange({ initialCorpus: v })}
          hint="The lump sum you start the withdrawal plan with."
          testIdBase="swp-initial-corpus"
        />
        <SliderInput
          label="Monthly Withdrawal"
          value={inputs.monthlyWithdrawal}
          min={0}
          max={1_000_000}
          step={5_000}
          displayValue={money(inputs.monthlyWithdrawal)}
          onChange={(v) => onChange({ monthlyWithdrawal: v })}
          hint="The fixed income you draw each month."
          testIdBase="swp-monthly-withdrawal"
        />
        <SliderInput
          label="Annual Return"
          value={inputs.annualReturnPct}
          min={1}
          max={20}
          step={0.5}
          unit="%"
          displayValue={`${inputs.annualReturnPct}%`}
          onChange={(v) => onChange({ annualReturnPct: v })}
          hint="Expected annual return on the remaining balance."
          testIdBase="swp-return"
        />
        <SliderInput
          label="Inflation"
          value={inputs.inflationPct}
          min={0}
          max={12}
          step={0.5}
          unit="%"
          displayValue={`${inputs.inflationPct}%`}
          onChange={(v) => onChange({ inflationPct: v })}
          hint="Used to show the real value of your withdrawals."
          testIdBase="swp-inflation"
        />
        <SliderInput
          label="Withdrawal Duration"
          value={inputs.durationYears}
          min={5}
          max={40}
          step={1}
          unit="yrs"
          onChange={(v) => onChange({ durationYears: v })}
          hint="How many years you plan to draw an income for."
          testIdBase="swp-duration"
        />
      </div>
    </Card>
  );
}

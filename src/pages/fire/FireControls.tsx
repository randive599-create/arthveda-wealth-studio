/**
 * FIRE input controls — the dedicated FIRE parameter panel.
 *
 * Replaces the generic Wealth Projection parameters on /fire-calculator with
 * the nine FIRE-specific inputs. Each is a labelled slider+number control
 * (reusing the shared SliderInput primitive). Slider ranges stay within the
 * engine's validated bounds so the underlying projection is never silently
 * re-clamped.
 */

import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { SliderInput } from '../../components/primitives/SliderInput';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { FIRE_CURRENCY, type FireInputs } from './fireModel';

export interface FireControlsProps {
  inputs: FireInputs;
  onChange: (patch: Partial<FireInputs>) => void;
}

export function FireControls({ inputs, onChange }: FireControlsProps) {
  const money = (value: number) => formatCurrency(value, FIRE_CURRENCY);
  const horizonInvalid = inputs.targetFireAge <= inputs.currentAge;

  return (
    <Card className="p-6" data-testid={TESTIDS.fireControls}>
      <SectionHeading
        eyebrow="FIRE Inputs"
        title="Your FIRE plan"
        description="Tune your age, savings and assumptions to see your path to financial independence."
      />

      <div className="mt-6 space-y-6">
        <SliderInput
          label="Current Age"
          value={inputs.currentAge}
          min={18}
          max={65}
          step={1}
          unit="yrs"
          onChange={(v) => onChange({ currentAge: v })}
          testIdBase="fire-current-age"
        />
        <SliderInput
          label="Target FIRE Age"
          value={inputs.targetFireAge}
          min={25}
          max={75}
          step={1}
          unit="yrs"
          onChange={(v) => onChange({ targetFireAge: v })}
          hint={
            horizonInvalid
              ? 'Target FIRE age should be greater than your current age.'
              : undefined
          }
          testIdBase="fire-target-age"
        />
        <SliderInput
          label="Current Net Worth"
          value={inputs.currentNetWorth}
          min={0}
          max={50_000_000}
          step={100_000}
          displayValue={money(inputs.currentNetWorth)}
          onChange={(v) => onChange({ currentNetWorth: v })}
          testIdBase="fire-net-worth"
        />
        <SliderInput
          label="Monthly Investment"
          value={inputs.monthlyInvestment}
          min={0}
          max={1_000_000}
          step={5_000}
          displayValue={money(inputs.monthlyInvestment)}
          onChange={(v) => onChange({ monthlyInvestment: v })}
          testIdBase="fire-monthly-investment"
        />
        <SliderInput
          label="Annual Step-Up"
          value={inputs.annualStepUpPct}
          min={0}
          max={25}
          step={1}
          unit="%"
          displayValue={`${inputs.annualStepUpPct}%`}
          onChange={(v) => onChange({ annualStepUpPct: v })}
          hint="Yearly increase to your monthly investment."
          testIdBase="fire-step-up"
        />
        <SliderInput
          label="Expected Return"
          value={inputs.expectedReturnPct}
          min={1}
          max={20}
          step={0.5}
          unit="%"
          displayValue={`${inputs.expectedReturnPct}%`}
          onChange={(v) => onChange({ expectedReturnPct: v })}
          hint="Pre-FIRE annual portfolio return."
          testIdBase="fire-return"
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
          hint="Grows your future expenses and FIRE number."
          testIdBase="fire-inflation"
        />
        <SliderInput
          label="Annual Expenses Today"
          value={inputs.annualExpensesToday}
          min={100_000}
          max={10_000_000}
          step={50_000}
          displayValue={money(inputs.annualExpensesToday)}
          onChange={(v) => onChange({ annualExpensesToday: v })}
          hint="Your yearly living costs in today's money."
          testIdBase="fire-expenses"
        />
        <SliderInput
          label="Safe Withdrawal Rate"
          value={inputs.safeWithdrawalRatePct}
          min={2}
          max={8}
          step={0.25}
          unit="%"
          displayValue={`${inputs.safeWithdrawalRatePct}%`}
          onChange={(v) => onChange({ safeWithdrawalRatePct: v })}
          hint="Share of corpus withdrawn yearly in retirement (4% rule)."
          testIdBase="fire-swr"
        />
      </div>
    </Card>
  );
}

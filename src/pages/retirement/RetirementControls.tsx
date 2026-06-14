/**
 * Retirement input controls — the dedicated retirement parameter panel.
 *
 * Exposes the eight retirement planning inputs (current age, retirement age,
 * current corpus, monthly investment, step-up, return, inflation, and the
 * desired monthly retirement income). Slider ranges stay within engine bounds.
 */

import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { SliderInput } from '../../components/primitives/SliderInput';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { RETIREMENT_CURRENCY, type RetirementInputs } from './retirementModel';

export interface RetirementControlsProps {
  inputs: RetirementInputs;
  onChange: (patch: Partial<RetirementInputs>) => void;
}

export function RetirementControls({ inputs, onChange }: RetirementControlsProps) {
  const money = (value: number) => formatCurrency(value, RETIREMENT_CURRENCY);
  const ageInvalid = inputs.retirementAge <= inputs.currentAge;

  return (
    <Card className="p-6" data-testid={TESTIDS.retirementControls}>
      <SectionHeading
        eyebrow="Retirement Inputs"
        title="Your retirement plan"
        description="Set your ages, savings and the income you want in retirement to see if you are on track."
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
          testIdBase="retirement-current-age"
        />
        <SliderInput
          label="Retirement Age"
          value={inputs.retirementAge}
          min={40}
          max={75}
          step={1}
          unit="yrs"
          onChange={(v) => onChange({ retirementAge: v })}
          hint={ageInvalid ? 'Retirement age should be greater than your current age.' : undefined}
          testIdBase="retirement-retirement-age"
        />
        <SliderInput
          label="Current Corpus"
          value={inputs.currentCorpus}
          min={0}
          max={50_000_000}
          step={100_000}
          displayValue={money(inputs.currentCorpus)}
          onChange={(v) => onChange({ currentCorpus: v })}
          hint="Retirement savings you have already built."
          testIdBase="retirement-current-corpus"
        />
        <SliderInput
          label="Monthly Investment"
          value={inputs.monthlyInvestment}
          min={0}
          max={500_000}
          step={1_000}
          displayValue={money(inputs.monthlyInvestment)}
          onChange={(v) => onChange({ monthlyInvestment: v })}
          testIdBase="retirement-monthly-investment"
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
          testIdBase="retirement-step-up"
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
          hint="Annual return, before and during retirement."
          testIdBase="retirement-return"
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
          hint="Grows your future income need and retirement costs."
          testIdBase="retirement-inflation"
        />
        <SliderInput
          label="Expected Monthly Retirement Income"
          value={inputs.expectedMonthlyIncome}
          min={10_000}
          max={1_000_000}
          step={5_000}
          displayValue={money(inputs.expectedMonthlyIncome)}
          onChange={(v) => onChange({ expectedMonthlyIncome: v })}
          hint="In today's money — grown by inflation to your retirement age."
          testIdBase="retirement-income"
        />
      </div>
    </Card>
  );
}

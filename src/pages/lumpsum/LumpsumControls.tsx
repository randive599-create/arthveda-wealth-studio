/**
 * Lumpsum input controls — the dedicated Lumpsum parameter panel.
 *
 * Replaces the generic SIP-oriented parameters on /lumpsum-calculator with the
 * one-time-investment inputs. There is deliberately NO Monthly SIP and NO
 * Annual Step-Up field. (An Inflation control is included to drive the
 * Inflation-Adjusted Corpus output.) Slider ranges stay within engine bounds.
 */

import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { SliderInput } from '../../components/primitives/SliderInput';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { LUMPSUM_CURRENCY, type LumpsumInputs } from './lumpsumModel';

export interface LumpsumControlsProps {
  inputs: LumpsumInputs;
  onChange: (patch: Partial<LumpsumInputs>) => void;
}

export function LumpsumControls({ inputs, onChange }: LumpsumControlsProps) {
  const money = (value: number) => formatCurrency(value, LUMPSUM_CURRENCY);

  return (
    <Card className="p-6" data-testid={TESTIDS.lumpsumControls}>
      <SectionHeading
        eyebrow="Lumpsum Inputs"
        title="Your one-time investment"
        description="Enter a single investment and your assumptions to project how it grows over time."
      />

      <div className="mt-6 space-y-6">
        <SliderInput
          label="One-Time Investment"
          value={inputs.oneTimeInvestment}
          min={0}
          max={100_000_000}
          step={100_000}
          displayValue={money(inputs.oneTimeInvestment)}
          onChange={(v) => onChange({ oneTimeInvestment: v })}
          hint="The single amount you invest today."
          testIdBase="lumpsum-investment"
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
          hint="Assumed annual rate of return."
          testIdBase="lumpsum-return"
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
          hint="Used to show the real value of your corpus."
          testIdBase="lumpsum-inflation"
        />
        <SliderInput
          label="Duration"
          value={inputs.durationYears}
          min={1}
          max={40}
          step={1}
          unit="yrs"
          onChange={(v) => onChange({ durationYears: v })}
          hint="How long the investment stays invested."
          testIdBase="lumpsum-duration"
        />
      </div>
    </Card>
  );
}

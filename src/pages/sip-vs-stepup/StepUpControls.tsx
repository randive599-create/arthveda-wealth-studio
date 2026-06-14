/**
 * SIP vs Step-Up SIP input controls.
 *
 * The three SIP basics plus a step-up method toggle (only one method active at a
 * time). The method-specific field, its presets, and a live "Year 1 … Year 4"
 * progression preview switch with the toggle.
 */

import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { SliderInput } from '../../components/primitives/SliderInput';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import {
  monthlySipForYear,
  stepUpConfigFor,
  STEPUP_AMOUNT_PRESETS,
  STEPUP_CURRENCY,
  STEPUP_DURATION_PRESETS,
  STEPUP_PERCENT_PRESETS,
  STEPUP_SIP_PRESETS,
  type StepUpInputs,
  type StepUpMethod,
} from './stepUpModel';

export interface StepUpControlsProps {
  inputs: StepUpInputs;
  onChange: (patch: Partial<StepUpInputs>) => void;
}

const PRESET_BTN =
  'rounded-[var(--radius-control)] border px-3 py-1.5 font-mono text-[11px] font-medium transition-colors';

function presetClass(active: boolean): string {
  return `${PRESET_BTN} ${
    active
      ? 'border-accent bg-accent text-canvas'
      : 'border-hairline text-ink-secondary hover:bg-mist hover:text-ink'
  }`;
}

export function StepUpControls({ inputs, onChange }: StepUpControlsProps) {
  const money = (value: number) => formatCurrency(value, STEPUP_CURRENCY);
  const config = stepUpConfigFor(inputs);
  const exampleYears = [1, 2, 3, 4].map((year) => ({
    year,
    sip: monthlySipForYear(inputs.monthlySip, year, config),
  }));

  const methodButton = (method: StepUpMethod, label: string) => {
    const active = inputs.method === method;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={active}
        onClick={() => onChange({ method })}
        data-testid={TESTIDS.stepUpMethodOption(method)}
        className={`flex-1 rounded-[var(--radius-control)] border px-3 py-2 text-[13px] font-medium transition-colors ${
          active
            ? 'border-accent bg-accent text-canvas'
            : 'border-hairline text-ink-secondary hover:bg-mist hover:text-ink'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <Card className="p-6" data-testid={TESTIDS.stepUpControls}>
      <SectionHeading
        eyebrow="Comparison Inputs"
        title="Normal vs Step-Up SIP"
        description="Set your SIP basics, then choose one step-up method to compare against a normal SIP."
      />

      <div className="mt-6 space-y-6">
        <div>
          <SliderInput
            label="Monthly SIP Amount"
            value={inputs.monthlySip}
            min={500}
            max={500_000}
            step={500}
            displayValue={money(inputs.monthlySip)}
            onChange={(v) => onChange({ monthlySip: v })}
            testIdBase="stepup-amount"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {STEPUP_SIP_PRESETS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => onChange({ monthlySip: amount })}
                aria-pressed={inputs.monthlySip === amount}
                data-testid={TESTIDS.stepUpAmountPreset(amount)}
                className={presetClass(inputs.monthlySip === amount)}
              >
                {money(amount)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <SliderInput
            label="Investment Duration"
            value={inputs.durationYears}
            min={1}
            max={40}
            step={1}
            unit="yrs"
            onChange={(v) => onChange({ durationYears: v })}
            testIdBase="stepup-duration"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {STEPUP_DURATION_PRESETS.map((years) => (
              <button
                key={years}
                type="button"
                onClick={() => onChange({ durationYears: years })}
                aria-pressed={inputs.durationYears === years}
                data-testid={TESTIDS.stepUpDurationPreset(years)}
                className={presetClass(inputs.durationYears === years)}
              >
                {years} yrs
              </button>
            ))}
          </div>
        </div>

        <SliderInput
          label="Expected Annual Return"
          value={inputs.expectedReturnPct}
          min={1}
          max={20}
          step={0.5}
          unit="%"
          displayValue={`${inputs.expectedReturnPct}%`}
          onChange={(v) => onChange({ expectedReturnPct: v })}
          testIdBase="stepup-return"
        />

        {/* Step-up method toggle */}
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
            Step-Up Method
          </p>
          <div
            role="radiogroup"
            aria-label="Step-up method"
            data-testid={TESTIDS.stepUpMethodToggle}
            className="flex gap-2"
          >
            {methodButton('percentage', 'Percentage Based')}
            {methodButton('amount', 'Fixed Amount Based')}
          </div>
        </div>

        {/* Method-specific field + presets */}
        {inputs.method === 'percentage' ? (
          <div>
            <SliderInput
              label="Annual Step-Up %"
              value={inputs.stepUpPercent}
              min={0}
              max={25}
              step={1}
              unit="%"
              displayValue={`${inputs.stepUpPercent}%`}
              onChange={(v) => onChange({ stepUpPercent: v })}
              testIdBase="stepup-percent"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {STEPUP_PERCENT_PRESETS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onChange({ stepUpPercent: pct })}
                  aria-pressed={inputs.stepUpPercent === pct}
                  data-testid={TESTIDS.stepUpPercentPreset(pct)}
                  className={presetClass(inputs.stepUpPercent === pct)}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <SliderInput
              label="Annual Step-Up Amount"
              value={inputs.stepUpAmount}
              min={0}
              max={50_000}
              step={500}
              displayValue={money(inputs.stepUpAmount)}
              onChange={(v) => onChange({ stepUpAmount: v })}
              testIdBase="stepup-step-amount"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {STEPUP_AMOUNT_PRESETS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => onChange({ stepUpAmount: amount })}
                  aria-pressed={inputs.stepUpAmount === amount}
                  data-testid={TESTIDS.stepUpStepAmountPreset(amount)}
                  className={presetClass(inputs.stepUpAmount === amount)}
                >
                  {money(amount)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live progression example */}
        <div
          className="rounded-[var(--radius-control)] border border-hairline bg-mist p-4"
          data-testid={TESTIDS.stepUpExample}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
            Your monthly SIP progression
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
            {exampleYears.map((row) => (
              <div key={row.year} className="flex flex-col">
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-secondary">
                  Year {row.year}
                </dt>
                <dd className="font-mono text-sm font-semibold text-ink">{money(row.sip)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Card>
  );
}

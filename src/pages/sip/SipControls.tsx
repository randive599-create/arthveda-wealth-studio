/**
 * SIP input controls — the dedicated SIP parameter panel.
 *
 * Basic mode (default) exposes only the three SIP essentials: Monthly SIP
 * Amount, Investment Duration, and Expected Annual Return, plus quick presets.
 * Advanced mode expands to reveal the step-up, inflation, existing corpus and
 * lumpsum inputs. SWP / withdrawal / retirement / FIRE fields are not present.
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { SliderInput } from '../../components/primitives/SliderInput';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import {
  SIP_AMOUNT_PRESETS,
  SIP_CURRENCY,
  SIP_DURATION_PRESETS,
  type SipInputs,
} from './sipModel';

export interface SipControlsProps {
  inputs: SipInputs;
  advanced: boolean;
  onChange: (patch: Partial<SipInputs>) => void;
  onToggleAdvanced: () => void;
}

const PRESET_BTN =
  'rounded-[var(--radius-control)] border px-3 py-1.5 font-mono text-[11px] font-medium transition-colors';

export function SipControls({ inputs, advanced, onChange, onToggleAdvanced }: SipControlsProps) {
  const money = (value: number) => formatCurrency(value, SIP_CURRENCY);

  return (
    <Card className="p-6" data-testid={TESTIDS.sipControls}>
      <SectionHeading
        eyebrow="SIP Inputs"
        title="Your SIP plan"
        description="Enter your monthly SIP, horizon and expected return. Use quick presets to explore fast."
      />

      <div className="mt-6 space-y-6">
        {/* Basic: Monthly SIP */}
        <div>
          <SliderInput
            label="Monthly SIP Amount"
            value={inputs.monthlySip}
            min={500}
            max={500_000}
            step={500}
            displayValue={money(inputs.monthlySip)}
            onChange={(v) => onChange({ monthlySip: v })}
            testIdBase="sip-amount"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {SIP_AMOUNT_PRESETS.map((amount) => {
              const active = inputs.monthlySip === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => onChange({ monthlySip: amount })}
                  aria-pressed={active}
                  data-testid={TESTIDS.sipAmountPreset(amount)}
                  className={`${PRESET_BTN} ${
                    active
                      ? 'border-accent bg-accent text-canvas'
                      : 'border-hairline text-ink-secondary hover:bg-mist hover:text-ink'
                  }`}
                >
                  {money(amount)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic: Duration */}
        <div>
          <SliderInput
            label="Investment Duration"
            value={inputs.durationYears}
            min={1}
            max={40}
            step={1}
            unit="yrs"
            onChange={(v) => onChange({ durationYears: v })}
            testIdBase="sip-duration"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {SIP_DURATION_PRESETS.map((years) => {
              const active = inputs.durationYears === years;
              return (
                <button
                  key={years}
                  type="button"
                  onClick={() => onChange({ durationYears: years })}
                  aria-pressed={active}
                  data-testid={TESTIDS.sipDurationPreset(years)}
                  className={`${PRESET_BTN} ${
                    active
                      ? 'border-accent bg-accent text-canvas'
                      : 'border-hairline text-ink-secondary hover:bg-mist hover:text-ink'
                  }`}
                >
                  {years} yrs
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic: Expected Return */}
        <SliderInput
          label="Expected Annual Return"
          value={inputs.expectedReturnPct}
          min={1}
          max={20}
          step={0.5}
          unit="%"
          displayValue={`${inputs.expectedReturnPct}%`}
          onChange={(v) => onChange({ expectedReturnPct: v })}
          testIdBase="sip-return"
        />

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={onToggleAdvanced}
          aria-expanded={advanced}
          aria-controls="sip-advanced-fields"
          data-testid={TESTIDS.sipAdvancedToggle}
          className="
            flex w-full items-center justify-between rounded-[var(--radius-control)] border border-hairline
            px-4 py-2.5 text-left transition-colors hover:bg-mist
          "
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
            Advanced options
          </span>
          {advanced ? (
            <ChevronUp size={16} strokeWidth={2} aria-hidden="true" className="text-ink-secondary" />
          ) : (
            <ChevronDown
              size={16}
              strokeWidth={2}
              aria-hidden="true"
              className="text-ink-secondary"
            />
          )}
        </button>

        {/* Advanced: step-up, inflation, existing corpus, lumpsum */}
        {advanced ? (
          <div id="sip-advanced-fields" className="space-y-6" data-testid={TESTIDS.sipAdvancedFields}>
            <SliderInput
              label="Annual SIP Step-Up"
              value={inputs.annualStepUpPct}
              min={0}
              max={25}
              step={1}
              unit="%"
              displayValue={`${inputs.annualStepUpPct}%`}
              onChange={(v) => onChange({ annualStepUpPct: v })}
              hint="Increase your SIP each year in line with income."
              testIdBase="sip-stepup"
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
              hint="Used to show your inflation-adjusted (real) wealth."
              testIdBase="sip-inflation"
            />
            <SliderInput
              label="Existing Investment Corpus"
              value={inputs.existingCorpus}
              min={0}
              max={50_000_000}
              step={100_000}
              displayValue={money(inputs.existingCorpus)}
              onChange={(v) => onChange({ existingCorpus: v })}
              hint="Optional — wealth you have already invested."
              testIdBase="sip-existing"
            />
            <SliderInput
              label="Lumpsum Investment"
              value={inputs.lumpsumInvestment}
              min={0}
              max={50_000_000}
              step={100_000}
              displayValue={money(inputs.lumpsumInvestment)}
              onChange={(v) => onChange({ lumpsumInvestment: v })}
              hint="Optional — a one-time amount invested alongside your SIP."
              testIdBase="sip-lumpsum"
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

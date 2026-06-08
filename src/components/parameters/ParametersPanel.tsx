/**
 * ParametersPanel — the complete, production parameter input system.
 *
 * Every control is bound to the Zustand store. Edits flow through the store's
 * `clampInputs` validation before reaching the calculation engine, so the
 * displayed projection always reflects valid inputs in real time. The panel
 * adapts to the selected currency (slider scales, value formatting) and to the
 * plan mode (income controls are disabled in "Accumulation Only").
 *
 * Layout: a single scrollable card grouped into Capital Formation, Growth &
 * Horizon, Income Distribution, and Preferences. Fully responsive — the panel
 * is the sticky 4/12 column on desktop and stacks first on mobile.
 */

import { RotateCcw } from 'lucide-react';
import { useStudioStore } from '../../state/useStudioStore';
import { selectInputs } from '../../state/selectors';
import {
  MAX_DURATION_YEARS,
  MAX_INFLATION_RATE,
  MAX_RETURN_RATE,
  MIN_DURATION_YEARS,
  MIN_INFLATION_RATE,
  MIN_RETURN_RATE,
  MIN_YEAR_INDEX,
} from '../../engine/constants';
import type { Currency, ProjectionMode, StepUpMethod } from '../../engine/types';
import { formatCurrency, formatPercent, moneyScale } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';
import { SliderInput } from '../primitives/SliderInput';
import { Switch } from '../primitives/Switch';
import { ToggleGroup } from '../primitives/ToggleGroup';
import { CurrencySelector } from './CurrencySelector';
import { FieldGroup } from './FieldGroup';
import { StepUpControl } from './StepUpControl';

export function ParametersPanel() {
  const inputs = useStudioStore(selectInputs);
  // Store actions are stable references, so reading them via getState avoids
  // subscribing the panel to unrelated state (e.g. recomputed results).
  const store = useStudioStore.getState();

  const currency: Currency = inputs.currency;
  const scale = moneyScale(currency);
  const money = (value: number) => formatCurrency(value, currency);
  const isIncome = inputs.mode === 'income';

  return (
    <Card className="p-6" data-testid={TESTIDS.parametersPanel}>
      <div className="flex items-start justify-between gap-3">
        <SectionHeading eyebrow="Parameters" title="Plan Inputs" />
        <button
          type="button"
          onClick={() => store.reset()}
          data-testid={TESTIDS.paramReset}
          className="
            inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-hairline
            px-2.5 py-1.5 text-xs font-medium text-ink-secondary transition-colors
            hover:border-accent hover:text-accent
          "
        >
          <RotateCcw size={13} strokeWidth={1.75} aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {/* Preferences: currency + plan mode */}
        <FieldGroup title="Preferences" divided={false}>
          <CurrencySelector value={currency} onChange={(c) => store.setCurrency(c)} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink">Plan Mode</span>
            <ToggleGroup<ProjectionMode>
              ariaLabel="Plan mode"
              value={inputs.mode}
              testId={TESTIDS.modeToggle}
              onChange={(mode) => store.setMode(mode)}
              options={[
                {
                  value: 'accumulation',
                  label: 'Accumulation',
                  testId: TESTIDS.modeOption('accumulation'),
                },
                { value: 'income', label: '+ Income', testId: TESTIDS.modeOption('income') },
              ]}
            />
          </div>
          <p className="text-xs leading-relaxed text-ink-secondary">
            {isIncome
              ? 'Accumulation followed by a withdrawal (income) phase.'
              : 'Pure accumulation and growth — no withdrawals. SIP runs the full horizon.'}
          </p>
        </FieldGroup>

        {/* Capital Formation */}
        <FieldGroup title="Capital Formation Strategy">
          <SliderInput
            label="Lumpsum Investment"
            value={inputs.lumpsum}
            min={0}
            max={scale.lumpsumMax}
            step={scale.moneyStep}
            displayValue={money(inputs.lumpsum)}
            onChange={(v) => store.setInput('lumpsum', v)}
            testIdBase="lumpsum"
          />
          <SliderInput
            label="Monthly SIP"
            value={inputs.monthlySip}
            min={0}
            max={scale.sipMax}
            step={scale.moneyStep}
            displayValue={money(inputs.monthlySip)}
            onChange={(v) => store.setInput('monthlySip', v)}
            testIdBase="monthly-sip"
          />
          <StepUpControl
            subject="SIP"
            config={inputs.sipStepUp}
            onMethodChange={(method: StepUpMethod) => store.setSipStepUp({ method })}
            onPercentageChange={(percentage) => store.setSipStepUp({ percentage })}
            onAmountChange={(amount) => store.setSipStepUp({ amount })}
            formatAmount={money}
            amountMax={scale.stepAmountMax}
            amountStep={scale.stepAmountStep}
            methodTestId={TESTIDS.sipStepUpMethod}
            methodOptionTestId={TESTIDS.sipStepUpMethodOption}
            percentFieldBase="sip-stepup-percent"
            amountFieldBase="sip-stepup-amount"
          />
        </FieldGroup>

        {/* Growth & Horizon */}
        <FieldGroup title="Growth & Horizon">
          <SliderInput
            label="Annual Return Rate"
            value={inputs.annualReturnRate}
            min={MIN_RETURN_RATE}
            max={MAX_RETURN_RATE}
            step={0.5}
            unit="%"
            displayValue={formatPercent(inputs.annualReturnRate)}
            onChange={(v) => store.setInput('annualReturnRate', v)}
            hint="Accumulation and growth phases. 0–100%."
            testIdBase="annual-return"
          />
          <SliderInput
            label="Investment Duration"
            value={inputs.durationYears}
            min={MIN_DURATION_YEARS}
            max={MAX_DURATION_YEARS}
            step={1}
            unit="yrs"
            displayValue={`${inputs.durationYears} yrs`}
            onChange={(v) => store.setInput('durationYears', v)}
            hint="Total horizon. 1–100 years."
            testIdBase="duration"
          />
          <SliderInput
            label="SIP Stop Year"
            value={inputs.sipStopYear}
            min={MIN_YEAR_INDEX}
            max={inputs.durationYears}
            step={1}
            unit="yr"
            displayValue={`Yr ${inputs.sipStopYear}`}
            onChange={(v) => store.setInput('sipStopYear', v)}
            hint="Year contributions stop. Capped at the duration."
            testIdBase="sip-stop-year"
          />
        </FieldGroup>

        {/* Income Distribution */}
        <FieldGroup title="Income Distribution Strategy">
          {!isIncome ? (
            <p className="rounded-[var(--radius-control)] border border-dashed border-hairline bg-mist px-3 py-3 text-xs leading-relaxed text-ink-secondary">
              Withdrawals are disabled in Accumulation mode. Switch Plan Mode to{' '}
              <span className="font-semibold text-ink">+ Income</span> to configure a withdrawal
              phase.
            </p>
          ) : null}
          <SliderInput
            label="Withdrawal Start Year"
            value={inputs.withdrawalStartYear}
            min={inputs.sipStopYear}
            max={inputs.durationYears}
            step={1}
            unit="yr"
            displayValue={`Yr ${inputs.withdrawalStartYear}`}
            disabled={!isIncome}
            onChange={(v) => store.setInput('withdrawalStartYear', v)}
            hint="Must be on or after the SIP Stop Year."
            testIdBase="withdrawal-start-year"
          />
          <SliderInput
            label="Withdrawal Phase Return Rate"
            value={inputs.withdrawalReturnRate}
            min={MIN_RETURN_RATE}
            max={MAX_RETURN_RATE}
            step={0.5}
            unit="%"
            displayValue={formatPercent(inputs.withdrawalReturnRate)}
            disabled={!isIncome}
            onChange={(v) => store.setInput('withdrawalReturnRate', v)}
            hint="Return applied after withdrawals begin. 0–100%."
            testIdBase="withdrawal-return"
          />
          <SliderInput
            label="Monthly SWP Withdrawal"
            value={inputs.monthlySwp}
            min={0}
            max={scale.swpMax}
            step={scale.moneyStep}
            displayValue={money(inputs.monthlySwp)}
            disabled={!isIncome}
            onChange={(v) => store.setInput('monthlySwp', v)}
            hint="Set to zero to let the corpus keep compounding."
            testIdBase="monthly-swp"
          />
          <StepUpControl
            subject="SWP"
            config={inputs.swpStepUp}
            onMethodChange={(method: StepUpMethod) => store.setSwpStepUp({ method })}
            onPercentageChange={(percentage) => store.setSwpStepUp({ percentage })}
            onAmountChange={(amount) => store.setSwpStepUp({ amount })}
            formatAmount={money}
            amountMax={scale.stepAmountMax}
            amountStep={scale.stepAmountStep}
            disabled={!isIncome}
            methodTestId={TESTIDS.swpStepUpMethod}
            methodOptionTestId={TESTIDS.swpStepUpMethodOption}
            percentFieldBase="swp-stepup-percent"
            amountFieldBase="swp-stepup-amount"
          />
        </FieldGroup>

        {/* Inflation */}
        <FieldGroup title="Inflation Adjustment">
          <Switch
            label="Enable Inflation Adjustment"
            description="Show corpus and income in today's purchasing power."
            checked={inputs.inflation.enabled}
            onChange={(enabled) => store.setInflationEnabled(enabled)}
            testId={TESTIDS.inflationToggle}
          />
          <SliderInput
            label="Inflation Rate"
            value={inputs.inflation.rate}
            min={MIN_INFLATION_RATE}
            max={MAX_INFLATION_RATE}
            step={0.5}
            unit="%"
            displayValue={formatPercent(inputs.inflation.rate)}
            disabled={!inputs.inflation.enabled}
            onChange={(v) => store.setInflationRate(v)}
            hint="0–20%."
            testIdBase="inflation-rate"
          />
        </FieldGroup>
      </div>
    </Card>
  );
}

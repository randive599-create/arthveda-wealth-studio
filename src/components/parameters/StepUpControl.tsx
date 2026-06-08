/**
 * StepUpControl — the annual step-up editor used for both SIP and SWP.
 *
 * Presents a Percentage / Fixed Amount method toggle, with the two inputs shown
 * side by side. Only the active method's input is enabled; the inactive one is
 * disabled (greyed) but retains its value so toggling back is lossless. Editing
 * is real time and clamped via the shared SliderInput control.
 */

import type { StepUpConfig, StepUpMethod } from '../../engine/types';
import { MAX_STEPUP_PERCENT, MIN_STEPUP_PERCENT } from '../../engine/constants';
import { formatPercent } from '../../format/currency';
import { ToggleGroup } from '../primitives/ToggleGroup';
import { SliderInput } from '../primitives/SliderInput';

export interface StepUpControlProps {
  /** Human label for the thing being stepped up, e.g. "SIP" or "SWP". */
  subject: string;
  config: StepUpConfig;
  onMethodChange: (method: StepUpMethod) => void;
  onPercentageChange: (value: number) => void;
  onAmountChange: (value: number) => void;
  /** Formatter for the fixed-amount display (currency-aware). */
  formatAmount: (value: number) => string;
  /** Upper bound for the fixed-amount slider (currency-scaled, from caller). */
  amountMax: number;
  amountStep: number;
  disabled?: boolean;
  methodTestId: string;
  methodOptionTestId: (method: string) => string;
  percentFieldBase: string;
  amountFieldBase: string;
}

export function StepUpControl({
  subject,
  config,
  onMethodChange,
  onPercentageChange,
  onAmountChange,
  formatAmount,
  amountMax,
  amountStep,
  disabled = false,
  methodTestId,
  methodOptionTestId,
  percentFieldBase,
  amountFieldBase,
}: StepUpControlProps) {
  const isPercentage = config.method === 'percentage';

  return (
    <div className={disabled ? 'opacity-50' : undefined}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">{subject} Step-Up</span>
        <ToggleGroup<StepUpMethod>
          ariaLabel={`${subject} step-up method`}
          value={config.method}
          disabled={disabled}
          testId={methodTestId}
          onChange={onMethodChange}
          options={[
            { value: 'percentage', label: 'Percentage', testId: methodOptionTestId('percentage') },
            { value: 'fixed', label: 'Fixed Amount', testId: methodOptionTestId('fixed') },
          ]}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <SliderInput
          label="Annual Step-Up (%)"
          value={config.percentage}
          min={MIN_STEPUP_PERCENT}
          max={MAX_STEPUP_PERCENT}
          step={0.5}
          unit="%"
          displayValue={formatPercent(config.percentage)}
          disabled={disabled || !isPercentage}
          onChange={onPercentageChange}
          testIdBase={percentFieldBase}
        />
        <SliderInput
          label="Annual Step-Up (Amount)"
          value={config.amount}
          min={0}
          max={amountMax}
          step={amountStep}
          displayValue={formatAmount(config.amount)}
          disabled={disabled || isPercentage}
          onChange={onAmountChange}
          testIdBase={amountFieldBase}
        />
      </div>
    </div>
  );
}

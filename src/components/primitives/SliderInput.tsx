/**
 * SliderInput — a labelled control pairing a range slider with a linked number
 * input. Both are two views of a single value: moving the slider updates the
 * number, typing in the number moves the slider, and either path calls
 * `onChange` with a clamped, valid number in real time.
 *
 * Editing affordances:
 *   - The number input keeps a local string while focused so the field can be
 *     cleared or partially typed without the store rejecting it. Each valid
 *     keystroke commits a clamped value; on blur an empty/invalid entry snaps
 *     back to the current value.
 *   - The slider always reflects the committed value.
 *
 * Accessibility:
 *   - The label is associated with the number input via `htmlFor`.
 *   - The slider carries an `aria-label` and standard range ARIA attributes.
 *   - A help/validation line is wired through `aria-describedby`.
 */

import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';

export interface SliderInputProps {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Pre-formatted display of the current value shown beside the label. */
  displayValue?: string;
  /** Short suffix shown inside the number field row, e.g. "%" or "yrs". */
  unit?: string;
  /** Optional helper or hint line beneath the control. */
  hint?: ReactNode;
  disabled?: boolean;
  /** Base id used to derive slider/input test ids. */
  testIdBase: string;
}

/** Clamp helper local to the control; the store re-clamps authoritatively. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  displayValue,
  unit,
  hint,
  disabled = false,
  testIdBase,
}: SliderInputProps) {
  const inputId = useId();
  const hintId = useId();
  const [draft, setDraft] = useState<string>(String(value));

  // Keep the editable draft in sync when the value changes from outside
  // (slider drag, shared-link load, reset, or cross-field clamping).
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitFromText = (raw: string) => {
    setDraft(raw);
    if (raw.trim() === '') {
      return;
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      onChange(clamp(parsed, min, max));
    }
  };

  const handleBlur = () => {
    const parsed = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = clamp(parsed, min, max);
    setDraft(String(next));
    onChange(next);
  };

  return (
    <div className={disabled ? 'opacity-50' : undefined}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
        {displayValue ? (
          <span className="font-mono text-sm font-semibold text-ink" aria-hidden="true">
            {displayValue}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={typeof label === 'string' ? label : undefined}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => onChange(clamp(Number(e.target.value), min, max))}
          data-testid={`field-${testIdBase}-slider`}
          className="
            h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline
            accent-[var(--color-accent)] disabled:cursor-not-allowed
          "
        />
        <div className="relative flex w-24 shrink-0 items-center sm:w-28">
          <input
            id={inputId}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={draft}
            disabled={disabled}
            aria-describedby={hint ? hintId : undefined}
            onChange={(e) => commitFromText(e.target.value)}
            onBlur={handleBlur}
            data-testid={`field-${testIdBase}-input`}
            className="
              w-full rounded-[var(--radius-control)] border border-hairline bg-canvas
              px-2.5 py-1.5 text-right font-mono text-sm text-ink outline-none
              focus:border-accent focus:ring-1 focus:ring-accent
              disabled:cursor-not-allowed
              [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
              [&::-webkit-outer-spin-button]:appearance-none
            "
          />
          {unit ? (
            <span className="pointer-events-none ml-1 font-mono text-xs text-ink-secondary">
              {unit}
            </span>
          ) : null}
        </div>
      </div>

      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Switch — an accessible on/off control built on a native button with
 * `role="switch"`. Used for the inflation-adjustment toggle.
 */

import { useId } from 'react';
import type { ReactNode } from 'react';

export interface SwitchProps {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Optional supporting line beneath the label. */
  description?: ReactNode;
  disabled?: boolean;
  testId?: string;
}

export function Switch({ label, checked, onChange, description, disabled = false, testId }: SwitchProps) {
  const labelId = useId();
  const descId = useId();

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <span id={labelId} className="text-sm font-medium text-ink">
          {label}
        </span>
        {description ? (
          <p id={descId} className="mt-0.5 text-xs leading-relaxed text-ink-secondary">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        data-testid={testId}
        className={`
          relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
          transition-colors duration-150 outline-none
          focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? 'bg-accent' : 'bg-invested'}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-canvas transition-transform duration-150
            ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
}

/**
 * ToggleGroup — a segmented, single-select control rendered as an ARIA radio
 * group. Used for the plan-mode selector, currency selector, and the step-up
 * method (Percentage / Fixed Amount) toggles.
 *
 * Keyboard: arrow keys move between options, the selected option is focusable
 * (roving tabindex) and activated with Space/Enter via native button semantics.
 */

import type { ReactNode } from 'react';

export interface ToggleOption<T extends string> {
  value: T;
  label: ReactNode;
  testId?: string;
}

export interface ToggleGroupProps<T extends string> {
  /** Accessible label for the group. */
  ariaLabel: string;
  value: T;
  options: ToggleOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  testId?: string;
  className?: string;
}

export function ToggleGroup<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
  disabled = false,
  testId,
  className,
}: ToggleGroupProps<T>) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    const currentIndex = options.findIndex((o) => o.value === value);
    if (currentIndex < 0) {
      return;
    }
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    }
    if (nextIndex !== null) {
      e.preventDefault();
      onChange(options[nextIndex].value);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-testid={testId}
      onKeyDown={handleKeyDown}
      className={`inline-flex rounded-[var(--radius-control)] border border-hairline bg-mist p-0.5 ${
        className ?? ''
      }`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            data-testid={option.testId}
            className={`
              flex-1 rounded-[5px] px-3 py-1.5 text-center text-xs font-semibold
              transition-colors duration-150 disabled:cursor-not-allowed
              ${
                selected
                  ? 'bg-accent text-white'
                  : 'text-ink-secondary hover:text-ink'
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

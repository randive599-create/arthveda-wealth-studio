/**
 * Card 4 — Final Corpus. The decisive focal point of the dashboard.
 *
 * Answers, at a glance, "How much wealth will I have?" To roughly double the
 * visual weight of a standard card it combines: a faint emerald wash, a thick
 * emerald accent border, an emerald top rule, far more generous padding, and
 * the largest number anywhere on the page (display-scale, tight leading). The
 * label is promoted to its own emerald eyebrow with an icon chip.
 */

import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface FinalCorpusCardProps {
  label: string;
  value: string;
  /** Optional inflation-adjusted (present value) line. */
  subValue?: ReactNode;
  testId?: string;
}

export function FinalCorpusCard({ label, value, subValue, testId }: FinalCorpusCardProps) {
  return (
    <div
      data-testid={testId}
      className="
        relative overflow-hidden rounded-[var(--radius-card)] border-2 border-accent
        bg-[var(--color-accent-wash)] p-8 sm:p-10
      "
    >
      {/* Emerald top rule reinforces the focal hierarchy. */}
      <span className="absolute inset-x-0 top-0 h-1 bg-accent" aria-hidden="true" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-control)] bg-accent text-white">
            <ArrowUpRight size={16} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent sm:text-sm">
            {label}
          </p>
        </div>
      </div>

      <p
        className="
          mt-7 font-mono text-5xl font-semibold leading-[0.95] tracking-[-0.02em]
          text-ink sm:text-6xl lg:text-7xl
        "
      >
        {value}
      </p>

      {subValue ? (
        <p className="mt-4 font-mono text-base text-ink-secondary sm:text-lg">{subValue}</p>
      ) : null}
    </div>
  );
}

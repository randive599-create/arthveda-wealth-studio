/**
 * Standard dashboard metric card (Cards 1–3).
 *
 * A small mono eyebrow label, a large monospace value, and an optional
 * sub-line. Values are pre-formatted by the caller so this stays presentational.
 */

import type { ReactNode } from 'react';
import { Card } from '../primitives/Card';

export interface MetricCardProps {
  label: string;
  value: string;
  /** Optional secondary line, e.g. an inflation-adjusted figure or a year tag. */
  subValue?: ReactNode;
  /** Optional leading icon (lucide). */
  icon?: ReactNode;
  testId?: string;
}

export function MetricCard({ label, value, subValue, icon, testId }: MetricCardProps) {
  return (
    <Card className="flex h-full min-w-0 flex-col justify-between p-5" data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
          {label}
        </p>
        {icon ? <span className="text-ink-secondary">{icon}</span> : null}
      </div>
      <div className="mt-6 min-w-0">
        {/* break-words guards against clipping if a value ever exceeds the
            column; font sizes are unchanged so desktop typography is intact. */}
        <p className="font-mono text-xl font-semibold leading-tight text-ink break-words sm:text-2xl">
          {value}
        </p>
        {subValue ? (
          <p className="mt-1 font-mono text-xs text-ink-secondary">{subValue}</p>
        ) : null}
      </div>
    </Card>
  );
}

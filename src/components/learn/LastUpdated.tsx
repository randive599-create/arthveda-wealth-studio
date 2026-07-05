/**
 * "Last updated" line for Learn articles — a small transparency/E-E-A-T signal.
 * Exports a shared date formatter reused by the article hero.
 */

import { CalendarClock } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Format an ISO `YYYY-MM-DD` date as e.g. "1 July 2026". Falls back to the raw string. */
export function formatLearnDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return iso;
  }
  const [, y, m, d] = match;
  const month = MONTHS[Number(m) - 1] ?? '';
  return `${Number(d)} ${month} ${y}`;
}

export interface LastUpdatedProps {
  date: string;
  className?: string;
}

export function LastUpdated({ date, className }: LastUpdatedProps) {
  return (
    <p
      className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary ${className ?? ''}`}
    >
      <CalendarClock size={13} strokeWidth={1.75} aria-hidden="true" />
      Last updated: {formatLearnDate(date)}
    </p>
  );
}

/**
 * Wealth Journey Timeline derivation.
 *
 * Produces the ordered set of lifecycle milestones for the projection:
 *
 *   - 'start'       Investment Start (Year 0)
 *   - 'sipStop'     SIP Stop (end of sipStopYear)
 *   - 'withdrawal'  Withdrawal Start (start of withdrawalStartYear) — income mode only
 *   - 'final'       Final Projection Year (end of durationYears)
 *
 * The timeline adapts to the plan mode: in accumulation mode the withdrawal
 * node is omitted entirely (no empty states). Each node carries the corpus,
 * cumulative investment, and cumulative withdrawal at that point so the UI can
 * present meaningful planning context without recomputing anything.
 */

import type { ProjectionInputs, YearRow } from './types';

export type TimelineNodeKind = 'start' | 'sipStop' | 'withdrawal' | 'final';

export interface TimelineNode {
  kind: TimelineNodeKind;
  /** Display name, e.g. "Investment Start". */
  label: string;
  /** Calendar year of the node (0 for the start). */
  year: number;
  /** Years elapsed from Year 0 to this node. */
  yearsFromStart: number;
  /** Corpus at this node. */
  corpus: number;
  /** Cumulative capital invested by this node. */
  totalInvested: number;
  /** Cumulative amount withdrawn by this node. */
  totalWithdrawn: number;
}

/** Year-end snapshot for a given 1-based calendar year, clamped to the range. */
function yearEnd(yearly: YearRow[], year: number): YearRow {
  const index = Math.min(Math.max(year, 1), yearly.length) - 1;
  return yearly[index];
}

/** Snapshot at the start of a calendar year = the end of the previous year. */
function yearStart(
  yearly: YearRow[],
  year: number,
): { corpus: number; totalInvested: number; totalWithdrawn: number } {
  if (year <= 1) {
    return { corpus: 0, totalInvested: 0, totalWithdrawn: 0 };
  }
  const prev = yearEnd(yearly, year - 1);
  return {
    corpus: prev.corpus,
    totalInvested: prev.totalInvested,
    totalWithdrawn: prev.totalWithdrawn,
  };
}

/**
 * Build the lifecycle timeline from the year-end snapshots.
 */
export function buildTimeline(inputs: ProjectionInputs, yearly: YearRow[]): TimelineNode[] {
  const nodes: TimelineNode[] = [];

  // Investment Start — Year 0, before any growth. Lumpsum is already committed.
  nodes.push({
    kind: 'start',
    label: 'Investment Start',
    year: 0,
    yearsFromStart: 0,
    corpus: inputs.lumpsum,
    totalInvested: inputs.lumpsum,
    totalWithdrawn: 0,
  });

  // SIP Stop — end of sipStopYear.
  const sipStop = yearEnd(yearly, inputs.sipStopYear);
  nodes.push({
    kind: 'sipStop',
    label: 'SIP Stop',
    year: inputs.sipStopYear,
    yearsFromStart: inputs.sipStopYear,
    corpus: sipStop.corpus,
    totalInvested: sipStop.totalInvested,
    totalWithdrawn: sipStop.totalWithdrawn,
  });

  // Withdrawal Start — only in income mode, at the start of withdrawalStartYear.
  if (inputs.mode === 'income') {
    const start = yearStart(yearly, inputs.withdrawalStartYear);
    nodes.push({
      kind: 'withdrawal',
      label: 'Withdrawal Start',
      year: inputs.withdrawalStartYear,
      yearsFromStart: Math.max(0, inputs.withdrawalStartYear - 1),
      corpus: start.corpus,
      totalInvested: start.totalInvested,
      totalWithdrawn: start.totalWithdrawn,
    });
  }

  // Final Projection Year — end of the horizon.
  const final = yearEnd(yearly, inputs.durationYears);
  nodes.push({
    kind: 'final',
    label: 'Final Projection Year',
    year: inputs.durationYears,
    yearsFromStart: inputs.durationYears,
    corpus: final.corpus,
    totalInvested: final.totalInvested,
    totalWithdrawn: final.totalWithdrawn,
  });

  return nodes;
}

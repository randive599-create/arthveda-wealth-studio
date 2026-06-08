/**
 * Pure data layer for the Projection Ledger table.
 *
 * This module contains no React and no I/O. It transforms a `ProjectionResult`
 * into table-ready rows and provides the sort/filter/search/summary/virtual-
 * window helpers used by the table component. Keeping this logic here means the
 * future PDF export can reuse the exact same row shape and totals without
 * duplicating any logic.
 */

import type { Phase, ProjectionResult } from '../../engine/types';

/** One year-row of the projection ledger, with all displayed figures resolved. */
export interface ProjectionTableRow {
  year: number;
  phase: Phase;
  /** SIP contributed during this year (per-year, not cumulative). */
  sipContribution: number;
  /** Cumulative capital invested by the end of this year. */
  totalInvestment: number;
  /** Amount withdrawn during this year (per-year). */
  withdrawal: number;
  /** Investment return generated during this year (per-year delta of cumulative returns). */
  investmentReturn: number;
  /** Corpus at the end of this year. */
  endCorpus: number;
  /** Present-value corpus when inflation is enabled, otherwise null. */
  inflationAdjustedCorpus: number | null;
}

export type SortKey = 'year' | 'sipContribution' | 'withdrawal' | 'investmentReturn' | 'endCorpus';
export type SortDir = 'asc' | 'desc';
export type PhaseFilter = 'all' | 'accumulation' | 'growth' | 'withdrawal';

/** Human-readable phase labels, matching the engine's phase semantics exactly. */
export const PHASE_LABEL: Record<Phase, string> = {
  accumulation: 'Accumulation',
  growth: 'Growth',
  withdrawal: 'Withdrawal',
};

/** Rows beyond this count switch the table body to virtualized rendering. */
export const VIRTUALIZE_THRESHOLD = 100;
/** Fixed row height (px) used by the virtualizer for spacer math. */
export const ROW_HEIGHT = 44;

/**
 * Build the ledger rows from a projection result.
 *
 * Per-year investment return is the delta of the cumulative `returns` series so
 * that the per-year figures sum exactly to the final cumulative return. The
 * inflation column is populated from the parallel `inflation` series (matched
 * by index) only when inflation is enabled.
 */
export function buildProjectionRows(result: ProjectionResult): ProjectionTableRow[] {
  const { yearly, inflation } = result;
  let previousReturns = 0;

  return yearly.map((row, index) => {
    const investmentReturn = row.returns - previousReturns;
    previousReturns = row.returns;
    return {
      year: row.year,
      phase: row.phase,
      sipContribution: row.sipAnnual,
      totalInvestment: row.totalInvested,
      withdrawal: row.swpAnnual,
      investmentReturn,
      endCorpus: row.corpus,
      inflationAdjustedCorpus: inflation ? inflation[index].realCorpus : null,
    };
  });
}

/** The numeric accessor for a sort key. */
function sortValue(row: ProjectionTableRow, key: SortKey): number {
  switch (key) {
    case 'year':
      return row.year;
    case 'sipContribution':
      return row.sipContribution;
    case 'withdrawal':
      return row.withdrawal;
    case 'investmentReturn':
      return row.investmentReturn;
    case 'endCorpus':
      return row.endCorpus;
  }
}

/**
 * Return a new array sorted by the given key and direction. The sort is stable
 * (ties retain their original order) and never mutates the input.
 */
export function sortRows(
  rows: ProjectionTableRow[],
  key: SortKey,
  dir: SortDir,
): ProjectionTableRow[] {
  const factor = dir === 'asc' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const diff = sortValue(a.row, key) - sortValue(b.row, key);
      if (diff !== 0) {
        return diff * factor;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.row);
}

/** Filter rows by phase. `'all'` returns every row. */
export function filterRows(rows: ProjectionTableRow[], phase: PhaseFilter): ProjectionTableRow[] {
  if (phase === 'all') {
    return rows;
  }
  return rows.filter((row) => row.phase === phase);
}

/**
 * Quick year search. The first integer found in the query is matched against
 * the year (so "Year 10", "10", and " 20 " all work). An empty/whitespace query
 * returns all rows; a non-empty query with no integer returns no rows.
 */
export function searchRows(rows: ProjectionTableRow[], query: string): ProjectionTableRow[] {
  const trimmed = query.trim();
  if (trimmed === '') {
    return rows;
  }
  const match = trimmed.match(/\d+/);
  if (!match) {
    return [];
  }
  const year = Number.parseInt(match[0], 10);
  return rows.filter((row) => row.year === year);
}

/** Always-visible footer totals for the ledger. */
export interface TableSummary {
  totalInvestment: number;
  totalWithdrawal: number;
  totalReturns: number;
  finalCorpus: number;
}

/**
 * Compute the summary totals. Investment and final corpus are read from the
 * last (chronologically final) row; withdrawals and returns are summed across
 * all rows. Pass the FULL chronological row set (not a filtered subset) so the
 * totals describe the whole projection.
 */
export function computeTableSummary(rows: ProjectionTableRow[]): TableSummary {
  if (rows.length === 0) {
    return { totalInvestment: 0, totalWithdrawal: 0, totalReturns: 0, finalCorpus: 0 };
  }
  const last = rows[rows.length - 1];
  let totalWithdrawal = 0;
  let totalReturns = 0;
  for (const row of rows) {
    totalWithdrawal += row.withdrawal;
    totalReturns += row.investmentReturn;
  }
  return {
    totalInvestment: last.totalInvestment,
    totalWithdrawal,
    totalReturns,
    finalCorpus: last.endCorpus,
  };
}

/** A computed virtual window over a fixed-height row list. */
export interface VirtualWindow {
  start: number;
  end: number;
  topPad: number;
  bottomPad: number;
}

/**
 * Compute the slice of rows to render for a virtualized, fixed-row-height list,
 * along with the top/bottom spacer heights that preserve the scrollbar extent.
 */
export function computeWindow(
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  rowCount: number,
  overscan = 8,
): VirtualWindow {
  if (rowHeight <= 0 || rowCount <= 0) {
    return { start: 0, end: rowCount, topPad: 0, bottomPad: 0 };
  }
  const clamp = (n: number) => Math.min(Math.max(n, 0), rowCount);
  const start = clamp(Math.floor(scrollTop / rowHeight) - overscan);
  const visible = Math.ceil(viewportHeight / rowHeight);
  const end = clamp(start + visible + overscan * 2);
  return {
    start,
    end,
    topPad: start * rowHeight,
    bottomPad: (rowCount - end) * rowHeight,
  };
}

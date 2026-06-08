import { describe, expect, it } from 'vitest';
import { buildProjection } from '../../../engine';
import { formatCurrency } from '../../../format/currency';
import { makeInputs } from '../../../engine/__tests__/factory';
import {
  buildProjectionRows,
  computeTableSummary,
  computeWindow,
  filterRows,
  searchRows,
  sortRows,
  VIRTUALIZE_THRESHOLD,
} from '../projectionRows';

function incomeResult() {
  return buildProjection(
    makeInputs({
      mode: 'income',
      lumpsum: 500_000,
      monthlySip: 25_000,
      sipStepUp: { method: 'percentage', percentage: 10, amount: 0 },
      annualReturnRate: 12,
      durationYears: 30,
      sipStopYear: 20,
      withdrawalStartYear: 25,
      withdrawalReturnRate: 8,
      monthlySwp: 100_000,
      inflation: { enabled: true, rate: 6 },
    }),
  );
}

describe('buildProjectionRows', () => {
  const rows = buildProjectionRows(incomeResult());

  it('produces one row per projection year', () => {
    expect(rows).toHaveLength(30);
    expect(rows[0].year).toBe(1);
    expect(rows[29].year).toBe(30);
  });

  it('per-year investment returns sum to the final cumulative return', () => {
    const result = incomeResult();
    const summed = rows.reduce((acc, r) => acc + r.investmentReturn, 0);
    expect(summed).toBeCloseTo(result.summary.totalReturns, 2);
  });

  it('includes inflation-adjusted corpus when inflation is enabled', () => {
    expect(rows[0].inflationAdjustedCorpus).not.toBeNull();
  });

  it('omits inflation-adjusted corpus when inflation is disabled', () => {
    const noInflation = buildProjectionRows(
      buildProjection(makeInputs({ durationYears: 10, sipStopYear: 10, inflation: { enabled: false, rate: 0 } })),
    );
    expect(noInflation[0].inflationAdjustedCorpus).toBeNull();
  });

  it('marks phases consistent with the engine', () => {
    expect(rows[0].phase).toBe('accumulation');
    expect(rows[21].phase).toBe('growth');
    expect(rows[24].phase).toBe('withdrawal');
  });
});

describe('sortRows', () => {
  const rows = buildProjectionRows(incomeResult());

  it('sorts by year ascending and descending without mutating input', () => {
    const asc = sortRows(rows, 'year', 'asc');
    const desc = sortRows(rows, 'year', 'desc');
    expect(asc[0].year).toBe(1);
    expect(desc[0].year).toBe(30);
    // original untouched
    expect(rows[0].year).toBe(1);
  });

  it('sorts by end corpus descending', () => {
    const desc = sortRows(rows, 'endCorpus', 'desc');
    for (let i = 1; i < desc.length; i += 1) {
      expect(desc[i - 1].endCorpus).toBeGreaterThanOrEqual(desc[i].endCorpus);
    }
  });

  it('sorts by withdrawal ascending', () => {
    const asc = sortRows(rows, 'withdrawal', 'asc');
    for (let i = 1; i < asc.length; i += 1) {
      expect(asc[i - 1].withdrawal).toBeLessThanOrEqual(asc[i].withdrawal);
    }
  });

  it('is stable for equal keys', () => {
    // Many early years have zero withdrawal; their relative order must hold.
    const asc = sortRows(rows, 'withdrawal', 'asc');
    const zeroYears = asc.filter((r) => r.withdrawal === 0).map((r) => r.year);
    const sortedZeroYears = [...zeroYears].sort((a, b) => a - b);
    expect(zeroYears).toEqual(sortedZeroYears);
  });
});

describe('filterRows', () => {
  const rows = buildProjectionRows(incomeResult());

  it('returns all rows for the "all" filter', () => {
    expect(filterRows(rows, 'all')).toHaveLength(30);
  });

  it('returns only rows of the selected phase', () => {
    const accumulation = filterRows(rows, 'accumulation');
    expect(accumulation.every((r) => r.phase === 'accumulation')).toBe(true);
    const withdrawal = filterRows(rows, 'withdrawal');
    expect(withdrawal.every((r) => r.phase === 'withdrawal')).toBe(true);
    expect(withdrawal.length).toBeGreaterThan(0);
  });
});

describe('searchRows', () => {
  const rows = buildProjectionRows(incomeResult());

  it('returns all rows for an empty query', () => {
    expect(searchRows(rows, '   ')).toHaveLength(30);
  });

  it('matches a plain year number', () => {
    expect(searchRows(rows, '10').map((r) => r.year)).toEqual([10]);
  });

  it('extracts the year from a phrase like "Year 20"', () => {
    expect(searchRows(rows, 'Year 20').map((r) => r.year)).toEqual([20]);
  });

  it('returns no rows for a non-numeric query', () => {
    expect(searchRows(rows, 'abc')).toHaveLength(0);
  });

  it('returns no rows for an out-of-range year', () => {
    expect(searchRows(rows, '999')).toHaveLength(0);
  });
});

describe('computeTableSummary', () => {
  it('reconciles with the projection summary', () => {
    const result = incomeResult();
    const summary = computeTableSummary(buildProjectionRows(result));
    expect(summary.totalInvestment).toBeCloseTo(result.summary.totalInvestment, 2);
    expect(summary.totalWithdrawal).toBeCloseTo(result.summary.totalWithdrawn, 2);
    expect(summary.totalReturns).toBeCloseTo(result.summary.totalReturns, 2);
    expect(summary.finalCorpus).toBeCloseTo(result.summary.finalCorpus, 2);
  });

  it('returns zeros for an empty row set', () => {
    expect(computeTableSummary([])).toEqual({
      totalInvestment: 0,
      totalWithdrawal: 0,
      totalReturns: 0,
      finalCorpus: 0,
    });
  });
});

describe('currency formatting (shared system)', () => {
  it('formats per the active currency', () => {
    expect(formatCurrency(1_000_000, 'INR')).toContain('₹');
    expect(formatCurrency(1_000_000, 'USD')).toContain('$');
    expect(formatCurrency(1_000_000, 'EUR')).toContain('€');
  });
});

describe('computeWindow (virtualization math)', () => {
  it('windows a long list with overscan and correct spacers', () => {
    const rowCount = 200;
    const win = computeWindow(0, 480, 44, rowCount);
    expect(win.start).toBe(0);
    expect(win.end).toBeGreaterThan(0);
    expect(win.end).toBeLessThan(rowCount);
    expect(win.topPad).toBe(0);
    expect(win.bottomPad).toBe((rowCount - win.end) * 44);
  });

  it('advances the window as the user scrolls', () => {
    const win = computeWindow(44 * 50, 480, 44, 200);
    expect(win.start).toBeGreaterThan(0);
    expect(win.topPad).toBe(win.start * 44);
  });

  it('only triggers above the virtualization threshold', () => {
    expect(VIRTUALIZE_THRESHOLD).toBe(100);
    // At or below the threshold, the window covers the whole list (no spacers).
    const atThreshold = computeWindow(0, 480, 44, VIRTUALIZE_THRESHOLD);
    expect(atThreshold.topPad).toBe(0);
    // Above the threshold, the window is a strict subset of the rows.
    const above = computeWindow(0, 480, 44, VIRTUALIZE_THRESHOLD + 80);
    expect(above.end).toBeLessThan(VIRTUALIZE_THRESHOLD + 80);
  });
});

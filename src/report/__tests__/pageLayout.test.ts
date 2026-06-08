import { describe, expect, it } from 'vitest';
import {
  columnOffsets,
  contentHeight,
  contentWidth,
  ledgerRowsPerPage,
  paginateLedger,
} from '../pageLayout';

describe('page geometry', () => {
  it('computes positive content dimensions within A4', () => {
    expect(contentWidth()).toBeGreaterThan(0);
    expect(contentWidth()).toBeLessThan(595.28);
    expect(contentHeight()).toBeGreaterThan(0);
  });
});

describe('ledgerRowsPerPage', () => {
  it('fits more rows on continuation pages than on the first (title) page', () => {
    const { firstPage, otherPages } = ledgerRowsPerPage(120);
    expect(otherPages).toBeGreaterThan(0);
    expect(firstPage).toBeLessThanOrEqual(otherPages);
  });
});

describe('paginateLedger', () => {
  it('returns no pages for zero rows', () => {
    expect(paginateLedger(0)).toEqual([]);
  });

  it('covers every row exactly once with contiguous ranges', () => {
    const rowCount = 100;
    const pages = paginateLedger(rowCount, 120);
    expect(pages[0].start).toBe(0);
    expect(pages[pages.length - 1].end).toBe(rowCount);
    for (let i = 1; i < pages.length; i += 1) {
      expect(pages[i].start).toBe(pages[i - 1].end);
    }
  });

  it('paginates a 100-year ledger across multiple pages', () => {
    const pages = paginateLedger(100, 120);
    expect(pages.length).toBeGreaterThan(1);
    // No page exceeds the continuation-page capacity.
    const { otherPages } = ledgerRowsPerPage(120);
    for (const page of pages) {
      expect(page.end - page.start).toBeLessThanOrEqual(otherPages);
    }
  });

  it('keeps a short ledger on a single page', () => {
    const pages = paginateLedger(10, 120);
    expect(pages).toHaveLength(1);
    expect(pages[0]).toEqual({ start: 0, end: 10 });
  });
});

describe('columnOffsets', () => {
  it('produces ascending left edges, one per column', () => {
    const offsets = columnOffsets([1, 1.4, 1, 1, 1, 1, 1]);
    expect(offsets).toHaveLength(7);
    for (let i = 1; i < offsets.length; i += 1) {
      expect(offsets[i]).toBeGreaterThan(offsets[i - 1]);
    }
  });
});

/**
 * Pure A4 page geometry and ledger pagination math for the PDF report.
 *
 * No jsPDF, no DOM. All measurements are in PDF points (pt), the unit jsPDF
 * uses (1pt = 1/72"). A4 is 595.28 x 841.89 pt. Keeping the geometry and the
 * "how many ledger rows fit on a page" calculation here makes pagination
 * deterministic and unit-testable independently of the renderer.
 */

/** A4 page dimensions in points. */
export const A4 = {
  width: 595.28,
  height: 841.89,
} as const;

/** Uniform content margins in points. */
export const MARGIN = {
  top: 56,
  bottom: 56,
  left: 48,
  right: 48,
} as const;

/** Vertical space reserved for the repeating page footer. */
export const FOOTER_HEIGHT = 28;

/** Height of a single ledger table row in points. */
export const LEDGER_ROW_HEIGHT = 18;
/** Height of the repeated ledger header row in points. */
export const LEDGER_HEADER_HEIGHT = 22;

/** The usable content width between the left and right margins. */
export function contentWidth(): number {
  return A4.width - MARGIN.left - MARGIN.right;
}

/** The y-coordinate at which body content starts. */
export function contentTop(): number {
  return MARGIN.top;
}

/** The y-coordinate below which content must not extend (above the footer). */
export function contentBottom(): number {
  return A4.height - MARGIN.bottom - FOOTER_HEIGHT;
}

/** The usable content height for a full page (excluding margins and footer). */
export function contentHeight(): number {
  return contentBottom() - contentTop();
}

/**
 * The number of ledger data rows that fit on a page, given the vertical space
 * already consumed on the first ledger page (e.g. a section title). Subsequent
 * pages assume only the repeated header consumes space.
 *
 * @param spaceUsedOnFirstPage points already used above the table on page 1.
 */
export function ledgerRowsPerPage(spaceUsedOnFirstPage = 0): {
  firstPage: number;
  otherPages: number;
} {
  const available = contentHeight();
  const firstAvailable = available - spaceUsedOnFirstPage - LEDGER_HEADER_HEIGHT;
  const otherAvailable = available - LEDGER_HEADER_HEIGHT;
  return {
    firstPage: Math.max(0, Math.floor(firstAvailable / LEDGER_ROW_HEIGHT)),
    otherPages: Math.max(1, Math.floor(otherAvailable / LEDGER_ROW_HEIGHT)),
  };
}

/**
 * Partition `rowCount` ledger rows into page-sized chunks (as [start, end)
 * index ranges). The first page may hold fewer rows because a title sits above
 * the table; all subsequent pages hold `otherPages` rows.
 */
export function paginateLedger(
  rowCount: number,
  spaceUsedOnFirstPage = 0,
): { start: number; end: number }[] {
  if (rowCount <= 0) {
    return [];
  }
  const { firstPage, otherPages } = ledgerRowsPerPage(spaceUsedOnFirstPage);
  const pages: { start: number; end: number }[] = [];

  let index = 0;
  // First ledger page (may be smaller). If nothing fits above the title, fall
  // back to a full page so we never produce a zero-row page.
  const firstCapacity = firstPage > 0 ? firstPage : otherPages;
  pages.push({ start: 0, end: Math.min(rowCount, firstCapacity) });
  index = Math.min(rowCount, firstCapacity);

  while (index < rowCount) {
    const end = Math.min(rowCount, index + otherPages);
    pages.push({ start: index, end });
    index = end;
  }

  return pages;
}

/**
 * Compute evenly-weighted column x-offsets (left edges) for a table, given a
 * set of relative column weights and the available content width. The first
 * column is left-aligned; the renderer right-aligns numeric columns within
 * their cell using the next column's edge.
 */
export function columnOffsets(weights: number[], width = contentWidth()): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  const offsets: number[] = [];
  let x = MARGIN.left;
  for (const weight of weights) {
    offsets.push(x);
    x += (weight / total) * width;
  }
  return offsets;
}

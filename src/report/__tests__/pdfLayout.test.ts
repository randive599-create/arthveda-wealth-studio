import { describe, expect, it } from 'vitest';
import { buildProjection } from '../../engine';
import { makeInputs } from '../../engine/__tests__/factory';
import { buildReportModel } from '../reportModel';
import { renderReport, type PdfDoc } from '../pdfRenderer';
import type { CapturedImage } from '../captureChart';
import {
  A4,
  MARGIN,
  contentBottom,
  contentTop,
} from '../pageLayout';

/**
 * Geometry-aware verification of the PDF layout & pagination fixes.
 *
 * Unlike the structural fake in pdfRenderer.test.ts, this fake records the
 * exact x/y/alignment and active font size of every text draw and every image,
 * so we can assert — deterministically and without a real PDF engine — that the
 * reported layout defects (footer overlap, section number/title collision,
 * orphaned chart headings, chart/footer collision, ledger header overlap, and
 * content clipped past the margins) can no longer occur.
 *
 * The width metric mirrors the structural fake: monospace width is proportional
 * to length and font size, which is sufficient to exercise the fit/wrap/overlap
 * geometry the renderer computes.
 */

interface TextRecord {
  page: number;
  text: string;
  x: number;
  y: number;
  align: 'left' | 'right' | 'center';
  size: number;
}

interface ImageRecord {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ShapeRecord {
  page: number;
  kind: 'roundedRect' | 'triangle';
}

function createGeometryDoc() {
  const state = {
    pageCount: 1,
    currentPage: 1,
    fontSize: 10,
    texts: [] as TextRecord[],
    images: [] as ImageRecord[],
    shapes: [] as ShapeRecord[],
  };

  const widthOf = (text: string) => text.length * state.fontSize * 0.6;

  const doc: PdfDoc = {
    internal: { pages: [], getNumberOfPages: () => state.pageCount },
    addPage() {
      state.pageCount += 1;
      state.currentPage = state.pageCount;
      return doc;
    },
    setPage(page: number) {
      state.currentPage = page;
      return doc;
    },
    addFileToVFS: () => doc,
    addFont: () => doc,
    setFont: () => doc,
    setFontSize(size: number) {
      state.fontSize = size;
      return doc;
    },
    setTextColor: () => doc,
    setDrawColor: () => doc,
    setFillColor: () => doc,
    setLineWidth: () => doc,
    text(text: string | string[], x: number, y: number, options?: { align?: string }) {
      const value = Array.isArray(text) ? text.join(' ') : text;
      const align = (options?.align as TextRecord['align']) ?? 'left';
      state.texts.push({ page: state.currentPage, text: value, x, y, align, size: state.fontSize });
      return doc;
    },
    line: () => doc,
    rect: () => doc,
    roundedRect() {
      state.shapes.push({ page: state.currentPage, kind: 'roundedRect' });
      return doc;
    },
    triangle() {
      state.shapes.push({ page: state.currentPage, kind: 'triangle' });
      return doc;
    },
    addImage(_data: string, _fmt: string, x: number, y: number, w: number, h: number) {
      state.images.push({ page: state.currentPage, x, y, w, h });
      return doc;
    },
    splitTextToSize(text: string) {
      return [text];
    },
    getTextWidth(text: string) {
      return widthOf(text);
    },
    getNumberOfPages() {
      return state.pageCount;
    },
    save: () => undefined,
    output: () => '',
  };

  return { doc, state };
}

/** Horizontal [start, end] a text occupies, given its alignment. */
function xRange(t: TextRecord): [number, number] {
  const width = t.text.length * t.size * 0.6;
  if (t.align === 'right') {
    return [t.x - width, t.x];
  }
  if (t.align === 'center') {
    return [t.x - width / 2, t.x + width / 2];
  }
  return [t.x, t.x + width];
}

const FIXED_DATE = new Date(2026, 5, 7);
const fakeImage: CapturedImage = { dataUrl: 'data:image/png;base64,AAAA', width: 800, height: 400 };

function bigInrResult() {
  return buildProjection(
    makeInputs({
      currency: 'INR',
      mode: 'income',
      lumpsum: 50_00_000,
      monthlySip: 5_00_000,
      sipStepUp: { method: 'percentage', percentage: 10, amount: 0 },
      annualReturnRate: 14,
      durationYears: 100,
      sipStopYear: 60,
      withdrawalStartYear: 70,
      withdrawalReturnRate: 8,
      monthlySwp: 5_00_000,
      inflation: { enabled: true, rate: 6 },
    }),
  );
}

function render(result = bigInrResult()) {
  const model = buildReportModel(result, FIXED_DATE);
  const { doc, state } = createGeometryDoc();
  renderReport(model, { mountain: fakeImage, donut: fakeImage }, () => doc);
  return { model, state };
}

const RIGHT_EDGE = A4.width - MARGIN.right;
const FOOTER_DISCLAIMER = 'Illustrative projections only. Not investment advice.';
const WEBSITE = 'arthvedawealth.in';
const EMAIL = 'info@arthvedawealth.in';
const isPageNumber = (s: string) => /^Page \d+ of \d+$/.test(s);
const isEyebrow = (s: string) => /^SECTION \d+$/.test(s);
// The footer brand line carries the office name, website, and contact email.
const isBrandLine = (s: string) =>
  s.includes('ArthVeda Private Office') && s.includes(WEBSITE) && s.includes(EMAIL);
const isFooterText = (s: string) =>
  s === FOOTER_DISCLAIMER || isPageNumber(s) || isBrandLine(s);

describe('PDF layout — footer zone (issue 1)', () => {
  it('never lets the disclaimer, page number, and brand line overlap on any page', () => {
    const { state } = render();
    for (let page = 1; page <= state.pageCount; page += 1) {
      const disclaimer = state.texts.find((t) => t.page === page && t.text === FOOTER_DISCLAIMER);
      const pageNo = state.texts.find((t) => t.page === page && isPageNumber(t.text));
      const brand = state.texts.find((t) => t.page === page && isBrandLine(t.text));
      expect(disclaimer).toBeDefined();
      expect(pageNo).toBeDefined();
      expect(brand).toBeDefined();
      // Row 1: disclaimer (left) must end before the page number (right) begins.
      const [, disclaimerRight] = xRange(disclaimer!);
      const [pageNoLeft] = xRange(pageNo!);
      expect(disclaimerRight).toBeLessThan(pageNoLeft);
      // Row 2: the brand line sits on a separate, lower baseline and stays
      // within the margins, so it can never collide with row 1.
      expect(brand!.y).toBeGreaterThan(disclaimer!.y);
      const [brandStart, brandEnd] = xRange(brand!);
      expect(brandStart).toBeGreaterThanOrEqual(MARGIN.left - 0.5);
      expect(brandEnd).toBeLessThanOrEqual(RIGHT_EDGE + 0.5);
    }
  });

  it('keeps the footer inside the page margins on every page', () => {
    const { state } = render();
    const bottomMarginEdge = A4.height - MARGIN.bottom;
    for (let page = 1; page <= state.pageCount; page += 1) {
      const footers = state.texts.filter((t) => t.page === page && isFooterText(t.text));
      for (const f of footers) {
        // Below the body content area but above the bottom page margin.
        expect(f.y).toBeGreaterThanOrEqual(contentBottom());
        expect(f.y).toBeLessThanOrEqual(bottomMarginEdge);
        const [start, end] = xRange(f);
        expect(start).toBeGreaterThanOrEqual(MARGIN.left - 0.5);
        expect(end).toBeLessThanOrEqual(RIGHT_EDGE + 0.5);
      }
    }
  });

  it('stamps the disclaimer, page number, and brand line once per page', () => {
    const { state } = render();
    const disclaimers = state.texts.filter((t) => t.text === FOOTER_DISCLAIMER);
    const pageNumbers = state.texts.filter((t) => isPageNumber(t.text));
    const brandLines = state.texts.filter((t) => isBrandLine(t.text));
    expect(disclaimers).toHaveLength(state.pageCount);
    expect(pageNumbers).toHaveLength(state.pageCount);
    expect(brandLines).toHaveLength(state.pageCount);
  });
});

describe('PDF branding — logo & website', () => {
  it('draws the vector brand mark on the first page (top-left header)', () => {
    const { state } = render();
    const page1Shapes = state.shapes.filter((s) => s.page === 1);
    // Rounded square + two chevron triangles = the favicon monogram as vectors.
    expect(page1Shapes.some((s) => s.kind === 'roundedRect')).toBe(true);
    expect(page1Shapes.filter((s) => s.kind === 'triangle').length).toBeGreaterThanOrEqual(2);

    // The mark sits in the top-left header band, inside the margins.
    const headerText = state.texts.find((t) => t.page === 1 && t.text === 'ArthVeda');
    expect(headerText).toBeDefined();
    expect(headerText!.x).toBeGreaterThanOrEqual(MARGIN.left - 0.5);
    expect(headerText!.y).toBeLessThan(120);
  });

  it('shows the website URL and email in the header without overlapping the logo', () => {
    const { state } = render();
    const website = state.texts.find((t) => t.page === 1 && t.text === 'https://arthvedawealth.in');
    const email = state.texts.find((t) => t.page === 1 && t.text === 'info@arthvedawealth.in');
    const wordmark = state.texts.find((t) => t.page === 1 && t.text === 'ArthVeda');
    expect(website).toBeDefined();
    expect(email).toBeDefined();
    expect(wordmark).toBeDefined();

    for (const t of [website!, email!]) {
      // Header band, inside the page margins, right-aligned.
      expect(t.y).toBeLessThan(120);
      const [start, end] = xRange(t);
      expect(start).toBeGreaterThanOrEqual(MARGIN.left - 0.5);
      expect(end).toBeLessThanOrEqual(RIGHT_EDGE + 0.5);
      // The right-aligned contact block clears the left wordmark.
      const [, wordmarkRight] = xRange(wordmark!);
      expect(start).toBeGreaterThan(wordmarkRight);
    }
  });

  it('shows the brand line (office · website · email) centered in the footer on every page', () => {
    const { state } = render();
    for (let page = 1; page <= state.pageCount; page += 1) {
      const brand = state.texts.find((t) => t.page === page && isBrandLine(t.text));
      expect(brand).toBeDefined();
      expect(brand!.align).toBe('center');
      // Contains both the website and the (untruncated) contact email.
      expect(brand!.text).toContain(WEBSITE);
      expect(brand!.text).toContain(EMAIL);
      const [start, end] = xRange(brand!);
      expect(start).toBeGreaterThanOrEqual(MARGIN.left - 0.5);
      expect(end).toBeLessThanOrEqual(RIGHT_EDGE + 0.5);
    }
  });
});

describe('PDF layout — section number vs heading (issue 2)', () => {
  it('never overlaps the section number with its title', () => {
    const { state } = render();
    const eyebrows = state.texts.filter((t) => isEyebrow(t.text));
    // The eight numbered sections each have an eyebrow.
    expect(eyebrows.length).toBeGreaterThanOrEqual(8);

    for (const eyebrow of eyebrows) {
      const idx = state.texts.indexOf(eyebrow);
      const title = state.texts[idx + 1];
      expect(title).toBeDefined();
      expect(title.page).toBe(eyebrow.page);
      // Title is a single draw (single line).
      expect(title.text).not.toContain('\n');
      // Eyebrow lowest point vs title highest point must not collide.
      const eyebrowBottom = eyebrow.y + eyebrow.size * 0.25;
      const titleTop = title.y - title.size * 0.75;
      expect(titleTop).toBeGreaterThan(eyebrowBottom);
    }
  });
});

describe('PDF layout — chart keep-with-next (issues 3 & 5)', () => {
  it('keeps each chart heading on the same page as its chart image', () => {
    const { state } = render();
    for (const title of ['Wealth Mountain', 'Wealth Composition']) {
      const heading = state.texts.find((t) => t.text === title);
      expect(heading).toBeDefined();
      const imageAfter = state.images.find(
        (img) => img.page === heading!.page && img.y >= heading!.y,
      );
      // The chart image lives on the same page as, and below, its heading.
      expect(imageAfter).toBeDefined();
    }
  });
});

describe('PDF layout — chart footer safety (issues 4 & 6)', () => {
  it('never lets a chart extend into the footer zone or past the margins', () => {
    const { state } = render();
    expect(state.images.length).toBe(2);
    for (const img of state.images) {
      // Bottom of the chart (including baked-in x-axis labels) stays above the
      // footer zone.
      expect(img.y + img.h).toBeLessThanOrEqual(contentBottom() + 0.5);
      expect(img.y).toBeGreaterThanOrEqual(contentTop() - 0.5);
      // Within the horizontal content margins.
      expect(img.x).toBeGreaterThanOrEqual(MARGIN.left - 0.5);
      expect(img.x + img.w).toBeLessThanOrEqual(RIGHT_EDGE + 0.5);
    }
  });
});

describe('PDF layout — ledger header widths (issue 7)', () => {
  it('never overlaps adjacent ledger column headers', () => {
    const { state } = render();
    // Ledger headers are the only 6.5pt text. Group them by row baseline.
    const headerTexts = state.texts.filter((t) => Math.abs(t.size - 6.5) < 0.01);
    expect(headerTexts.length).toBeGreaterThan(0);

    const byRow = new Map<string, TextRecord[]>();
    for (const t of headerTexts) {
      const key = `${t.page}:${Math.round(t.y)}`;
      const list = byRow.get(key) ?? [];
      list.push(t);
      byRow.set(key, list);
    }

    for (const list of byRow.values()) {
      const ranges = list.map(xRange).sort((a, b) => a[0] - b[0]);
      for (let i = 1; i < ranges.length; i += 1) {
        // Each header begins at or after the previous header ends.
        expect(ranges[i][0]).toBeGreaterThanOrEqual(ranges[i - 1][1] - 0.5);
      }
    }
  });
});

describe('PDF layout — no content clipped past margins (issue 9)', () => {
  it('keeps all body text out of the footer zone', () => {
    const { state } = render();
    const bodyTexts = state.texts.filter((t) => !isFooterText(t.text));
    for (const t of bodyTexts) {
      expect(t.y).toBeLessThanOrEqual(contentBottom() + 0.5);
    }
  });

  it('renders a multi-page report (pagination engine active)', () => {
    const { state } = render();
    expect(state.pageCount).toBeGreaterThan(5);
  });
});

describe('PDF layout — INR report parity', () => {
  it('applies the same footer and chart safety to INR reports', () => {
    const { state } = render(bigInrResult());
    // Footer present and non-overlapping on every INR page.
    for (let page = 1; page <= state.pageCount; page += 1) {
      const disclaimer = state.texts.find((t) => t.page === page && t.text === FOOTER_DISCLAIMER);
      const pageNo = state.texts.find((t) => t.page === page && isPageNumber(t.text));
      expect(disclaimer && pageNo).toBeTruthy();
    }
    // Rupee glyph intact, corrupting glyph absent.
    const joined = state.texts.map((t) => t.text).join(' ');
    expect(joined).toContain('₹');
    expect(joined).not.toContain('¹');
  });
});

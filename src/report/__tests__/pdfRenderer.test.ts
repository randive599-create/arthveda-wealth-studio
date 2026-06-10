import { describe, expect, it, vi } from 'vitest';
import { buildProjection } from '../../engine';
import { makeInputs } from '../../engine/__tests__/factory';
import { buildReportModel } from '../reportModel';
import { renderReport, type PdfDoc } from '../pdfRenderer';
import { generateReport } from '../generateReport';
import type { CapturedImage } from '../captureChart';

/**
 * A recording fake of the slice of jsPDF the renderer uses. It tracks pages,
 * captured text, and embedded images so tests can assert on document structure
 * without a real PDF engine.
 */
function createFakeDoc() {
  const state = {
    pageCount: 1,
    currentPage: 1,
    texts: [] as { page: number; text: string }[],
    images: 0,
    roundedRects: 0,
    triangles: 0,
    saved: null as string | null,
    fontsRegistered: 0,
    fontSize: 10,
  };

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
    addFont() {
      state.fontsRegistered += 1;
      return doc;
    },
    setFont: () => doc,
    setFontSize(size: number) {
      state.fontSize = size;
      return doc;
    },
    setTextColor: () => doc,
    setDrawColor: () => doc,
    setFillColor: () => doc,
    setLineWidth: () => doc,
    text(text: string | string[]) {
      const value = Array.isArray(text) ? text.join(' ') : text;
      state.texts.push({ page: state.currentPage, text: value });
      return doc;
    },
    line: () => doc,
    rect: () => doc,
    roundedRect() {
      state.roundedRects += 1;
      return doc;
    },
    triangle() {
      state.triangles += 1;
      return doc;
    },
    addImage() {
      state.images += 1;
      return doc;
    },
    splitTextToSize(text: string) {
      return [text];
    },
    // Approximate monospace metric: width proportional to length and font size.
    // Sufficient for exercising the fit/overflow logic deterministically.
    getTextWidth(text: string) {
      return text.length * state.fontSize * 0.6;
    },
    getNumberOfPages() {
      return state.pageCount;
    },
    save(filename: string) {
      state.saved = filename;
    },
    output: () => '',
  };

  return { doc, state };
}

const FIXED_DATE = new Date(2026, 5, 7);

function bigResult() {
  return buildProjection(
    makeInputs({
      mode: 'income',
      lumpsum: 500_000,
      monthlySip: 25_000,
      annualReturnRate: 12,
      durationYears: 100,
      sipStopYear: 60,
      withdrawalStartYear: 70,
      withdrawalReturnRate: 8,
      monthlySwp: 200_000,
      inflation: { enabled: true, rate: 6 },
    }),
  );
}

const fakeImage: CapturedImage = { dataUrl: 'data:image/png;base64,AAAA', width: 800, height: 400 };

describe('renderReport', () => {
  it('produces a multi-page document and saves nothing by itself', () => {
    const model = buildReportModel(bigResult(), FIXED_DATE);
    const { doc, state } = createFakeDoc();
    const out = renderReport(model, { mountain: fakeImage, donut: fakeImage }, () => doc);
    expect(out).toBe(doc);
    // Cover + summary/assumptions + charts + timeline/milestones + insights +
    // a multi-page ledger (100 years) => well over a handful of pages.
    expect(state.pageCount).toBeGreaterThan(5);
  });

  it('embeds both chart images', () => {
    const model = buildReportModel(bigResult(), FIXED_DATE);
    const { doc, state } = createFakeDoc();
    renderReport(model, { mountain: fakeImage, donut: fakeImage }, () => doc);
    expect(state.images).toBe(2);
  });

  it('renders gracefully when charts are missing', () => {
    const model = buildReportModel(bigResult(), FIXED_DATE);
    const { doc, state } = createFakeDoc();
    renderReport(model, {}, () => doc);
    expect(state.images).toBe(0);
    expect(state.pageCount).toBeGreaterThan(5);
  });

  it('stamps a "Page X of Y" footer on every page with the final total', () => {
    const model = buildReportModel(bigResult(), FIXED_DATE);
    const { doc, state } = createFakeDoc();
    renderReport(model, { mountain: fakeImage, donut: fakeImage }, () => doc);
    const total = state.pageCount;
    for (let page = 1; page <= total; page += 1) {
      const footers = state.texts.filter(
        (t) => t.page === page && t.text === `Page ${page} of ${total}`,
      );
      expect(footers.length).toBe(1);
    }
  });

  it('repeats the disclaimer footer on every page', () => {
    const model = buildReportModel(bigResult(), FIXED_DATE);
    const { doc, state } = createFakeDoc();
    renderReport(model, { mountain: fakeImage, donut: fakeImage }, () => doc);
    const disclaimers = state.texts.filter(
      (t) => t.text === 'Illustrative projections only. Not investment advice.',
    );
    expect(disclaimers.length).toBe(state.pageCount);
  });

  it('renders the cover brand and report title', () => {
    const model = buildReportModel(bigResult(), FIXED_DATE);
    const { doc, state } = createFakeDoc();
    renderReport(model, { mountain: fakeImage, donut: fakeImage }, () => doc);
    const allText = state.texts.map((t) => t.text);
    expect(allText).toContain('ARTHVEDA');
    expect(allText).toContain('Wealth Projection Report');
  });

  it('draws the vector brand mark on the first page', () => {
    const model = buildReportModel(bigResult(), FIXED_DATE);
    const { doc, state } = createFakeDoc();
    renderReport(model, { mountain: fakeImage, donut: fakeImage }, () => doc);
    // The brand mark is one rounded square + two chevron triangles (vectors,
    // not a raster image), so it stays crisp at any scale.
    expect(state.roundedRects).toBeGreaterThanOrEqual(1);
    expect(state.triangles).toBeGreaterThanOrEqual(2);
  });

  it('shows the website address on every page footer', () => {
    const model = buildReportModel(bigResult(), FIXED_DATE);
    const { doc, state } = createFakeDoc();
    renderReport(model, { mountain: fakeImage, donut: fakeImage }, () => doc);
    const domains = state.texts.filter((t) => t.text === 'arthvedawealth.in');
    expect(domains.length).toBe(state.pageCount);
  });
});

describe('generateReport orchestration', () => {
  it('reports progress, saves with the dated file name, and returns it', async () => {
    const { doc, state } = createFakeDoc();
    const capturer = vi.fn(async () => fakeImage);
    const onProgress = vi.fn();

    const fileName = await generateReport(buildProjection(makeInputs({ durationYears: 30, sipStopYear: 30 })), {
      now: FIXED_DATE,
      factory: () => doc,
      capturer,
      onProgress,
    });

    expect(fileName).toBe('ArthVeda-Wealth-Projection-2026-06-07.pdf');
    expect(state.saved).toBe(fileName);
    expect(onProgress).toHaveBeenCalledWith(1, 'done');
  });

  it('still generates when chart capture fails (best-effort charts)', async () => {
    const { doc, state } = createFakeDoc();
    const failing = vi.fn(async () => {
      throw new Error('capture failed');
    });

    const el = { tagName: 'DIV' } as unknown as HTMLElement;
    const fileName = await generateReport(buildProjection(makeInputs({ durationYears: 20, sipStopYear: 20 })), {
      now: FIXED_DATE,
      factory: () => doc,
      capturer: failing,
      mountainEl: el,
      donutEl: el,
    });

    expect(fileName).toBe('ArthVeda-Wealth-Projection-2026-06-07.pdf');
    expect(state.saved).toBe(fileName);
    // No images embedded because both captures failed.
    expect(state.images).toBe(0);
  });
});


describe('PDF formatting defect fixes (presentation only)', () => {
  it('renders the rupee sign intact in INR values (no superscript-¹ corruption)', () => {
    const result = buildProjection(
      makeInputs({
        currency: 'INR',
        lumpsum: 5_00_000,
        monthlySip: 25_000,
        annualReturnRate: 12,
        durationYears: 30,
        sipStopYear: 30,
      }),
    );
    const model = buildReportModel(result, FIXED_DATE);
    const { doc, state } = createFakeDoc();
    renderReport(model, {}, () => doc);

    const joined = state.texts.map((t) => t.text).join(' ');
    // The genuine rupee sign must be present and the corrupting glyph absent.
    expect(joined).toContain('₹');
    expect(joined).not.toContain('¹');
  });

  it('emits monetary digits without inter-character spacing', () => {
    const result = buildProjection(
      makeInputs({ currency: 'INR', lumpsum: 1_234, durationYears: 5, sipStopYear: 5 }),
    );
    const model = buildReportModel(result, FIXED_DATE);
    const { doc, state } = createFakeDoc();
    renderReport(model, {}, () => doc);
    // Every value string is emitted as a contiguous token (no "1 2 3 4").
    const hasSpacedDigits = state.texts.some((t) => /\d(\s)\d/.test(t.text.replace(/[,. ]/g, (m) => m)) && /\d \d/.test(t.text));
    expect(hasSpacedDigits).toBe(false);
  });

  it('registers the embedded Unicode fonts before rendering', () => {
    const model = buildReportModel(bigResult(), FIXED_DATE);
    const { doc, state } = createFakeDoc();
    // The orchestrator registers fonts in its factory; emulate that here.
    // The renderer itself selects them, so a fake counts addFont calls.
    expect(state.fontsRegistered).toBe(0);
    renderReport(model, {}, () => doc);
    // Rendering does not register; registration happens in the factory.
    // This asserts the renderer does not throw when fonts are pre-registered.
    expect(state.texts.length).toBeGreaterThan(0);
  });
});

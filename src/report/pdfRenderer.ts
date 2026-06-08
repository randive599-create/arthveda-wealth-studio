/**
 * jsPDF report renderer.
 *
 * Draws the multi-page Wealth Projection Report from a pure `ReportModel` using
 * jsPDF's native vector API for all text and tables (crisp, small files,
 * deterministic pagination) and embeds the two pre-captured chart images.
 *
 * The renderer is decoupled from jsPDF construction via an injected factory so
 * it can be exercised against a lightweight fake in tests without bundling a
 * real PDF engine into the test environment. The footer (brand, page X of Y,
 * disclaimer) is stamped on every page in a final pass once the total page
 * count is known.
 */

import {
  A4,
  MARGIN,
  columnOffsets,
  contentBottom,
  contentTop,
  contentWidth,
  LEDGER_HEADER_HEIGHT,
  LEDGER_ROW_HEIGHT,
  paginateLedger,
} from './pageLayout';
import type { CapturedImage } from './captureChart';
import type { ReportLedgerRow, ReportModel, ReportPair } from './reportModel';
import { REPORT_FONT_MONO, REPORT_FONT_SERIF } from './registerFonts';

const INK = '#111827';
const INK_SECONDARY = '#4b5563';
const ACCENT = '#064e3b';
const HAIRLINE = '#e5e7eb';
const MIST = '#f9fafb';

// Embedded Unicode font families (registered on the document by the factory).
// MONO renders values, labels, body, and the ledger; SERIF renders headings.
// Both contain the Indian Rupee glyph, so currency text is never corrupted.
const FONT_MONO = REPORT_FONT_MONO;
const FONT_SERIF = REPORT_FONT_SERIF;

/**
 * Find the largest font size (between `max` and `min`) at which `text` fits
 * within `maxWidth`, using the mono font. Guarantees values never overflow.
 * Falls back to `min` if even that does not fit (caller's column is sized so
 * this is rare; `min` keeps it readable).
 */
function fitFontSize(
  doc: PdfDoc,
  text: string,
  maxWidth: number,
  max: number,
  min: number,
): number {
  for (let size = max; size >= min; size -= 0.5) {
    doc.setFont(FONT_MONO, 'bold').setFontSize(size);
    if (doc.getTextWidth(text) <= maxWidth) {
      return size;
    }
  }
  return min;
}

/**
 * Truncate `text` with an ellipsis so it fits `maxWidth` at the given size.
 * Used for labels (not values) so a long label can never collide with its value.
 */
function fitText(doc: PdfDoc, text: string, maxWidth: number, size: number): string {
  doc.setFont(FONT_MONO, 'normal').setFontSize(size);
  if (doc.getTextWidth(text) <= maxWidth) {
    return text;
  }
  let truncated = text;
  while (truncated.length > 1 && doc.getTextWidth(`${truncated}…`) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

/**
 * The minimal slice of the jsPDF API the renderer relies on. Declaring it as an
 * interface lets tests provide a recording fake without depending on jsPDF's
 * full surface.
 */
export interface PdfDoc {
  internal: { pages: unknown[]; getNumberOfPages?: () => number };
  addPage(): PdfDoc;
  setPage(page: number): PdfDoc;
  addFileToVFS(fileName: string, data: string): unknown;
  addFont(fileName: string, fontName: string, fontStyle: string): unknown;
  setFont(family: string, style?: string): PdfDoc;
  setFontSize(size: number): PdfDoc;
  setTextColor(color: string): PdfDoc;
  setDrawColor(color: string): PdfDoc;
  setFillColor(color: string): PdfDoc;
  setLineWidth(width: number): PdfDoc;
  text(text: string | string[], x: number, y: number, options?: { align?: string }): PdfDoc;
  line(x1: number, y1: number, x2: number, y2: number): PdfDoc;
  rect(x: number, y: number, w: number, h: number, style?: string): PdfDoc;
  addImage(
    data: string,
    format: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ): PdfDoc;
  splitTextToSize(text: string, maxWidth: number): string[];
  getTextWidth(text: string): number;
  getNumberOfPages(): number;
  save(filename: string): void;
  output(type: string): unknown;
}

/** Factory that produces a fresh A4 portrait document (points). */
export type PdfFactory = () => PdfDoc;

/** Chart images captured from the live DOM (optional — omitted in tests). */
export interface ReportCharts {
  mountain?: CapturedImage;
  donut?: CapturedImage;
}

interface Cursor {
  page: number;
  y: number;
}

/** A running renderer that tracks the current page and vertical cursor. */
class ReportWriter {
  private doc: PdfDoc;
  private cursor: Cursor = { page: 1, y: contentTop() };

  constructor(doc: PdfDoc) {
    this.doc = doc;
  }

  get document(): PdfDoc {
    return this.doc;
  }

  /** Remaining vertical space before the footer zone on the current page. */
  private remaining(): number {
    return contentBottom() - this.cursor.y;
  }

  /** Start a new page and reset the cursor to the content top. */
  newPage(): void {
    this.doc.addPage();
    this.cursor.page = this.doc.getNumberOfPages();
    this.cursor.y = contentTop();
  }

  /** Ensure at least `needed` points remain; otherwise break to a new page. */
  ensure(needed: number): void {
    if (this.remaining() < needed) {
      this.newPage();
    }
  }

  /** Advance the vertical cursor by `dy` points. */
  advance(dy: number): void {
    this.cursor.y += dy;
  }

  get y(): number {
    return this.cursor.y;
  }

  set y(value: number) {
    this.cursor.y = value;
  }

  /** Draw a section heading (eyebrow optional) and advance the cursor. */
  sectionTitle(title: string, eyebrow?: string): void {
    this.ensure(48);
    if (eyebrow) {
      this.doc.setFont(FONT_MONO, 'normal').setFontSize(8).setTextColor(ACCENT);
      this.doc.text(eyebrow.toUpperCase(), MARGIN.left, this.cursor.y);
      this.advance(12);
    }
    this.doc.setFont(FONT_SERIF, 'bold').setFontSize(18).setTextColor(INK);
    this.doc.text(title, MARGIN.left, this.cursor.y);
    this.advance(10);
    this.doc.setDrawColor(ACCENT).setLineWidth(1);
    this.doc.line(MARGIN.left, this.cursor.y, MARGIN.left + 40, this.cursor.y);
    this.advance(18);
  }

  /** Draw a two-column label/value table and advance the cursor. */
  pairTable(pairs: ReportPair[]): void {
    const rowHeight = 20;
    const labelX = MARGIN.left + 6;
    const valueX = A4.width - MARGIN.right - 6;
    const maxLabelWidth = (A4.width - MARGIN.left - MARGIN.right) * 0.5 - 12;
    const maxValueWidth = (A4.width - MARGIN.left - MARGIN.right) * 0.5 - 12;
    for (const pair of pairs) {
      this.ensure(rowHeight);
      this.doc.setDrawColor(HAIRLINE).setLineWidth(0.5);
      this.doc.line(
        MARGIN.left,
        this.cursor.y + rowHeight - 6,
        A4.width - MARGIN.right,
        this.cursor.y + rowHeight - 6,
      );
      this.doc.setFont(FONT_MONO, 'normal').setFontSize(10).setTextColor(INK_SECONDARY);
      this.doc.text(fitText(this.doc, pair.label, maxLabelWidth, 10), labelX, this.cursor.y + 8);
      // Values use a fitted font size so large currency figures never overflow
      // into the label column or past the right margin.
      const valueSize = fitFontSize(this.doc, pair.value, maxValueWidth, 10, 7);
      this.doc.setFont(FONT_MONO, 'bold').setFontSize(valueSize).setTextColor(INK);
      this.doc.text(pair.value, valueX, this.cursor.y + 8, { align: 'right' });
      this.advance(rowHeight);
    }
    this.advance(8);
  }

  /** Draw wrapped paragraph text and advance the cursor. */
  paragraph(text: string, size = 10, color = INK_SECONDARY): void {
    this.doc.setFont(FONT_MONO, 'normal').setFontSize(size).setTextColor(color);
    const lines = this.doc.splitTextToSize(text, contentWidth());
    const lineHeight = size * 1.4;
    for (const line of lines) {
      this.ensure(lineHeight);
      this.doc.text(line, MARGIN.left, this.cursor.y);
      this.advance(lineHeight);
    }
  }
}

/** Render the cover page. The writer's first page is reused as the cover. */
function renderCover(w: ReportWriter, model: ReportModel): void {
  const doc = w.document;
  const centerX = A4.width / 2;
  let y = 200;

  doc.setFont(FONT_SERIF, 'bold').setFontSize(40).setTextColor(INK);
  doc.text(model.cover.brand, centerX, y, { align: 'center' });
  y += 26;

  doc.setFont(FONT_MONO, 'normal').setFontSize(11).setTextColor(ACCENT);
  doc.text(model.cover.division, centerX, y, { align: 'center' });
  y += 28;

  doc.setFont(FONT_SERIF, 'normal').setFontSize(18).setTextColor(INK_SECONDARY);
  doc.text(model.cover.product, centerX, y, { align: 'center' });
  y += 40;

  doc.setFont(FONT_MONO, 'normal').setFontSize(10).setTextColor(INK_SECONDARY);
  const tagline = doc.splitTextToSize(model.cover.tagline, contentWidth() - 80);
  for (const line of tagline) {
    doc.text(line, centerX, y, { align: 'center' });
    y += 15;
  }
  y += 40;

  doc.setDrawColor(HAIRLINE).setLineWidth(0.5);
  doc.line(MARGIN.left + 80, y, A4.width - MARGIN.right - 80, y);
  y += 30;

  doc.setFont(FONT_SERIF, 'bold').setFontSize(22).setTextColor(INK);
  doc.text(model.cover.title, centerX, y, { align: 'center' });
  y += 28;

  doc.setFont(FONT_MONO, 'normal').setFontSize(10).setTextColor(INK_SECONDARY);
  doc.text(`Generated ${model.cover.generatedDate}`, centerX, y, { align: 'center' });
  y += 16;
  doc.text(model.cover.currencyLabel, centerX, y, { align: 'center' });
}

/** Render a captured chart image, scaled to fit the content width. */
function renderChart(w: ReportWriter, image: CapturedImage | undefined, caption?: string): void {
  if (!image || image.width <= 0 || image.height <= 0) {
    w.paragraph('Chart preview is unavailable in this export.', 10, INK_SECONDARY);
    return;
  }
  const maxWidth = contentWidth();
  const aspect = image.height / image.width;
  const drawWidth = maxWidth;
  const drawHeight = maxWidth * aspect;

  w.ensure(drawHeight + (caption ? 18 : 0));
  w.document.addImage(image.dataUrl, 'PNG', MARGIN.left, w.y, drawWidth, drawHeight);
  w.advance(drawHeight + 8);

  if (caption) {
    w.paragraph(caption, 10, ACCENT);
  }
}

/** Render the ledger across as many pages as needed, repeating the header. */
function renderLedger(w: ReportWriter, model: ReportModel): void {
  const doc = w.document;
  const columns = model.ledgerColumns;
  const weights = columns.map((_, i) => (i === 1 ? 1.4 : i === 0 ? 0.6 : 1));
  const offsets = columnOffsets(weights);
  const rightEdge = A4.width - MARGIN.right;

  const drawHeader = () => {
    doc.setFillColor(MIST);
    doc.rect(MARGIN.left, w.y, contentWidth(), LEDGER_HEADER_HEIGHT, 'F');
    doc.setFont(FONT_MONO, 'bold').setFontSize(7).setTextColor(INK_SECONDARY);
    columns.forEach((col, i) => {
      const isNumeric = i >= 2;
      const nextEdge = i + 1 < offsets.length ? offsets[i + 1] : rightEdge;
      if (isNumeric) {
        doc.text(col.toUpperCase(), nextEdge - 4, w.y + 14, { align: 'right' });
      } else {
        doc.text(col.toUpperCase(), offsets[i] + 4, w.y + 14);
      }
    });
    w.advance(LEDGER_HEADER_HEIGHT);
  };

  const cellValues = (row: ReportLedgerRow): string[] => {
    const base = [row.year, row.phase, row.sip, row.invested, row.withdrawal, row.returns, row.corpus];
    if (model.inflationEnabled) {
      base.push(row.realCorpus ?? '—');
    }
    return base;
  };

  // Space already used on the first ledger page is the section title block.
  const spaceUsed = w.y - contentTop();
  const pages = paginateLedger(model.ledgerRows.length, spaceUsed);

  pages.forEach((range, pageIndex) => {
    if (pageIndex > 0) {
      w.newPage();
    }
    drawHeader();
    for (let r = range.start; r < range.end; r += 1) {
      const values = cellValues(model.ledgerRows[r]);
      doc.setDrawColor(HAIRLINE).setLineWidth(0.4);
      doc.line(MARGIN.left, w.y + LEDGER_ROW_HEIGHT, rightEdge, w.y + LEDGER_ROW_HEIGHT);
      values.forEach((value, i) => {
        const isNumeric = i >= 2;
        if (isNumeric) {
          const nextEdge = i + 1 < offsets.length ? offsets[i + 1] : rightEdge;
          const cellWidth = nextEdge - offsets[i] - 6;
          const size = fitFontSize(doc, value, cellWidth, 7.5, 5.5);
          doc.setFont(FONT_MONO, 'normal').setFontSize(size).setTextColor(INK);
          doc.text(value, nextEdge - 4, w.y + 12, { align: 'right' });
        } else if (i === 0) {
          doc.setFont(FONT_MONO, 'bold').setFontSize(7.5).setTextColor(INK);
          doc.text(value, offsets[i] + 4, w.y + 12);
        } else {
          const nextEdge = i + 1 < offsets.length ? offsets[i + 1] : rightEdge;
          const cellWidth = nextEdge - offsets[i] - 6;
          doc.setFont(FONT_MONO, 'normal').setFontSize(7).setTextColor(INK_SECONDARY);
          doc.text(fitText(doc, value, cellWidth, 7), offsets[i] + 4, w.y + 12);
        }
      });
      w.advance(LEDGER_ROW_HEIGHT);
    }
  });
}

/** Stamp the repeating footer on every page once the total is known. */
function stampFooters(doc: PdfDoc): void {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    const y = A4.height - MARGIN.bottom + 8;
    doc.setDrawColor(HAIRLINE).setLineWidth(0.5);
    doc.line(MARGIN.left, y - 10, A4.width - MARGIN.right, y - 10);
    doc.setFont(FONT_MONO, 'normal').setFontSize(8).setTextColor(INK_SECONDARY);
    doc.text('ArthVeda · Private Office', MARGIN.left, y);
    doc.text(`Page ${page} of ${total}`, A4.width / 2, y, { align: 'center' });
    doc.text('Illustrative projections only. Not investment advice.', A4.width - MARGIN.right, y, {
      align: 'right',
    });
  }
}

/**
 * Render the full report into a jsPDF document and return it (unsaved).
 *
 * @param model the pure report content.
 * @param charts optional captured chart images.
 * @param factory produces a blank A4 portrait jsPDF document.
 */
export function renderReport(model: ReportModel, charts: ReportCharts, factory: PdfFactory): PdfDoc {
  const doc = factory();
  const w = new ReportWriter(doc);

  // Page 1 — Cover.
  renderCover(w, model);

  // Section 1 — Projection Summary.
  w.newPage();
  w.sectionTitle('Projection Summary', 'Section 1');
  w.pairTable(model.summary);

  // Section 2 — Planning Assumptions.
  w.sectionTitle('Planning Assumptions', 'Section 2');
  w.pairTable(model.assumptions);

  // Section 3 — Wealth Mountain.
  w.newPage();
  w.sectionTitle('Wealth Mountain', 'Section 3');
  renderChart(w, charts.mountain);

  // Section 4 — Wealth Composition.
  w.sectionTitle('Wealth Composition', 'Section 4');
  renderChart(w, charts.donut, model.compositionSentence);

  // Section 5 — Wealth Journey Timeline.
  w.newPage();
  w.sectionTitle('Wealth Journey Timeline', 'Section 5');
  w.pairTable(
    model.timeline.map((node) => ({ label: `${node.event} · ${node.year}`, value: node.corpus })),
  );

  // Section 6 — Milestone Achievement Report.
  w.sectionTitle(model.milestoneTitle, 'Section 6');
  if (model.milestones.length > 0) {
    w.pairTable(
      model.milestones.map((m) => ({
        label: `${m.milestone} · ${m.achievementYear}`,
        value: m.corpus,
      })),
    );
  } else {
    w.paragraph('No wealth milestones are reached within the current projection.');
  }

  // Section 7 — AI Wealth Insights.
  w.newPage();
  w.sectionTitle('AI Wealth Insights', 'Section 7');
  for (const group of model.insightGroups) {
    w.ensure(40);
    w.document.setFont(FONT_MONO, 'normal').setFontSize(9).setTextColor(ACCENT);
    w.document.text(group.title.toUpperCase(), MARGIN.left, w.y);
    w.advance(16);
    for (const insight of group.insights) {
      w.document.setFont(FONT_SERIF, 'bold').setFontSize(11).setTextColor(INK);
      const head = w.document.splitTextToSize(insight.headline, contentWidth());
      for (const line of head) {
        w.ensure(15);
        w.document.text(line, MARGIN.left, w.y);
        w.advance(15);
      }
      w.paragraph(insight.explanation, 9.5, INK_SECONDARY);
      w.advance(8);
    }
    w.advance(6);
  }

  // Section 8 — Projection Ledger.
  w.newPage();
  w.sectionTitle('Projection Ledger', 'Section 8');
  renderLedger(w, model);

  // Footer on every page.
  stampFooters(doc);

  return doc;
}

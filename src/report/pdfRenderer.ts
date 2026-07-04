/**
 * jsPDF report renderer.
 *
 * Draws the multi-page Wealth Projection Report from a pure `ReportModel` using
 * jsPDF's native vector API for all text and tables (crisp, small files,
 * deterministic pagination) and embeds the two pre-captured chart images.
 *
 * The renderer is decoupled from jsPDF construction via an injected factory so
 * it can be exercised against a lightweight fake in tests without bundling a
 * real PDF engine into the test environment. The first-page header carries the
 * ArthVeda brand mark (drawn as native vectors) on the left and the website URL
 * + contact email on the right. The footer is stamped on every page in a final
 * pass inside a dedicated zone: the disclaimer and page number on the first
 * row, and a centered brand line (office · website · email) on the second.
 */

import {
  A4,
  MARGIN,
  CHART_BOTTOM_PADDING,
  columnOffsets,
  contentBottom,
  contentHeight,
  contentTop,
  contentWidth,
  footerZoneTop,
  HEADING_BLOCK_HEIGHT,
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
const EMERALD = '#10b981';
const WHITE = '#ffffff';
const HAIRLINE = '#e5e7eb';
const MIST = '#f9fafb';

/** The official ArthVeda website address, shown in the footer of every page. */
const WEBSITE = 'arthvedawealth.in';
/** Full website URL shown in the first-page report header. */
const WEBSITE_URL = 'https://arthvedawealth.in';
/** Contact email shown in the first-page report header. */
const EMAIL = 'info@arthvedawealth.in';

// Embedded Unicode font families (registered on the document by the factory).
// MONO renders values, labels, body, and the ledger; SERIF renders headings.
// Both contain the Indian Rupee glyph, so currency text is never corrupted.
const FONT_MONO = REPORT_FONT_MONO;
const FONT_SERIF = REPORT_FONT_SERIF;

/**
 * Find the largest font size (between `max` and `min`) at which `text` fits
 * within `maxWidth`, using the given font family/style. Guarantees values and
 * single-line headings never overflow. Falls back to `min` if even that does
 * not fit (`min` keeps it readable).
 */
function fitFontSize(
  doc: PdfDoc,
  text: string,
  maxWidth: number,
  max: number,
  min: number,
  family: string = FONT_MONO,
  style: string = 'bold',
): number {
  for (let size = max; size >= min; size -= 0.5) {
    doc.setFont(family, style).setFontSize(size);
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
  roundedRect(
    x: number,
    y: number,
    w: number,
    h: number,
    rx: number,
    ry: number,
    style?: string,
  ): PdfDoc;
  triangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    style?: string,
  ): PdfDoc;
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

  /**
   * Draw a section heading (eyebrow/section-number optional) and advance the
   * cursor. The eyebrow and title sit on their own baselines with a generous
   * gap so the section number can never collide with the title, and the title
   * is font-fitted so it always renders on a single line. `reserveAfter` asks
   * the writer to keep at least that much of the section body on the same page
   * as the heading (keep-with-next) so a heading is never left orphaned at the
   * bottom of a page.
   */
  sectionTitle(title: string, eyebrow?: string, reserveAfter = 0): void {
    // Keep-with-next: ensure the whole heading block plus the first slice of
    // body content fits before we commit to drawing the heading here.
    this.ensure(HEADING_BLOCK_HEIGHT + reserveAfter);

    const top = this.cursor.y;

    if (eyebrow) {
      this.doc.setFont(FONT_MONO, 'normal').setFontSize(8).setTextColor(ACCENT);
      this.doc.text(eyebrow.toUpperCase(), MARGIN.left, top + 8);
    }

    // Title baseline sits well below the eyebrow baseline so the 18pt cap
    // height never reaches up into the eyebrow row.
    const titleBaseline = top + (eyebrow ? 30 : 18);
    const titleSize = fitFontSize(this.doc, title, contentWidth(), 18, 12, FONT_SERIF, 'bold');
    this.doc.setFont(FONT_SERIF, 'bold').setFontSize(titleSize).setTextColor(INK);
    this.doc.text(title, MARGIN.left, titleBaseline);

    const ruleY = titleBaseline + 8;
    this.doc.setDrawColor(ACCENT).setLineWidth(1);
    this.doc.line(MARGIN.left, ruleY, MARGIN.left + 40, ruleY);

    this.cursor.y = ruleY + 16;
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

/**
 * Draw the ArthVeda brand mark as crisp vector primitives — the same monogram
 * used on the website (public/favicon.svg / BrandMark): an emerald rounded
 * square enclosing a white "A" chevron with an emerald accent bar. Drawing it
 * with native PDF vectors (rather than a raster image) keeps it sharp at any
 * size, preserves the exact 1:1 aspect ratio, and never pixelates. Coordinates
 * mirror the favicon's 32-unit viewBox, scaled to `size`.
 */
function drawBrandMark(doc: PdfDoc, x: number, y: number, size: number): void {
  const k = size / 32;
  const px = (v: number) => x + v * k;
  const py = (v: number) => y + v * k;

  // Emerald rounded square.
  doc.setFillColor(ACCENT);
  doc.roundedRect(x, y, size, size, 6 * k, 6 * k, 'F');

  // White "A" chevron = a solid triangle with the centre notched out by an
  // emerald triangle the same colour as the square (matches favicon path).
  doc.setFillColor(WHITE);
  doc.triangle(px(16), py(6), px(25), py(26), px(7), py(26), 'F');
  doc.setFillColor(ACCENT);
  doc.triangle(px(16), py(15), px(20.5), py(26), px(11.5), py(26), 'F');

  // Emerald accent cross-bar.
  doc.setFillColor(EMERALD);
  doc.rect(px(13.4), py(19.2), 5.2 * k, 2.2 * k, 'F');
}

/** Render the cover page. The writer's first page is reused as the cover. */
function renderCover(w: ReportWriter, model: ReportModel): void {
  const doc = w.document;
  const centerX = A4.width / 2;

  // Letterhead header (first page): brand mark + wordmark on the left, and the
  // website + contact email right-aligned opposite it. The two blocks sit in
  // the same top band but at opposite margins, so they never overlap, and a
  // hairline rule beneath separates the header from the cover content below.
  const markSize = 30;
  drawBrandMark(doc, MARGIN.left, MARGIN.top, markSize);
  const wordmarkX = MARGIN.left + markSize + 12;
  doc.setFont(FONT_SERIF, 'bold').setFontSize(15).setTextColor(INK);
  doc.text('ArthVeda', wordmarkX, MARGIN.top + 13);
  doc.setFont(FONT_MONO, 'normal').setFontSize(7).setTextColor(ACCENT);
  doc.text('WEALTH STUDIO', wordmarkX, MARGIN.top + 25);

  const contactX = A4.width - MARGIN.right;
  doc.setFont(FONT_MONO, 'normal').setFontSize(8).setTextColor(ACCENT);
  doc.text(WEBSITE_URL, contactX, MARGIN.top + 11, { align: 'right' });
  doc.setFont(FONT_MONO, 'normal').setFontSize(8).setTextColor(INK_SECONDARY);
  doc.text(EMAIL, contactX, MARGIN.top + 24, { align: 'right' });

  doc.setDrawColor(HAIRLINE).setLineWidth(0.5);
  doc.line(MARGIN.left, MARGIN.top + 38, contactX, MARGIN.top + 38);

  let y = 200;

  doc.setFont(FONT_SERIF, 'bold').setFontSize(40).setTextColor(INK);
  doc.text(model.cover.brand, centerX, y, { align: 'center' });
  y += 26;

  doc.setFont(FONT_MONO, 'normal').setFontSize(11).setTextColor(ACCENT);
  doc.text(model.cover.division, centerX, y, { align: 'center' });
  y += 28;

  // The optional product line is only drawn when present, so the cover lockup
  // stays clean when the brand is expressed solely by the wordmark + division.
  if (model.cover.product) {
    doc.setFont(FONT_SERIF, 'normal').setFontSize(18).setTextColor(INK_SECONDARY);
    doc.text(model.cover.product, centerX, y, { align: 'center' });
    y += 40;
  }

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

/** Vertical space a single-line chart caption consumes. */
const CAPTION_HEIGHT = 18;

/**
 * Compute a footer-safe draw box for a chart. The chart is sized to the full
 * content width, then shrunk (preserving aspect ratio) if its natural height
 * would exceed `availableHeight`. This guarantees the chart — including the
 * x-axis labels baked into the image — never extends into the footer zone.
 */
function fitChartBox(
  image: CapturedImage,
  availableHeight: number,
): { drawWidth: number; drawHeight: number } {
  const maxWidth = contentWidth();
  const aspect = image.width > 0 ? image.height / image.width : 0;
  let drawWidth = maxWidth;
  let drawHeight = maxWidth * aspect;

  const maxHeight = Math.max(0, availableHeight - CHART_BOTTOM_PADDING);
  if (drawHeight > maxHeight) {
    drawHeight = maxHeight;
    drawWidth = aspect > 0 ? drawHeight / aspect : maxWidth;
  }
  return { drawWidth, drawHeight };
}

/**
 * Render a chart section (heading + captured image) as an atomic, footer-safe
 * unit:
 *   - keep-with-next: the heading and chart are measured together; if they do
 *     not both fit in the remaining page space the section starts on a new page
 *     so the heading is never orphaned (Wealth Mountain / Wealth Composition).
 *   - footer-safe: the chart's draw box is clamped to the space above the
 *     footer zone, shrinking the drawing area if needed so x-axis labels never
 *     collide with the page number or disclaimer.
 */
function renderChartSection(
  w: ReportWriter,
  title: string,
  eyebrow: string,
  image: CapturedImage | undefined,
  caption?: string,
): void {
  if (!image || image.width <= 0 || image.height <= 0) {
    w.sectionTitle(title, eyebrow, 24);
    w.paragraph('Chart preview is unavailable in this export.', 10, INK_SECONDARY);
    if (caption) {
      w.paragraph(caption, 10, ACCENT);
    }
    return;
  }

  const captionSpace = caption ? CAPTION_HEIGHT : 0;

  // Height the chart would take on a fresh page beneath the heading. Used to
  // decide whether the heading + chart can stay together on the current page.
  const freshAvailable = contentHeight() - HEADING_BLOCK_HEIGHT - captionSpace;
  const fresh = fitChartBox(image, freshAvailable);
  const needed = HEADING_BLOCK_HEIGHT + fresh.drawHeight + captionSpace + 8;

  // Keep-with-next: break to a new page first if the section cannot fit here.
  w.ensure(needed);

  // Heading (space already guaranteed above, so this will not break again).
  w.sectionTitle(title, eyebrow);

  // Clamp to the real space above the footer on the (possibly new) page.
  const available = contentBottom() - w.y;
  const box = fitChartBox(image, available - captionSpace);
  const x = MARGIN.left + (contentWidth() - box.drawWidth) / 2;
  w.document.addImage(image.dataUrl, 'PNG', x, w.y, box.drawWidth, box.drawHeight);
  w.advance(box.drawHeight + 8);

  if (caption) {
    w.paragraph(caption, 10, ACCENT);
  }
}

/**
 * Wrap a (short) header label onto at most two lines that each fit `maxWidth`
 * at `size`. Single-word labels are returned as-is (the per-column font fit
 * keeps them inside the cell); multi-word labels are split greedily so long
 * titles such as "Infl. Adj. Corpus" stack instead of colliding with the next
 * column.
 */
function wrapHeader(doc: PdfDoc, text: string, maxWidth: number, size: number): string[] {
  doc.setFont(FONT_MONO, 'bold').setFontSize(size);
  if (doc.getTextWidth(text) <= maxWidth) {
    return [text];
  }
  const words = text.split(' ');
  if (words.length === 1) {
    return [text];
  }
  let line1 = words[0];
  let i = 1;
  while (i < words.length && doc.getTextWidth(`${line1} ${words[i]}`) <= maxWidth) {
    line1 = `${line1} ${words[i]}`;
    i += 1;
  }
  const line2 = words.slice(i).join(' ');
  return line2 ? [line1, line2] : [line1];
}

/** Render the ledger across as many pages as needed, repeating the header. */
function renderLedger(w: ReportWriter, model: ReportModel): void {
  const doc = w.document;
  const columns = model.ledgerColumns;
  // Per-column relative widths tuned so the wide numeric columns (Total
  // Invested, End Corpus, Infl. Adj. Corpus) and the textual Phase column get
  // enough room; columnOffsets normalizes these to the content width.
  const weights = columns.map((_, i) => {
    switch (i) {
      case 0:
        return 0.5; // Year
      case 1:
        return 1.05; // Phase (text)
      case 3:
        return 1.15; // Total Invested
      case 6:
        return 1.15; // End Corpus
      case 7:
        return 1.2; // Infl. Adj. Corpus
      default:
        return 1.0; // SIP, Withdrawal, Return
    }
  });
  const offsets = columnOffsets(weights);
  const rightEdge = A4.width - MARGIN.right;

  const drawHeader = () => {
    doc.setFillColor(MIST);
    doc.rect(MARGIN.left, w.y, contentWidth(), LEDGER_HEADER_HEIGHT, 'F');
    const headerSize = 6.5;
    const lineHeight = headerSize + 1.5;
    doc.setTextColor(INK_SECONDARY);
    columns.forEach((col, i) => {
      const isNumeric = i >= 2;
      const left = offsets[i];
      const nextEdge = i + 1 < offsets.length ? offsets[i + 1] : rightEdge;
      const cellWidth = nextEdge - left - 8;
      const lines = wrapHeader(doc, col.toUpperCase(), cellWidth, headerSize);
      // Vertically center the (1- or 2-line) header within the header band.
      const blockHeight = lines.length * lineHeight;
      const firstBaseline = w.y + (LEDGER_HEADER_HEIGHT - blockHeight) / 2 + headerSize;
      doc.setFont(FONT_MONO, 'bold').setFontSize(headerSize);
      lines.forEach((line, li) => {
        const baseline = firstBaseline + li * lineHeight;
        if (isNumeric) {
          doc.text(line, nextEdge - 4, baseline, { align: 'right' });
        } else {
          doc.text(line, left + 4, baseline);
        }
      });
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

/**
 * Stamp the repeating footer on every page once the total page count is known.
 *
 * The footer lives in a dedicated zone between the content bottom and the page
 * bottom margin, so it can never overlap body content and always stays inside
 * the page margins. It uses two rows so the compliance text, page number, and
 * full brand line all fit without colliding:
 *   - row 1: disclaimer (left)              ·  "Page X of Y" (right)
 *   - row 2: "ArthVeda Wealth Studio · arthvedawealth.in · info@arthvedawealth.in" (centered)
 * Row 1 is 6.5pt; the centered brand line is 6pt (≈245pt wide), comfortably
 * inside the ~500pt content width.
 */
function stampFooters(doc: PdfDoc): void {
  const total = doc.getNumberOfPages();
  const zoneTop = footerZoneTop();
  const ruleY = zoneTop + 5;
  const row1 = zoneTop + 14;
  const row2 = zoneTop + 23;
  const leftX = MARGIN.left;
  const rightX = A4.width - MARGIN.right;
  const centerX = A4.width / 2;
  const brandLine = `ArthVeda Wealth Studio · ${WEBSITE} · ${EMAIL}`;

  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(HAIRLINE).setLineWidth(0.5);
    doc.line(leftX, ruleY, rightX, ruleY);
    // Row 1 — compliance disclaimer (left) and page number (right).
    doc.setFont(FONT_MONO, 'normal').setFontSize(6.5).setTextColor(INK_SECONDARY);
    doc.text('Illustrative projections only. Not investment advice.', leftX, row1);
    doc.text(`Page ${page} of ${total}`, rightX, row1, { align: 'right' });
    // Row 2 — centered brand line (office · website · email).
    doc.setFont(FONT_MONO, 'normal').setFontSize(6).setTextColor(ACCENT);
    doc.text(brandLine, centerX, row2, { align: 'center' });
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

  // Reserve enough body to keep a heading with the first ~two rows of its
  // table so a heading is never stranded at the bottom of a page.
  const PAIR_RESERVE = 44;

  // Section 1 — Projection Summary.
  w.newPage();
  w.sectionTitle('Projection Summary', 'Section 1', PAIR_RESERVE);
  w.pairTable(model.summary);

  // Section 2 — Planning Assumptions.
  w.sectionTitle('Planning Assumptions', 'Section 2', PAIR_RESERVE);
  w.pairTable(model.assumptions);

  // Section 3 — Wealth Mountain (heading + chart kept together, footer-safe).
  w.newPage();
  renderChartSection(w, 'Wealth Mountain', 'Section 3', charts.mountain);

  // Section 4 — Wealth Composition (heading + chart kept together, footer-safe).
  renderChartSection(w, 'Wealth Composition', 'Section 4', charts.donut, model.compositionSentence);

  // Section 5 — Wealth Journey Timeline.
  w.newPage();
  w.sectionTitle('Wealth Journey Timeline', 'Section 5', PAIR_RESERVE);
  w.pairTable(
    model.timeline.map((node) => ({ label: `${node.event} · ${node.year}`, value: node.corpus })),
  );

  // Section 6 — Milestone Achievement Report.
  w.sectionTitle(model.milestoneTitle, 'Section 6', PAIR_RESERVE);
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
  w.sectionTitle('AI Wealth Insights', 'Section 7', 40);
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

  // Section 8 — Projection Ledger (keep heading with header + first rows).
  w.newPage();
  w.sectionTitle('Projection Ledger', 'Section 8', LEDGER_HEADER_HEIGHT + 2 * LEDGER_ROW_HEIGHT);
  renderLedger(w, model);

  // Footer on every page.
  stampFooters(doc);

  return doc;
}

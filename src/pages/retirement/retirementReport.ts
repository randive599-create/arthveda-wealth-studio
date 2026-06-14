/**
 * Retirement Plan Report — a dedicated, retirement-specific PDF.
 *
 * Reuses the existing PDF engine (jsPDF, the embedded Unicode report fonts and
 * the shared A4 page geometry) but renders retirement-specific content with a
 * retirement-specific cover title: the plan summary (the five outputs), the plan
 * assumptions (the eight inputs), and a two-phase year-by-year table
 * (accumulation then drawdown). jsPDF is dynamically imported so it stays out of
 * the initial bundle.
 */

import { A4, MARGIN, contentBottom, contentTop, contentWidth } from '../../report/pageLayout';
import { registerReportFonts, REPORT_FONT_MONO, REPORT_FONT_SERIF } from '../../report/registerFonts';
import { formatCurrency, formatPercent } from '../../format/currency';
import type { RetirementInputs, RetirementResult } from './retirementModel';

const INK = '#111827';
const INK_SECONDARY = '#4b5563';
const ACCENT = '#064e3b';
const RISK = '#b91c1c';
const HAIRLINE = '#e5e7eb';
const MIST = '#f9fafb';

const WEBSITE = 'arthvedawealth.in';
const EMAIL = 'info@arthvedawealth.in';

/** Minimal jsPDF surface used by this renderer. */
interface Doc {
  addPage(): unknown;
  setPage(page: number): unknown;
  setFont(family: string, style?: string): unknown;
  setFontSize(size: number): unknown;
  setTextColor(color: string): unknown;
  setDrawColor(color: string): unknown;
  setFillColor(color: string): unknown;
  setLineWidth(width: number): unknown;
  text(text: string, x: number, y: number, options?: { align?: string }): unknown;
  line(x1: number, y1: number, x2: number, y2: number): unknown;
  rect(x: number, y: number, w: number, h: number, style?: string): unknown;
  getNumberOfPages(): number;
  save(filename: string): void;
}

interface Pair {
  label: string;
  value: string;
  emphasis?: 'accent' | 'risk';
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function longDate(d: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function buildRetirementReportFileName(date: Date): string {
  return `ArthVeda-Retirement-Plan-${isoDate(date)}.pdf`;
}

/** A running cursor over the document with simple page-break support. */
class Writer {
  y = contentTop();
  constructor(readonly doc: Doc) {}

  ensure(needed: number): void {
    if (this.y + needed > contentBottom()) {
      this.doc.addPage();
      this.y = contentTop();
    }
  }

  heading(title: string, eyebrow: string): void {
    this.ensure(48);
    this.doc.setFont(REPORT_FONT_MONO, 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(ACCENT);
    this.doc.text(eyebrow.toUpperCase(), MARGIN.left, this.y + 8);
    this.doc.setFont(REPORT_FONT_SERIF, 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(INK);
    this.doc.text(title, MARGIN.left, this.y + 28);
    this.doc.setDrawColor(ACCENT);
    this.doc.setLineWidth(1);
    this.doc.line(MARGIN.left, this.y + 34, MARGIN.left + 40, this.y + 34);
    this.y += 50;
  }

  pairs(rows: Pair[]): void {
    const rowH = 20;
    const valueX = A4.width - MARGIN.right - 4;
    for (const row of rows) {
      this.ensure(rowH);
      this.doc.setDrawColor(HAIRLINE);
      this.doc.setLineWidth(0.5);
      this.doc.line(MARGIN.left, this.y + rowH - 6, A4.width - MARGIN.right, this.y + rowH - 6);
      this.doc.setFont(REPORT_FONT_MONO, 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(INK_SECONDARY);
      this.doc.text(row.label, MARGIN.left + 4, this.y + 8);
      this.doc.setFont(REPORT_FONT_MONO, 'bold');
      this.doc.setFontSize(10);
      this.doc.setTextColor(
        row.emphasis === 'accent' ? ACCENT : row.emphasis === 'risk' ? RISK : INK,
      );
      this.doc.text(row.value, valueX, this.y + 8, { align: 'right' });
      this.y += rowH;
    }
    this.y += 10;
  }
}

function renderHeader(doc: Doc, result: RetirementResult, generated: string): void {
  doc.setFont(REPORT_FONT_SERIF, 'bold');
  doc.setFontSize(15);
  doc.setTextColor(INK);
  doc.text('ArthVeda', MARGIN.left, MARGIN.top + 4);
  doc.setFont(REPORT_FONT_MONO, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(ACCENT);
  doc.text('PRIVATE OFFICE', MARGIN.left, MARGIN.top + 16);

  const rightX = A4.width - MARGIN.right;
  doc.setFontSize(8);
  doc.setTextColor(INK_SECONDARY);
  doc.text(WEBSITE, rightX, MARGIN.top + 4, { align: 'right' });
  doc.text(EMAIL, rightX, MARGIN.top + 16, { align: 'right' });

  doc.setDrawColor(HAIRLINE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN.left, MARGIN.top + 26, rightX, MARGIN.top + 26);

  // Retirement-specific report title.
  doc.setFont(REPORT_FONT_SERIF, 'bold');
  doc.setFontSize(26);
  doc.setTextColor(INK);
  doc.text('Retirement Plan Report', MARGIN.left, MARGIN.top + 66);
  doc.setFont(REPORT_FONT_MONO, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(INK_SECONDARY);
  doc.text('Corpus, Income & Sustainability', MARGIN.left, MARGIN.top + 84);

  doc.setFont(REPORT_FONT_MONO, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(result.sustainable ? ACCENT : RISK);
  doc.text(
    result.sustainable
      ? `Income sustained to age ${result.lifeExpectancy}`
      : `Income runs out at age ${result.incomeSustainedToAge}`,
    MARGIN.left,
    MARGIN.top + 104,
  );
  doc.setFont(REPORT_FONT_MONO, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(INK_SECONDARY);
  doc.text(`Generated ${generated}`, MARGIN.left, MARGIN.top + 120);
}

interface PhaseRow {
  age: number;
  corpus: number;
  phase: string;
}

function renderProjectionTable(w: Writer, result: RetirementResult): void {
  const doc = w.doc;
  const rightEdge = A4.width - MARGIN.right;
  const cols = [
    { label: 'Age', x: MARGIN.left + 4, align: 'left' as const },
    { label: 'Phase', x: MARGIN.left + contentWidth() * 0.4, align: 'left' as const },
    { label: 'Corpus', x: rightEdge - 4, align: 'right' as const },
  ];

  const drawHeader = () => {
    doc.setFillColor(MIST);
    doc.rect(MARGIN.left, w.y, contentWidth(), 18, 'F');
    doc.setFont(REPORT_FONT_MONO, 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(INK_SECONDARY);
    for (const c of cols) {
      doc.text(c.label.toUpperCase(), c.x, w.y + 12, { align: c.align });
    }
    w.y += 18;
  };

  // Combine accumulation (skip the duplicated retirement-age point from drawdown).
  const rows: PhaseRow[] = [
    ...result.accumulationSeries.map((p) => ({ age: p.age, corpus: p.corpus, phase: 'Accumulation' })),
    ...result.drawdownSeries.slice(1).map((p) => ({ age: p.age, corpus: p.corpus, phase: 'Drawdown' })),
  ];

  w.ensure(18 + 18 * 3);
  drawHeader();

  const money = (v: number) => formatCurrency(v, result.currency);
  for (const row of rows) {
    if (w.y + 16 > contentBottom()) {
      doc.addPage();
      w.y = contentTop();
      drawHeader();
    }
    doc.setDrawColor(HAIRLINE);
    doc.setLineWidth(0.4);
    doc.line(MARGIN.left, w.y + 16, rightEdge, w.y + 16);

    doc.setFont(REPORT_FONT_MONO, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(INK);
    doc.text(String(row.age), cols[0].x, w.y + 11, { align: cols[0].align });
    doc.setFont(REPORT_FONT_MONO, 'normal');
    doc.setTextColor(row.phase === 'Drawdown' ? RISK : ACCENT);
    doc.text(row.phase, cols[1].x, w.y + 11, { align: cols[1].align });
    doc.setTextColor(INK);
    doc.text(money(row.corpus), cols[2].x, w.y + 11, { align: cols[2].align });
    w.y += 16;
  }
}

function stampFooters(doc: Doc): void {
  const total = doc.getNumberOfPages();
  const y = contentBottom() + 16;
  const ruleY = contentBottom() + 5;
  const leftX = MARGIN.left;
  const rightX = A4.width - MARGIN.right;
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(HAIRLINE);
    doc.setLineWidth(0.5);
    doc.line(leftX, ruleY, rightX, ruleY);
    doc.setFont(REPORT_FONT_MONO, 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(INK_SECONDARY);
    doc.text('Illustrative retirement projection only. Not investment advice.', leftX, y);
    doc.text(`Page ${page} of ${total}`, rightX, y, { align: 'right' });
    doc.setFontSize(6);
    doc.setTextColor(ACCENT);
    doc.text(`ArthVeda Private Office · ${WEBSITE} · ${EMAIL}`, A4.width / 2, y + 9, {
      align: 'center',
    });
  }
}

export interface GenerateRetirementReportOptions {
  now?: Date;
}

/**
 * Generate and save the Retirement Plan Report. Returns the resolved file name.
 * Throws if PDF rendering fails (the caller surfaces it in the UI).
 */
export async function generateRetirementReport(
  inputs: RetirementInputs,
  result: RetirementResult,
  options: GenerateRetirementReportOptions = {},
): Promise<string> {
  const now = options.now ?? new Date();

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [A4.width, A4.height] });
  registerReportFonts(doc as unknown as Parameters<typeof registerReportFonts>[0]);

  const typed = doc as unknown as Doc;
  renderHeader(typed, result, longDate(now));

  const money = (v: number) => formatCurrency(v, result.currency);
  const w = new Writer(typed);
  w.y = MARGIN.top + 140;

  // Plan summary — the five outputs.
  w.heading('Retirement Plan Summary', 'Section 1');
  w.pairs([
    { label: 'Retirement Corpus Required', value: money(result.requiredCorpus) },
    { label: 'Projected Corpus', value: money(result.projectedCorpus), emphasis: 'accent' },
    {
      label: 'Retirement Income Sustainability',
      value: result.sustainable
        ? `Sustained to age ${result.lifeExpectancy}`
        : `Runs out at age ${result.incomeSustainedToAge}`,
      emphasis: result.sustainable ? 'accent' : 'risk',
    },
    {
      label: result.wealthGap > 0 ? 'Wealth Gap' : 'Wealth Surplus',
      value: result.wealthGap > 0 ? money(result.shortfall) : money(result.surplus),
      emphasis: result.wealthGap > 0 ? 'risk' : 'accent',
    },
    {
      label: 'Inflation-Adjusted Retirement Need',
      value: `${money(result.inflationAdjustedMonthlyNeed)}/mo`,
    },
  ]);

  // Plan assumptions — the eight inputs.
  w.heading('Plan Assumptions', 'Section 2');
  w.pairs([
    { label: 'Current Age', value: `${inputs.currentAge} years` },
    { label: 'Retirement Age', value: `${inputs.retirementAge} years` },
    { label: 'Current Corpus', value: money(inputs.currentCorpus) },
    { label: 'Monthly Investment', value: money(inputs.monthlyInvestment) },
    { label: 'Annual Step-Up', value: formatPercent(inputs.annualStepUpPct) },
    { label: 'Expected Return', value: formatPercent(inputs.expectedReturnPct) },
    { label: 'Inflation', value: formatPercent(inputs.inflationPct) },
    { label: 'Expected Monthly Income (today)', value: money(inputs.expectedMonthlyIncome) },
  ]);

  // Two-phase year-by-year projection.
  w.heading('Accumulation & Drawdown (Year by Year)', 'Section 3');
  renderProjectionTable(w, result);

  stampFooters(typed);

  const fileName = buildRetirementReportFileName(now);
  typed.save(fileName);
  return fileName;
}

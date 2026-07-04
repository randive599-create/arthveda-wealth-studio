/**
 * SWP Plan Report — a dedicated, SWP-specific PDF.
 *
 * Reuses the existing PDF engine (jsPDF, the embedded Unicode report fonts and
 * the shared A4 page geometry) but renders SWP-specific content with an
 * SWP-specific cover title: the plan summary (the five SWP outputs), the plan
 * assumptions (the five SWP inputs), and a year-by-year corpus depletion table.
 * jsPDF is dynamically imported so it stays out of the initial bundle.
 */

import { A4, MARGIN, contentBottom, contentTop, contentWidth } from '../../report/pageLayout';
import { registerReportFonts, REPORT_FONT_MONO, REPORT_FONT_SERIF } from '../../report/registerFonts';
import { formatCurrency, formatPercent } from '../../format/currency';
import type { SwpInputs, SwpResult } from './swpModel';

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
function longevityLabel(result: SwpResult): string {
  if (result.survivesFullTerm) {
    return `${result.durationYears}+ years (full term)`;
  }
  const years = Math.floor(result.longevityMonths / 12);
  const rem = result.longevityMonths % 12;
  return rem === 0 ? `${years} years` : `${years} years ${rem} months`;
}

export function buildSwpReportFileName(date: Date): string {
  return `ArthVeda-SWP-Plan-${isoDate(date)}.pdf`;
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

function renderHeader(doc: Doc, result: SwpResult, generated: string): void {
  doc.setFont(REPORT_FONT_SERIF, 'bold');
  doc.setFontSize(15);
  doc.setTextColor(INK);
  doc.text('ArthVeda', MARGIN.left, MARGIN.top + 4);
  doc.setFont(REPORT_FONT_MONO, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(ACCENT);
  doc.text('WEALTH STUDIO', MARGIN.left, MARGIN.top + 16);

  const rightX = A4.width - MARGIN.right;
  doc.setFontSize(8);
  doc.setTextColor(INK_SECONDARY);
  doc.text(WEBSITE, rightX, MARGIN.top + 4, { align: 'right' });
  doc.text(EMAIL, rightX, MARGIN.top + 16, { align: 'right' });

  doc.setDrawColor(HAIRLINE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN.left, MARGIN.top + 26, rightX, MARGIN.top + 26);

  // SWP-specific report title.
  doc.setFont(REPORT_FONT_SERIF, 'bold');
  doc.setFontSize(26);
  doc.setTextColor(INK);
  doc.text('SWP Plan Report', MARGIN.left, MARGIN.top + 66);
  doc.setFont(REPORT_FONT_MONO, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(INK_SECONDARY);
  doc.text('Systematic Withdrawal Plan', MARGIN.left, MARGIN.top + 84);

  const strong = result.survivalProbability >= 0.75;
  doc.setFont(REPORT_FONT_MONO, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(strong ? ACCENT : RISK);
  doc.text(
    `${Math.round(result.survivalProbability * 100)}% chance of lasting ${result.durationYears} years`,
    MARGIN.left,
    MARGIN.top + 104,
  );
  doc.setFont(REPORT_FONT_MONO, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(INK_SECONDARY);
  doc.text(`Generated ${generated}`, MARGIN.left, MARGIN.top + 120);
}

function renderProjectionTable(w: Writer, result: SwpResult): void {
  const doc = w.doc;
  const rightEdge = A4.width - MARGIN.right;
  const cols = [
    { label: 'Year', x: MARGIN.left + 4, align: 'left' as const },
    { label: 'Corpus', x: MARGIN.left + contentWidth() * 0.52, align: 'right' as const },
    { label: 'Total Withdrawn', x: MARGIN.left + contentWidth() * 0.8, align: 'right' as const },
    { label: 'Status', x: rightEdge - 4, align: 'right' as const },
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

  w.ensure(18 + 18 * 3);
  drawHeader();

  const money = (v: number) => formatCurrency(v, result.currency);
  for (const point of result.series) {
    if (w.y + 16 > contentBottom()) {
      doc.addPage();
      w.y = contentTop();
      drawHeader();
    }
    doc.setDrawColor(HAIRLINE);
    doc.setLineWidth(0.4);
    doc.line(MARGIN.left, w.y + 16, rightEdge, w.y + 16);

    const active = point.corpus > 0;
    doc.setFont(REPORT_FONT_MONO, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(INK);
    doc.text(String(point.year), cols[0].x, w.y + 11, { align: cols[0].align });
    doc.setFont(REPORT_FONT_MONO, 'normal');
    doc.setTextColor(INK);
    doc.text(money(point.corpus), cols[1].x, w.y + 11, { align: cols[1].align });
    doc.setTextColor(INK_SECONDARY);
    doc.text(money(point.withdrawn), cols[2].x, w.y + 11, { align: cols[2].align });
    doc.setFont(REPORT_FONT_MONO, 'bold');
    doc.setTextColor(active ? ACCENT : RISK);
    doc.text(active ? 'Active' : 'Depleted', cols[3].x, w.y + 11, { align: cols[3].align });
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
    doc.text('Illustrative SWP projection only. Not investment advice.', leftX, y);
    doc.text(`Page ${page} of ${total}`, rightX, y, { align: 'right' });
    doc.setFontSize(6);
    doc.setTextColor(ACCENT);
    doc.text(`ArthVeda Wealth Studio · ${WEBSITE} · ${EMAIL}`, A4.width / 2, y + 9, {
      align: 'center',
    });
  }
}

export interface GenerateSwpReportOptions {
  now?: Date;
}

/**
 * Generate and save the SWP Plan Report. Returns the resolved file name.
 * Throws if PDF rendering fails (the caller surfaces it in the UI).
 */
export async function generateSwpReport(
  inputs: SwpInputs,
  result: SwpResult,
  options: GenerateSwpReportOptions = {},
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

  // Plan summary — the five SWP outputs.
  w.heading('Withdrawal Plan Summary', 'Section 1');
  w.pairs([
    { label: 'Corpus Longevity', value: longevityLabel(result) },
    { label: 'Total Withdrawals', value: money(result.totalWithdrawals) },
    {
      label: 'Remaining Corpus',
      value: money(result.remainingCorpus),
      emphasis: result.depleted ? 'risk' : 'accent',
    },
    {
      label: `Inflation-Adjusted Income (year ${result.durationYears})`,
      value: `${money(result.inflationAdjustedMonthlyIncome)}/mo`,
    },
    {
      label: 'Portfolio Survival Probability',
      value: `${Math.round(result.survivalProbability * 100)}%`,
      emphasis: result.survivalProbability >= 0.75 ? 'accent' : 'risk',
    },
  ]);

  // Plan assumptions — the five SWP inputs.
  w.heading('Plan Assumptions', 'Section 2');
  w.pairs([
    { label: 'Initial Corpus', value: money(inputs.initialCorpus) },
    { label: 'Monthly Withdrawal', value: money(inputs.monthlyWithdrawal) },
    { label: 'Annual Return', value: formatPercent(inputs.annualReturnPct) },
    { label: 'Inflation', value: formatPercent(inputs.inflationPct) },
    { label: 'Withdrawal Duration', value: `${inputs.durationYears} years` },
  ]);

  // Year-by-year corpus depletion.
  w.heading('Corpus Depletion (Year by Year)', 'Section 3');
  renderProjectionTable(w, result);

  stampFooters(typed);

  const fileName = buildSwpReportFileName(now);
  typed.save(fileName);
  return fileName;
}

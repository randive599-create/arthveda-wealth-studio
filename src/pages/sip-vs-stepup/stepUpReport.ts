/**
 * SIP vs Step-Up SIP Wealth Comparison Report — a dedicated PDF.
 *
 * Reuses the existing PDF engine (jsPDF, embedded Unicode fonts, A4 geometry).
 * Cover title: "SIP vs Step-Up SIP Wealth Comparison Report". Includes the
 * selected step-up method, all inputs, all comparison outputs, the four unique
 * ArthVeda insights, and the full year-by-year comparison that the on-screen
 * charts visualize. jsPDF is dynamically imported so it stays out of the bundle.
 */

import { A4, MARGIN, contentBottom, contentTop, contentWidth } from '../../report/pageLayout';
import { registerReportFonts, REPORT_FONT_MONO, REPORT_FONT_SERIF } from '../../report/registerFonts';
import { loadBrandLogo, drawReportLetterhead, type BrandLogoImage } from '../../report/brandLogo';
import { formatCompactCurrency, formatCurrency, formatPercent } from '../../format/currency';
import type { StepUpInputs, StepUpResult } from './stepUpModel';

const INK = '#111827';
const INK_SECONDARY = '#4b5563';
const ACCENT = '#064e3b';
const HAIRLINE = '#e5e7eb';
const MIST = '#f9fafb';

const WEBSITE = 'arthvedawealth.in';
const EMAIL = 'info@arthvedawealth.in';
const REPORT_TITLE = 'SIP vs Step-Up SIP Wealth Comparison Report';

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
  addImage(data: string, format: string, x: number, y: number, w: number, h: number): unknown;
  getNumberOfPages(): number;
  save(filename: string): void;
}

interface Pair {
  label: string;
  value: string;
  emphasis?: 'accent';
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

export function buildStepUpReportFileName(date: Date): string {
  return `ArthVeda-SIP-vs-StepUp-${isoDate(date)}.pdf`;
}

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
      this.doc.setTextColor(row.emphasis === 'accent' ? ACCENT : INK);
      this.doc.text(row.value, valueX, this.y + 8, { align: 'right' });
      this.y += rowH;
    }
    this.y += 10;
  }
}

function renderHeader(
  doc: Doc,
  result: StepUpResult,
  generated: string,
  logo?: BrandLogoImage,
): void {
  drawReportLetterhead(doc, logo);

  doc.setFont(REPORT_FONT_SERIF, 'bold');
  doc.setFontSize(24);
  doc.setTextColor(INK);
  doc.text('Step-Up SIP Comparison', MARGIN.left, MARGIN.top + 66);
  doc.setFont(REPORT_FONT_MONO, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(INK_SECONDARY);
  doc.text(REPORT_TITLE, MARGIN.left, MARGIN.top + 82);

  doc.setFont(REPORT_FONT_MONO, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(ACCENT);
  doc.text(
    `${formatCurrency(result.extraWealthCreated, result.currency)} extra · ${result.wealthAccelerationPct.toFixed(0)}% faster`,
    MARGIN.left,
    MARGIN.top + 102,
  );
  doc.setFont(REPORT_FONT_MONO, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(INK_SECONDARY);
  doc.text(`Generated ${generated}`, MARGIN.left, MARGIN.top + 118);
}

function renderComparisonTable(w: Writer, result: StepUpResult): void {
  const doc = w.doc;
  const rightEdge = A4.width - MARGIN.right;
  const cols = [
    { label: 'Year', x: MARGIN.left + 4, align: 'left' as const },
    { label: 'Monthly SIP', x: MARGIN.left + contentWidth() * 0.3, align: 'right' as const },
    { label: 'Normal Corpus', x: MARGIN.left + contentWidth() * 0.58, align: 'right' as const },
    { label: 'Step-Up Corpus', x: MARGIN.left + contentWidth() * 0.82, align: 'right' as const },
    { label: 'Difference', x: rightEdge - 4, align: 'right' as const },
  ];

  const drawHeader = () => {
    doc.setFillColor(MIST);
    doc.rect(MARGIN.left, w.y, contentWidth(), 18, 'F');
    doc.setFont(REPORT_FONT_MONO, 'bold');
    doc.setFontSize(7);
    doc.setTextColor(INK_SECONDARY);
    for (const c of cols) {
      doc.text(c.label.toUpperCase(), c.x, w.y + 12, { align: c.align });
    }
    w.y += 18;
  };

  w.ensure(18 + 16 * 3);
  drawHeader();

  const money = (v: number) => formatCurrency(v, result.currency);
  const compact = (v: number) => formatCompactCurrency(v, result.currency);
  for (const row of result.comparison) {
    if (w.y + 15 > contentBottom()) {
      doc.addPage();
      w.y = contentTop();
      drawHeader();
    }
    doc.setDrawColor(HAIRLINE);
    doc.setLineWidth(0.4);
    doc.line(MARGIN.left, w.y + 15, rightEdge, w.y + 15);
    doc.setFont(REPORT_FONT_MONO, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(INK);
    doc.text(String(row.year), cols[0].x, w.y + 10, { align: cols[0].align });
    doc.setFont(REPORT_FONT_MONO, 'normal');
    doc.setTextColor(INK_SECONDARY);
    doc.text(money(row.monthlySip), cols[1].x, w.y + 10, { align: cols[1].align });
    doc.setTextColor(INK);
    doc.text(compact(row.normalCorpus), cols[2].x, w.y + 10, { align: cols[2].align });
    doc.text(compact(row.stepUpCorpus), cols[3].x, w.y + 10, { align: cols[3].align });
    doc.setTextColor(ACCENT);
    doc.text(compact(row.difference), cols[4].x, w.y + 10, { align: cols[4].align });
    w.y += 15;
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
    doc.text('Illustrative SIP comparison only. Not investment advice.', leftX, y);
    doc.text(`Page ${page} of ${total}`, rightX, y, { align: 'right' });
    doc.setFontSize(6);
    doc.setTextColor(ACCENT);
    doc.text(`ArthVeda Wealth Studio · ${WEBSITE} · ${EMAIL}`, A4.width / 2, y + 9, {
      align: 'center',
    });
  }
}

export interface GenerateStepUpReportOptions {
  now?: Date;
}

export async function generateStepUpReport(
  inputs: StepUpInputs,
  result: StepUpResult,
  options: GenerateStepUpReportOptions = {},
): Promise<string> {
  const now = options.now ?? new Date();
  const methodLabel =
    inputs.method === 'percentage' ? 'Percentage Based' : 'Fixed Amount Based';
  const stepValue =
    inputs.method === 'percentage'
      ? formatPercent(inputs.stepUpPercent)
      : formatCurrency(inputs.stepUpAmount, result.currency);

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [A4.width, A4.height] });
  registerReportFonts(doc as unknown as Parameters<typeof registerReportFonts>[0]);

  const typed = doc as unknown as Doc;
  const logo = await loadBrandLogo();
  renderHeader(typed, result, longDate(now), logo);

  const money = (v: number) => formatCurrency(v, result.currency);
  const w = new Writer(typed);
  w.y = MARGIN.top + 138;

  // Inputs / selected method.
  w.heading('Inputs & Selected Method', 'Section 1');
  w.pairs([
    { label: 'Monthly SIP Amount', value: money(inputs.monthlySip) },
    { label: 'Investment Duration', value: `${inputs.durationYears} years` },
    { label: 'Expected Annual Return', value: formatPercent(inputs.expectedReturnPct) },
    { label: 'Step-Up Method', value: methodLabel },
    {
      label: inputs.method === 'percentage' ? 'Annual Step-Up %' : 'Annual Step-Up Amount',
      value: stepValue,
    },
  ]);

  // Comparison outputs.
  w.heading('Wealth Comparison', 'Section 2');
  w.pairs([
    { label: 'Normal SIP Corpus', value: money(result.normalCorpus) },
    { label: 'Step-Up SIP Corpus', value: money(result.stepUpCorpus), emphasis: 'accent' },
    { label: 'Additional Investment Gains', value: money(result.additionalWealthCreated) },
    { label: 'Difference in Final Corpus', value: money(result.differenceInCorpus), emphasis: 'accent' },
    { label: 'Total Invested Amount', value: money(result.totalInvested) },
    { label: 'Investment Gains (Returns Earned)', value: money(result.totalGain) },
    { label: 'Wealth Multiplier', value: `${result.wealthMultiplier.toFixed(2)}x` },
  ]);

  // Unique ArthVeda insights.
  w.heading('Unique ArthVeda Insights', 'Section 3');
  w.pairs([
    { label: 'Years Saved', value: `${result.yearsSaved.toFixed(1)} years` },
    { label: 'Equivalent SIP (no step-up)', value: `${money(result.equivalentSip)}/mo` },
    { label: 'Wealth Acceleration', value: `${result.wealthAccelerationPct.toFixed(0)}% faster` },
    { label: 'Extra Wealth Created', value: money(result.extraWealthCreated), emphasis: 'accent' },
  ]);

  // Year-by-year comparison (the data behind the charts).
  w.heading('Year-by-Year Comparison', 'Section 4');
  renderComparisonTable(w, result);

  stampFooters(typed);

  const fileName = buildStepUpReportFileName(now);
  typed.save(fileName);
  return fileName;
}

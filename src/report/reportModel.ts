/**
 * Pure report model for the Wealth Projection Report.
 *
 * This module contains no jsPDF, no DOM, and no I/O. It transforms a
 * `ProjectionResult` into the fully-resolved, display-ready content of the PDF
 * (cover metadata, summary rows, assumption rows, timeline, milestones, grouped
 * insights, and ledger rows) and provides the file-naming helper. Keeping this
 * logic pure makes the report content unit-testable without rendering a PDF and
 * guarantees the document matches the on-screen studio exactly.
 */

import type {
  Currency,
  Insight,
  InsightCategory,
  ProjectionResult,
} from '../engine/types';
import { CURRENCY_SYMBOL, formatCurrency, formatMultiplier, formatPercent } from '../format/currency';
import {
  buildProjectionRows,
  PHASE_LABEL,
  type ProjectionTableRow,
} from '../components/table/projectionRows';

/** A label/value pair rendered as a row in a report table. */
export interface ReportPair {
  label: string;
  value: string;
}

/** Cover-page metadata. */
export interface ReportCover {
  brand: string;
  division: string;
  product: string;
  tagline: string;
  title: string;
  generatedDate: string;
  currencyLabel: string;
}

/** A timeline entry resolved for the report (year, event, corpus). */
export interface ReportTimelineRow {
  event: string;
  year: string;
  corpus: string;
}

/** A milestone entry resolved for the report. */
export interface ReportMilestoneRow {
  milestone: string;
  achievementYear: string;
  corpus: string;
}

/** Insights grouped by category, in display order. */
export interface ReportInsightGroup {
  category: InsightCategory;
  title: string;
  insights: Insight[];
}

/** A fully-resolved, render-ready ledger row (all values pre-formatted). */
export interface ReportLedgerRow {
  year: string;
  phase: string;
  sip: string;
  invested: string;
  withdrawal: string;
  returns: string;
  corpus: string;
  realCorpus: string | null;
}

/** The complete, display-ready report content. */
export interface ReportModel {
  cover: ReportCover;
  summary: ReportPair[];
  assumptions: ReportPair[];
  timeline: ReportTimelineRow[];
  milestoneTitle: string;
  milestones: ReportMilestoneRow[];
  insightGroups: ReportInsightGroup[];
  ledgerColumns: string[];
  ledgerRows: ReportLedgerRow[];
  inflationEnabled: boolean;
  /** The compounding-share sentence shown beneath the composition chart. */
  compositionSentence: string;
}

const CURRENCY_NAME: Record<Currency, string> = {
  INR: 'Indian Rupee (INR)',
  USD: 'US Dollar (USD)',
  EUR: 'Euro (EUR)',
};

/** Pad a number to two digits. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * Format a date as `YYYY-MM-DD` from its local components. Used both for the
 * cover line and (via {@link buildReportFileName}) the download file name.
 */
export function formatIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Format a human-readable date such as "7 June 2026". */
export function formatLongDate(date: Date): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Build the download file name, e.g. `ArthVeda-Wealth-Projection-2026-06-07.pdf`.
 */
export function buildReportFileName(date: Date): string {
  return `ArthVeda-Wealth-Projection-${formatIsoDate(date)}.pdf`;
}

function describeStepUp(
  method: 'percentage' | 'fixed',
  percentage: number,
  amount: number,
  currency: Currency,
): string {
  if (method === 'percentage') {
    return percentage > 0 ? `${formatPercent(percentage)} per annum` : 'None';
  }
  return amount > 0 ? `${formatCurrency(amount, currency)} per annum` : 'None';
}

const INSIGHT_GROUP_ORDER: { category: InsightCategory; title: string }[] = [
  { category: 'opportunity', title: 'Opportunities' },
  { category: 'observation', title: 'Observations' },
  { category: 'risk', title: 'Risks' },
];

/**
 * Build the complete report model from a projection result.
 *
 * @param result the projection to report on.
 * @param now the generation timestamp (injectable for deterministic tests).
 */
export function buildReportModel(result: ProjectionResult, now: Date = new Date()): ReportModel {
  const { inputs, summary } = result;
  const currency = inputs.currency;
  const money = (value: number) => formatCurrency(value, currency);
  const inflationEnabled = result.inflation !== null;

  const cover: ReportCover = {
    brand: 'ARTHVEDA',
    division: 'PRIVATE OFFICE',
    product: 'Wealth Projection Studio',
    tagline:
      'Visualize every stage of your financial journey — accumulation, growth, preservation, ' +
      'and income — in one institutional-grade projection studio.',
    title: 'Wealth Projection Report',
    generatedDate: formatLongDate(now),
    currencyLabel: CURRENCY_NAME[currency],
  };

  const summaryRows: ReportPair[] = [
    { label: 'Total Investment', value: money(summary.totalInvestment) },
    { label: 'Corpus at SIP Stop', value: money(summary.corpusAtSipStop) },
    { label: 'Total SWP Withdrawal', value: money(summary.totalWithdrawn) },
    { label: 'Final Corpus', value: money(summary.finalCorpus) },
    { label: 'Total Returns', value: money(summary.totalReturns) },
    { label: 'Wealth Multiplier', value: formatMultiplier(summary.wealthMultiplier) },
  ];
  if (inflationEnabled && summary.inflationAdjustedCorpus !== null) {
    summaryRows.push({
      label: 'Inflation Adjusted Corpus',
      value: money(summary.inflationAdjustedCorpus),
    });
  }
  if (inflationEnabled && summary.inflationAdjustedWealthMultiplier !== null) {
    summaryRows.push({
      label: 'Inflation Adjusted Wealth Multiplier',
      value: formatMultiplier(summary.inflationAdjustedWealthMultiplier),
    });
  }

  const assumptions: ReportPair[] = [
    { label: 'Currency', value: `${CURRENCY_SYMBOL[currency]} ${CURRENCY_NAME[currency]}` },
    {
      label: 'Plan Mode',
      value: inputs.mode === 'income' ? 'Accumulation + Income Distribution' : 'Accumulation Only',
    },
    { label: 'Lumpsum Investment', value: money(inputs.lumpsum) },
    { label: 'Monthly SIP', value: money(inputs.monthlySip) },
    {
      label: 'SIP Step-Up',
      value: describeStepUp(
        inputs.sipStepUp.method,
        inputs.sipStepUp.percentage,
        inputs.sipStepUp.amount,
        currency,
      ),
    },
    { label: 'Annual Return Rate', value: formatPercent(inputs.annualReturnRate) },
    { label: 'Investment Duration', value: `${inputs.durationYears} years` },
    { label: 'SIP Stop Year', value: `Year ${inputs.sipStopYear}` },
  ];
  if (inputs.mode === 'income') {
    assumptions.push(
      { label: 'Withdrawal Start Year', value: `Year ${inputs.withdrawalStartYear}` },
      { label: 'Withdrawal Phase Return', value: formatPercent(inputs.withdrawalReturnRate) },
      { label: 'Monthly SWP', value: money(inputs.monthlySwp) },
      {
        label: 'SWP Step-Up',
        value: describeStepUp(
          inputs.swpStepUp.method,
          inputs.swpStepUp.percentage,
          inputs.swpStepUp.amount,
          currency,
        ),
      },
    );
  }
  assumptions.push({
    label: 'Inflation Adjustment',
    value: inputs.inflation.enabled ? `Enabled at ${formatPercent(inputs.inflation.rate)}` : 'Disabled',
  });

  const timeline: ReportTimelineRow[] = result.timeline.map((node) => ({
    event: node.label,
    year: node.year === 0 ? 'Year 0' : `Year ${node.year}`,
    corpus: money(node.corpus),
  }));

  const milestones: ReportMilestoneRow[] = result.milestones.map((m) => ({
    milestone: m.label,
    achievementYear: `Year ${m.reachedYear}`,
    corpus: money(m.corpusAtAchievement),
  }));

  const insightGroups: ReportInsightGroup[] = INSIGHT_GROUP_ORDER.map((group) => ({
    category: group.category,
    title: group.title,
    insights: result.insights.filter((i) => i.category === group.category),
  })).filter((group) => group.insights.length > 0);

  const ledgerColumns = [
    'Year',
    'Phase',
    'SIP',
    'Total Invested',
    'Withdrawal',
    'Return',
    'End Corpus',
  ];
  if (inflationEnabled) {
    ledgerColumns.push('Infl. Adj. Corpus');
  }

  const rows: ProjectionTableRow[] = buildProjectionRows(result);
  const ledgerRows: ReportLedgerRow[] = rows.map((row) => ({
    year: String(row.year),
    phase: PHASE_LABEL[row.phase],
    sip: money(row.sipContribution),
    invested: money(row.totalInvestment),
    withdrawal: money(row.withdrawal),
    returns: money(row.investmentReturn),
    corpus: money(row.endCorpus),
    realCorpus: row.inflationAdjustedCorpus !== null ? money(row.inflationAdjustedCorpus) : null,
  }));

  return {
    cover,
    summary: summaryRows,
    assumptions,
    timeline,
    milestoneTitle: result.milestoneTitle,
    milestones,
    insightGroups,
    ledgerColumns,
    ledgerRows,
    inflationEnabled,
    compositionSentence: `${formatPercent(
      result.composition.returnsPercentage,
    )} of projected wealth comes from compounding.`,
  };
}

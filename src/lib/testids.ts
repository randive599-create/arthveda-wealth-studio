/**
 * Central registry of `data-testid` values.
 *
 * Keeping every test id in one typed object prevents typos and makes the
 * testable surface of the app discoverable. Components import from here rather
 * than hard-coding strings, and tests assert against the same constants.
 */

export const TESTIDS = {
  appShell: 'app-shell',
  header: 'studio-header',
  brandMark: 'brand-mark',
  brandWordmark: 'brand-wordmark',
  brandTagline: 'brand-tagline',
  trustMessage: 'trust-message',

  parametersColumn: 'parameters-column',
  studioColumn: 'studio-column',

  summaryBar: 'summary-bar',
  summaryBarTotalInvestment: 'summary-bar-total-investment',
  summaryBarFinalCorpus: 'summary-bar-final-corpus',
  summaryBarFirstCrore: 'summary-bar-first-crore',

  dashboard: 'dashboard',
  cardTotalInvestment: 'card-total-investment',
  cardCorpusAtSipStop: 'card-corpus-at-sip-stop',
  cardTotalWithdrawal: 'card-total-withdrawal',
  cardFinalCorpus: 'card-final-corpus',

  metricsStrip: 'metrics-strip',
  metricTotalReturns: 'metric-total-returns',
  metricWealthMultiplier: 'metric-wealth-multiplier',
  metricInflationAdjustedCorpus: 'metric-inflation-adjusted-corpus',
  metricInflationAdjustedMultiplier: 'metric-inflation-adjusted-multiplier',

  // Parameters panel
  parametersPanel: 'parameters-panel',
  paramReset: 'param-reset',

  currencySelector: 'currency-selector',
  currencyOption: (currency: string) => `currency-option-${currency}`,
  modeToggle: 'mode-toggle',
  modeOption: (mode: string) => `mode-option-${mode}`,

  // Generic slider+input control: each field exposes a slider and a number input.
  fieldSlider: (field: string) => `field-${field}-slider`,
  fieldInput: (field: string) => `field-${field}-input`,

  // Step-up controls
  sipStepUpMethod: 'sip-stepup-method',
  sipStepUpMethodOption: (method: string) => `sip-stepup-method-${method}`,
  swpStepUpMethod: 'swp-stepup-method',
  swpStepUpMethodOption: (method: string) => `swp-stepup-method-${method}`,

  // Inflation
  inflationToggle: 'inflation-toggle',

  // Visualizations
  wealthMountain: 'wealth-mountain',
  wealthMountainTooltip: 'wealth-mountain-tooltip',
  wealthDonut: 'wealth-donut',
  compositionInvested: 'composition-invested',
  compositionReturns: 'composition-returns',
  compositionInsight: 'composition-insight',

  // Wealth Journey Timeline
  timeline: 'wealth-journey-timeline',
  timelineNode: (kind: string) => `timeline-node-${kind}`,

  // Milestone / Crorepati Countdown
  milestoneCountdown: 'milestone-countdown',
  milestoneRow: (value: number) => `milestone-row-${value}`,
  milestoneEmpty: 'milestone-empty',

  // AI Wealth Insights
  insights: 'ai-wealth-insights',
  insightCard: (id: string) => `insight-${id}`,

  // Projection Ledger table
  projectionTable: 'projection-table',
  tableViewToggle: 'table-view-toggle',
  tableViewOption: (view: string) => `table-view-${view}`,
  tableSearch: 'table-search',
  tablePhaseFilter: 'table-phase-filter',
  tablePhaseOption: (phase: string) => `table-phase-${phase}`,
  tableSortHeader: (key: string) => `table-sort-${key}`,
  tableRow: (year: number) => `table-row-${year}`,
  tableCard: (year: number) => `table-card-${year}`,
  tableEmpty: 'table-empty',
  tableSummaryInvestment: 'table-summary-investment',
  tableSummaryWithdrawal: 'table-summary-withdrawal',
  tableSummaryReturns: 'table-summary-returns',
  tableSummaryFinalCorpus: 'table-summary-final-corpus',

  // PDF report
  downloadReport: 'download-report',
  downloadReportProgress: 'download-report-progress',
  downloadReportError: 'download-report-error',
  downloadReportSuccess: 'download-report-success',

  // Share scenario
  shareScenario: 'share-scenario',
  toast: 'toast',

  // FAQ
  faqSection: 'faq-section',
  faqItem: (index: number) => `faq-item-${index}`,

  // Resilience
  errorBoundary: 'error-boundary',

  trustFooter: 'trust-footer',
} as const;

type TestIdValue = (typeof TESTIDS)[keyof typeof TESTIDS];
/** All static (string) test ids. Function entries build ids dynamically. */
export type TestId = Extract<TestIdValue, string>;

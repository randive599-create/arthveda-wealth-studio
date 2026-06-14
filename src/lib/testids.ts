/**
 * Central registry of `data-testid` values.
 *
 * Keeping every test id in one typed object prevents typos and makes the
 * testable surface of the app discoverable. Components import from here rather
 * than hard-coding strings, and tests assert against the same constants.
 */

export const TESTIDS = {
  appShell: 'app-shell',

  // Sitewide calculator navigation (top bar)
  calculatorNav: 'calculator-nav',
  navBrand: 'nav-brand',
  navToggle: 'nav-toggle',
  navMenuDesktop: 'nav-menu-desktop',
  navMenuMobile: 'nav-menu-mobile',
  navLink: (path: string) => `nav-link-${path === '/' ? 'home' : path.replace(/^\//, '')}`,

  // "Explore Other Calculators" cross-link section
  exploreCalculators: 'explore-calculators',
  exploreCalculatorCard: (path: string) => `explore-card-${path.replace(/^\//, '')}`,

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

  // SIP calculator landing page
  sipCalculatorPage: 'sip-calculator-page',
  sipFaqSection: 'sip-faq-section',
  sipFaqItem: (index: number) => `sip-faq-item-${index}`,
  sipInternalLinks: 'sip-internal-links',

  // Dedicated SIP calculator experience
  sipCalculator: 'sip-calculator',
  sipControls: 'sip-controls',
  sipAdvancedToggle: 'sip-advanced-toggle',
  sipAdvancedFields: 'sip-advanced-fields',
  sipAmountPreset: (amount: number) => `sip-amount-preset-${amount}`,
  sipDurationPreset: (years: number) => `sip-duration-preset-${years}`,
  sipSummary: 'sip-summary',
  sipAdvancedResults: 'sip-advanced-results',
  sipOutput: (key: string) => `sip-output-${key}`,
  sipChart: (key: string) => `sip-chart-${key}`,
  sipComparison: 'sip-comparison',
  sipComparisonRow: (amount: number) => `sip-comparison-row-${amount}`,
  sipTargets: 'sip-targets',
  sipReportButton: 'sip-report-button',
  sipReportSuccess: 'sip-report-success',
  sipReportError: 'sip-report-error',

  // Retirement calculator landing page
  retirementCalculatorPage: 'retirement-calculator-page',
  retirementFaqSection: 'retirement-faq-section',
  retirementFaqItem: (index: number) => `retirement-faq-item-${index}`,
  retirementInternalLinks: 'retirement-internal-links',

  // Dedicated Retirement planner experience
  retirementPlanner: 'retirement-planner',
  retirementControls: 'retirement-controls',
  retirementSummary: 'retirement-summary',
  retirementSustainability: 'retirement-sustainability',
  retirementOutput: (key: string) => `retirement-output-${key}`,
  retirementChart: (key: string) => `retirement-chart-${key}`,
  retirementReportButton: 'retirement-report-button',
  retirementReportSuccess: 'retirement-report-success',
  retirementReportError: 'retirement-report-error',

  // SWP calculator landing page
  swpCalculatorPage: 'swp-calculator-page',
  swpFaqSection: 'swp-faq-section',
  swpFaqItem: (index: number) => `swp-faq-item-${index}`,
  swpInternalLinks: 'swp-internal-links',

  // Dedicated SWP calculator experience
  swpCalculator: 'swp-calculator',
  swpControls: 'swp-controls',
  swpSummary: 'swp-summary',
  swpSurvivalIndicator: 'swp-survival-indicator',
  swpOutput: (key: string) => `swp-output-${key}`,
  swpChart: (key: string) => `swp-chart-${key}`,
  swpReportButton: 'swp-report-button',
  swpReportSuccess: 'swp-report-success',
  swpReportError: 'swp-report-error',

  // Lumpsum calculator landing page
  lumpsumCalculatorPage: 'lumpsum-calculator-page',
  lumpsumFaqSection: 'lumpsum-faq-section',
  lumpsumFaqItem: (index: number) => `lumpsum-faq-item-${index}`,
  lumpsumInternalLinks: 'lumpsum-internal-links',

  // Dedicated Lumpsum calculator experience
  lumpsumCalculator: 'lumpsum-calculator',
  lumpsumControls: 'lumpsum-controls',
  lumpsumSummary: 'lumpsum-summary',
  lumpsumHeadline: 'lumpsum-headline',
  lumpsumOutput: (key: string) => `lumpsum-output-${key}`,
  lumpsumChart: (key: string) => `lumpsum-chart-${key}`,
  lumpsumReportButton: 'lumpsum-report-button',
  lumpsumReportSuccess: 'lumpsum-report-success',
  lumpsumReportError: 'lumpsum-report-error',

  // FIRE calculator landing page
  fireCalculatorPage: 'fire-calculator-page',
  fireFaqSection: 'fire-faq-section',
  fireFaqItem: (index: number) => `fire-faq-item-${index}`,
  fireInternalLinks: 'fire-internal-links',

  // Dedicated FIRE calculator experience
  fireCalculator: 'fire-calculator',
  fireControls: 'fire-controls',
  fireSummary: 'fire-summary',
  fireSuccessIndicator: 'fire-success-indicator',
  fireOutput: (key: string) => `fire-output-${key}`,
  fireChart: (key: string) => `fire-chart-${key}`,
  fireReportButton: 'fire-report-button',
  fireReportSuccess: 'fire-report-success',
  fireReportError: 'fire-report-error',

  // Resilience
  errorBoundary: 'error-boundary',

  trustFooter: 'trust-footer',
  footerContact: 'footer-contact',
} as const;

type TestIdValue = (typeof TESTIDS)[keyof typeof TESTIDS];
/** All static (string) test ids. Function entries build ids dynamically. */
export type TestId = Extract<TestIdValue, string>;

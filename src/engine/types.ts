/**
 * Domain types for the ArthVeda wealth projection engine.
 *
 * This module is pure data: it contains no logic, no React, and no I/O. Every
 * other engine module and every UI surface speaks in terms of these types.
 */

import type { TimelineNode } from './timeline';

/** Supported display/calculation currencies. */
export type Currency = 'INR' | 'USD' | 'EUR';

/**
 * The projection mode.
 *
 *   - 'accumulation' — "Wealth Accumulation Only": a pure accumulation/growth
 *     plan with no income phase. No year is reserved for withdrawals; SIP runs
 *     through `sipStopYear` (which may be the full horizon) and the corpus
 *     compounds thereafter. Withdrawal parameters are retained for UI state but
 *     are ignored by the engine.
 *   - 'income' — "Wealth Accumulation + Income Distribution": the full
 *     three-phase model (accumulation -> growth -> withdrawal), where withdrawal
 *     takes precedence when phase boundaries meet.
 */
export type ProjectionMode = 'accumulation' | 'income';

/** Step-up can be expressed as a percentage of the current amount or a flat sum. */
export type StepUpMethod = 'percentage' | 'fixed';

/** The lifecycle phase a given month (or year) belongs to. */
export type Phase = 'accumulation' | 'growth' | 'withdrawal';

/**
 * Configuration for an annual step-up of either SIP contributions or SWP
 * withdrawals. Only the field matching `method` is used; the other is retained
 * so the UI can toggle without losing the inactive value.
 */
export interface StepUpConfig {
  method: StepUpMethod;
  /** Annual increase as a percentage of the current amount (used when method = 'percentage'). */
  percentage: number;
  /** Annual flat increase in currency units (used when method = 'fixed'). */
  amount: number;
}

/** Inflation-adjustment settings. */
export interface InflationConfig {
  enabled: boolean;
  /** Annual inflation rate as a percentage (0–20). */
  rate: number;
}

/**
 * The complete, validated set of parameters that drives a projection. All
 * monetary values are expressed in whole currency units of `currency`.
 */
export interface ProjectionInputs {
  currency: Currency;

  /**
   * Whether the plan includes an income/withdrawal phase. In 'accumulation'
   * mode the withdrawal parameters below are ignored by the engine.
   */
  mode: ProjectionMode;

  /** One-time initial investment made at the very start of month 1. */
  lumpsum: number;
  /** Base monthly SIP contribution for year 1. */
  monthlySip: number;
  /** Annual step-up applied to the SIP from the start of each new year. */
  sipStepUp: StepUpConfig;

  /** Annual return rate (%) used during accumulation and growth phases. */
  annualReturnRate: number;
  /** Total projection horizon in whole years. */
  durationYears: number;
  /** Last year (inclusive) in which SIP contributions are made. */
  sipStopYear: number;
  /** First year in which withdrawals begin. Must be >= sipStopYear. */
  withdrawalStartYear: number;

  /** Annual return rate (%) used during the withdrawal phase. */
  withdrawalReturnRate: number;
  /** Base monthly SWP withdrawal for the first withdrawal year. */
  monthlySwp: number;
  /** Annual step-up applied to the SWP from the start of each new withdrawal year. */
  swpStepUp: StepUpConfig;

  inflation: InflationConfig;
}

/** A single month of the simulation. The ledger is the engine's source of truth. */
export interface MonthRow {
  /** 1-based month index across the whole projection. */
  month: number;
  /** 1-based calendar year this month belongs to (`ceil(month / 12)`). */
  year: number;
  phase: Phase;
  /** SIP contributed at the start of this month. */
  sip: number;
  /** Actual SWP withdrawn at the start of this month (may be capped by the balance). */
  swp: number;
  /** Lumpsum injected this month (non-zero only in month 1). */
  lumpsum: number;
  /** Corpus at the end of the month, after flows and growth. */
  corpus: number;
  /** Cumulative capital invested to date (lumpsum + all SIPs). */
  totalInvested: number;
  /** Cumulative amount withdrawn to date. */
  totalWithdrawn: number;
  /** Cumulative returns to date: `corpus + totalWithdrawn - totalInvested`. */
  returns: number;
}

/** A year-end snapshot aggregated from the monthly ledger. Drives the table and charts. */
export interface YearRow {
  /** 1-based calendar year. */
  year: number;
  phase: Phase;
  /** Total SIP contributed during this year. */
  sipAnnual: number;
  /** Total withdrawn during this year. */
  swpAnnual: number;
  /** Cumulative capital invested by the end of this year. */
  totalInvested: number;
  /** Cumulative amount withdrawn by the end of this year. */
  totalWithdrawn: number;
  /** Cumulative returns by the end of this year. */
  returns: number;
  /** Corpus at the end of this year. */
  corpus: number;
}

/** One inflation-adjusted year, pairing nominal and present-value (Year 0) figures. */
export interface InflationYear {
  year: number;
  nominalCorpus: number;
  realCorpus: number;
  /** Nominal amount withdrawn during the year. */
  nominalWithdrawal: number;
  /** Present value (Year 0) of the amount withdrawn during the year. */
  realWithdrawal: number;
}

/** Headline dashboard metrics derived from the ledger. */
export interface Summary {
  /** Total capital invested across the whole projection (lumpsum + all SIPs). */
  totalInvestment: number;
  /** Corpus at the end of `sipStopYear`. */
  corpusAtSipStop: number;
  /** Total amount withdrawn across the whole projection. */
  totalWithdrawn: number;
  /** Corpus at the end of the final year. */
  finalCorpus: number;
  /** Total returns: `finalCorpus + totalWithdrawn - totalInvestment`. */
  totalReturns: number;
  /** Gross value returned per unit invested: `(finalCorpus + totalWithdrawn) / totalInvestment`. */
  wealthMultiplier: number;
  /**
   * Year the headline milestone is first reached (INR: ₹1 Crore; USD/EUR: 1M),
   * or `null` if never reached within the horizon.
   */
  firstCroreYear: number | null;

  /** Present value (Year 0) of the final corpus. `null` when inflation is disabled. */
  inflationAdjustedCorpus: number | null;
  /** Present value (Year 0) of total withdrawals. `null` when inflation is disabled. */
  inflationAdjustedTotalWithdrawn: number | null;
  /** Real wealth multiplier using present-valued flows. `null` when inflation is disabled. */
  inflationAdjustedWealthMultiplier: number | null;
}

/** Invested-vs-returns split of the gross wealth created. */
export interface Composition {
  /** Total capital invested. */
  investedCapital: number;
  /** Total returns generated (never negative for display purposes). */
  returnsGenerated: number;
  /** `investedCapital + returnsGenerated`. */
  totalValue: number;
  /** Percentage of gross value attributable to returns/compounding (0–100). */
  returnsPercentage: number;
}

/** A wealth milestone that was actually achieved within the projection horizon. */
export interface Milestone {
  /** Threshold value in currency units. */
  value: number;
  /** Localized label, e.g. "₹1 Crore" or "$1M". */
  label: string;
  /** Month index at which the threshold is first reached. */
  reachedMonth: number;
  /** Calendar year at which the threshold is first reached. */
  reachedYear: number;
  /** Years from the start (Year 0) until the threshold is reached. */
  yearsRemaining: number;
  /** Corpus value at the month the threshold is first reached. */
  corpusAtAchievement: number;
}

/** The three institutional insight categories. */
export type InsightCategory = 'opportunity' | 'observation' | 'risk';

/**
 * A single institutional observation derived deterministically from the
 * projection. `score` is an internal relevance ranking (0–100) used only to
 * select and order insights; it is never surfaced to the user.
 */
export interface Insight {
  /** Stable identifier for the rule that produced this insight (for testing/keys). */
  id: string;
  category: InsightCategory;
  headline: string;
  explanation: string;
  /** Internal relevance score; higher ranks first. Not displayed. */
  score: number;
}

/** Diagnostic flags about the run. */
export interface ProjectionFlags {
  /** True if a withdrawal could not be fully met and the corpus was exhausted. */
  depleted: boolean;
  /** Calendar year in which depletion first occurred, or `null`. */
  depletionYear: number | null;
}

/**
 * The canonical output of the engine. Every UI surface (dashboard, charts,
 * timeline, milestones, table, PDF) is a pure projection of this object.
 */
export interface ProjectionResult {
  inputs: ProjectionInputs;
  monthly: MonthRow[];
  yearly: YearRow[];
  summary: Summary;
  composition: Composition;
  /** Inflation-adjusted series, or `null` when inflation is disabled. */
  inflation: InflationYear[] | null;
  milestones: Milestone[];
  /** Section title that adapts to currency ("Crorepati Countdown" / "Milestone Countdown"). */
  milestoneTitle: string;
  /** Lifecycle journey nodes (start, SIP stop, optional withdrawal start, final). */
  timeline: TimelineNode[];
  /** Ranked institutional observations (3–5), derived deterministically. */
  insights: Insight[];
  flags: ProjectionFlags;
}

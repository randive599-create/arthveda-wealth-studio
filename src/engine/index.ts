/**
 * Public engine entry point.
 *
 * `buildProjection` is a pure function: given a set of (already validated)
 * inputs it returns the canonical `ProjectionResult` from which every UI surface
 * is derived. It performs one monthly simulation and then computes all
 * derivations from that single ledger.
 */

import { aggregateYearly } from './aggregate';
import { computeComposition } from './composition';
import { buildInflationSeries } from './inflation';
import { generateInsights } from './insights';
import { runLedger } from './ledger';
import { detectMilestones, milestoneTitle } from './milestones';
import { computeSummary } from './summary';
import { buildTimeline } from './timeline';
import type { ProjectionInputs, ProjectionResult } from './types';

/**
 * Run a complete wealth projection.
 *
 * @param inputs validated projection parameters. Use `state/schema.ts` to
 *   validate or clamp raw/untrusted input before calling this.
 */
export function buildProjection(inputs: ProjectionInputs): ProjectionResult {
  const ledger = runLedger(inputs);
  const monthly = ledger.rows;
  const yearly = aggregateYearly(monthly);

  const summary = computeSummary(inputs, monthly, yearly);
  const composition = computeComposition(summary.totalInvestment, summary.totalReturns);
  const milestones = detectMilestones(monthly, inputs.currency);
  const timeline = buildTimeline(inputs, yearly);
  const inflation = inputs.inflation.enabled
    ? buildInflationSeries(yearly, inputs.inflation.rate)
    : null;

  const result: ProjectionResult = {
    inputs,
    monthly,
    yearly,
    summary,
    composition,
    inflation,
    milestones,
    milestoneTitle: milestoneTitle(inputs.currency),
    timeline,
    insights: [],
    flags: {
      depleted: ledger.depleted,
      depletionYear: ledger.depletionYear,
    },
  };

  // Insights are derived from the assembled result, so they are computed last
  // and then attached. This keeps every rule reading from the final metrics.
  result.insights = generateInsights(result);

  return result;
}

export * from './types';
export {
  MIN_RETURN_RATE,
  MAX_RETURN_RATE,
  MIN_DURATION_YEARS,
  MAX_DURATION_YEARS,
  MIN_INFLATION_RATE,
  MAX_INFLATION_RATE,
  DEFAULT_INFLATION_RATE,
  SUPPORTED_CURRENCIES,
} from './constants';
export { monthlyRate, monthlyGrowthFactor } from './rates';
export { phaseOfYear, yearOfMonth } from './phases';
export { steppedAmount } from './stepUp';
export { presentValue } from './inflation';
export {
  detectMilestones,
  milestoneTitle,
  headlineMilestoneValue,
  firstYearReaching,
} from './milestones';
export { buildTimeline } from './timeline';
export type { TimelineNode, TimelineNodeKind } from './timeline';
export { generateInsights } from './insights';

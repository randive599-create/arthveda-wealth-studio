/**
 * Deterministic AI Wealth Insights engine.
 *
 * This is NOT an LLM, chatbot, or external API. It is a pure, deterministic
 * financial rules engine: given a `ProjectionResult` it evaluates a fixed set
 * of rules against the projection's metrics and returns institutional-quality
 * observations. The same inputs always yield the same insights.
 *
 * How it works:
 *   1. A set of independent rules each inspect the projection and may emit a
 *      candidate insight with an internal relevance `score` (0–100).
 *   2. Candidates are ranked by score (descending), with a stable tie-break on
 *      rule id so ordering is fully deterministic.
 *   3. The top N (default 5, minimum 3 where available) are returned.
 *
 * The `score` is internal only — it is used for ranking and never displayed.
 *
 * Tone: private-wealth / family-office commentary. No marketing language, no
 * hype, no emojis. Phrasing is measured and uses "may"/"is expected to" rather
 * than guarantees.
 */

import { presentValue } from './inflation';
import { formatInsightCurrency } from './insightFormat';
import type { Insight, InsightCategory, ProjectionInputs, ProjectionResult } from './types';

const MAX_INSIGHTS = 5;
const MIN_INSIGHTS = 3;

interface Candidate {
  id: string;
  category: InsightCategory;
  headline: string;
  explanation: string;
  score: number;
}

/** Round a 0–1 fraction to a whole percentage. */
function pct(fraction: number): number {
  return Math.round(fraction * 100);
}

/**
 * The proportion of the first withdrawal year's income relative to the corpus
 * available at the start of withdrawals — a standard sustainability gauge.
 */
function initialWithdrawalRate(result: ProjectionResult): number | null {
  const { inputs } = result;
  if (inputs.mode !== 'income' || inputs.monthlySwp <= 0) {
    return null;
  }
  const withdrawalNode = result.timeline.find((n) => n.kind === 'withdrawal');
  const corpusAtStart = withdrawalNode?.corpus ?? 0;
  if (corpusAtStart <= 0) {
    return null;
  }
  const firstYearWithdrawal = inputs.monthlySwp * 12;
  return firstYearWithdrawal / corpusAtStart;
}

/** Accumulation horizon length in years (years during which SIP runs). */
function accumulationYears(inputs: ProjectionInputs): number {
  return Math.min(inputs.sipStopYear, inputs.durationYears);
}

type Rule = (result: ProjectionResult) => Candidate | null;

/* -------------------------------------------------------------------------- */
/* Observation rules                                                          */
/* -------------------------------------------------------------------------- */

/** Most wealth comes from returns rather than contributions. */
const ruleCompoundingShare: Rule = (result) => {
  const share = result.composition.returnsPercentage;
  if (share < 50) {
    return null;
  }
  return {
    id: 'compounding-share',
    category: 'observation',
    headline: `${Math.round(share)}% of projected wealth is generated through returns`,
    explanation:
      'The majority of the projected corpus is attributable to investment returns rather than ' +
      'contributed capital. This underscores the central role of compounding over the plan horizon.',
    // More compelling the higher the share above 50%.
    score: 55 + Math.min(40, (share - 50) * 0.8),
  };
};

/**
 * Complement of {@link ruleCompoundingShare}: when contributed capital is the
 * larger component, that itself is a meaningful observation. Exactly one of the
 * two fires for any projection, guaranteeing a composition observation exists.
 */
const ruleContributionShare: Rule = (result) => {
  const returnsShare = result.composition.returnsPercentage;
  if (returnsShare >= 50) {
    return null;
  }
  const investedShare = 100 - returnsShare;
  return {
    id: 'contribution-share',
    category: 'observation',
    headline: `Contributed capital accounts for ${Math.round(investedShare)}% of projected wealth`,
    explanation:
      'Invested capital, rather than returns, constitutes the larger share of the projected ' +
      'corpus. A higher assumed return or a longer horizon would increase the contribution of ' +
      'compounding to the outcome.',
    score: 38,
  };
};

/** Always-available observation summarising the headline outcome. */
const ruleOutcomeSummary: Rule = (result) => {
  const { inputs, summary } = result;
  if (summary.totalInvestment <= 0) {
    return null;
  }
  return {
    id: 'outcome-summary',
    category: 'observation',
    headline: `Total contributions of ${formatInsightCurrency(
      summary.totalInvestment,
      inputs.currency,
    )} are projected to reach ${formatInsightCurrency(summary.finalCorpus, inputs.currency)}`,
    explanation:
      'The projection translates cumulative contributions into a terminal corpus under the ' +
      'selected assumptions, providing a baseline against which alternative scenarios can be ' +
      'compared.',
    score: 20,
  };
};

/** Growth concentrates in the later years of accumulation. */
const ruleLateGrowth: Rule = (result) => {
  const accumYears = accumulationYears(result.inputs);
  if (accumYears < 6) {
    return null;
  }
  const half = Math.floor(accumYears / 2);
  const firstHalf = result.yearly[half - 1]?.corpus ?? 0;
  const atSipStop = result.summary.corpusAtSipStop;
  if (atSipStop <= 0) {
    return null;
  }
  const secondHalfShare = (atSipStop - firstHalf) / atSipStop;
  if (secondHalfShare < 0.5) {
    return null;
  }
  return {
    id: 'late-growth',
    category: 'observation',
    headline: `${pct(secondHalfShare)}% of accumulation-phase growth occurs in its second half`,
    explanation:
      'Corpus accumulation is markedly back-loaded: the latter half of the contribution period ' +
      'contributes the larger share of growth, consistent with the accelerating nature of compounding.',
    score: 50 + Math.min(35, (secondHalfShare - 0.5) * 70),
  };
};

/** Accumulation contributes more to final wealth than the withdrawal phase. */
const ruleAccumulationDominates: Rule = (result) => {
  const { inputs } = result;
  if (inputs.mode !== 'income') {
    return null;
  }
  if (result.summary.corpusAtSipStop <= result.summary.finalCorpus) {
    return null;
  }
  return {
    id: 'accumulation-dominates',
    category: 'observation',
    headline: 'The accumulation phase is the principal driver of terminal wealth',
    explanation:
      'The corpus built before withdrawals begin exceeds the final corpus, indicating that the ' +
      'accumulation phase, rather than later-phase growth, is the primary determinant of outcomes.',
    score: 48,
  };
};

/** Wealth multiplier observation. */
const ruleWealthMultiplier: Rule = (result) => {
  const m = result.summary.wealthMultiplier;
  if (m < 2) {
    return null;
  }
  return {
    id: 'wealth-multiplier',
    category: 'observation',
    headline: `Projected gross value is ${m.toFixed(1)}x invested capital`,
    explanation:
      'For every unit of capital contributed, the projection returns a multiple in gross value ' +
      '(final corpus plus any distributions), reflecting the cumulative effect of the assumed return.',
    score: 40 + Math.min(30, (m - 2) * 4),
  };
};

/* -------------------------------------------------------------------------- */
/* Opportunity rules                                                          */
/* -------------------------------------------------------------------------- */

/** A SIP step-up could meaningfully lift terminal wealth. */
const ruleSipStepUpOpportunity: Rule = (result) => {
  const { inputs } = result;
  if (inputs.monthlySip <= 0) {
    return null;
  }
  const hasStepUp =
    (inputs.sipStepUp.method === 'percentage' && inputs.sipStepUp.percentage > 0) ||
    (inputs.sipStepUp.method === 'fixed' && inputs.sipStepUp.amount > 0);
  if (hasStepUp) {
    return null;
  }
  return {
    id: 'sip-stepup-opportunity',
    category: 'opportunity',
    headline: 'Introducing an annual SIP step-up may materially improve projected wealth',
    explanation:
      'Contributions are currently held flat across the accumulation period. Escalating the ' +
      'monthly contribution each year, in line with income growth, would compound additional ' +
      'capital and is expected to raise the terminal corpus.',
    score: 72,
  };
};

/** Extending the horizon accelerates compounding. */
const ruleHorizonOpportunity: Rule = (result) => {
  const { inputs } = result;
  if (inputs.durationYears >= 25) {
    return null;
  }
  return {
    id: 'horizon-opportunity',
    category: 'opportunity',
    headline: 'Extending the investment horizon would amplify compounding',
    explanation:
      'The current horizon is comparatively short. Because compounding accelerates over time, ' +
      'each additional year of investment is expected to contribute disproportionately to ' +
      'terminal wealth.',
    score: 60 + Math.min(20, (25 - inputs.durationYears)),
  };
};

/** Reducing withdrawals improves sustainability (when withdrawal rate is high). */
const ruleReduceWithdrawalOpportunity: Rule = (result) => {
  const rate = initialWithdrawalRate(result);
  if (rate === null || rate < 0.06 || result.flags.depleted) {
    return null;
  }
  return {
    id: 'reduce-withdrawal-opportunity',
    category: 'opportunity',
    headline: 'Moderating withdrawals would strengthen long-term corpus sustainability',
    explanation:
      `The initial withdrawal represents approximately ${pct(rate)}% of the corpus at the onset ` +
      'of distributions. Reducing the withdrawal rate would preserve more capital for continued ' +
      'compounding and extend the longevity of the portfolio.',
    score: 64,
  };
};

/* -------------------------------------------------------------------------- */
/* Risk rules                                                                 */
/* -------------------------------------------------------------------------- */

/** Inflation erodes purchasing power. */
const ruleInflationRisk: Rule = (result) => {
  const { inputs } = result;
  if (!inputs.inflation.enabled || inputs.inflation.rate <= 0) {
    return null;
  }
  const nominal = result.summary.finalCorpus;
  const real = result.summary.inflationAdjustedCorpus ?? presentValue(
    nominal,
    inputs.durationYears,
    inputs.inflation.rate,
  );
  if (nominal <= 0) {
    return null;
  }
  const erosion = 1 - real / nominal;
  if (erosion < 0.1) {
    return null;
  }
  return {
    id: 'inflation-risk',
    category: 'risk',
    headline: `Inflation reduces the real value of the final corpus by ${pct(erosion)}%`,
    explanation:
      `At an assumed ${inputs.inflation.rate}% inflation, the terminal corpus of ` +
      `${formatInsightCurrency(nominal, inputs.currency)} corresponds to approximately ` +
      `${formatInsightCurrency(real, inputs.currency)} in today's purchasing power. Inflation ` +
      'materially diminishes future real wealth and warrants consideration in planning.',
    score: 70 + Math.min(20, (erosion - 0.1) * 30),
  };
};

/** Withdrawals exhaust the corpus before the horizon ends. */
const ruleDepletionRisk: Rule = (result) => {
  if (!result.flags.depleted || result.flags.depletionYear === null) {
    return null;
  }
  return {
    id: 'depletion-risk',
    category: 'risk',
    headline: `Projected withdrawals exhaust the corpus in Year ${result.flags.depletionYear}`,
    explanation:
      'Under the current assumptions the portfolio is fully depleted before the end of the ' +
      'projection horizon. The withdrawal schedule is not sustainable for the full duration and ' +
      'should be revisited to avoid a funding shortfall.',
    score: 95,
  };
};

/** Aggressive withdrawal rate (sustainable but high). */
const ruleAggressiveWithdrawalRisk: Rule = (result) => {
  const rate = initialWithdrawalRate(result);
  if (rate === null || rate < 0.08 || result.flags.depleted) {
    return null;
  }
  return {
    id: 'aggressive-withdrawal-risk',
    category: 'risk',
    headline: `The initial withdrawal rate of ${pct(rate)}% is aggressive`,
    explanation:
      'The first-year distribution is a high proportion of the available corpus. Sustained ' +
      'withdrawals at this level increase sequence-of-returns risk and may compromise the ' +
      'longevity of the portfolio if returns disappoint.',
    score: 78,
  };
};

/** Short accumulation horizon limits compounding. */
const ruleShortAccumulationRisk: Rule = (result) => {
  const accumYears = accumulationYears(result.inputs);
  if (accumYears >= 10) {
    return null;
  }
  return {
    id: 'short-accumulation-risk',
    category: 'risk',
    headline: 'A short accumulation horizon constrains compounding potential',
    explanation:
      `Contributions span only ${accumYears} year${accumYears === 1 ? '' : 's'} before the ` +
      'accumulation phase ends. A limited contribution window restricts the time available for ' +
      'returns to compound and tends to lower terminal wealth.',
    score: 58,
  };
};

/* -------------------------------------------------------------------------- */
/* Fallback observation (ensures a non-empty, meaningful section)             */
/* -------------------------------------------------------------------------- */

/** A baseline observation that always applies, used to reach the minimum count. */
const ruleBaselineObservation: Rule = (result) => {
  const years = result.inputs.durationYears;
  return {
    id: 'baseline-horizon',
    category: 'observation',
    headline: `The projection spans a ${years}-year horizon`,
    explanation:
      'Outcomes are modelled with monthly compounding across the full horizon under constant ' +
      'assumptions. Projected figures are illustrative and sensitive to the return, contribution, ' +
      'and inflation assumptions selected.',
    score: 10,
  };
};

/** A second always-available observation describing the modelling approach. */
const ruleMethodologyObservation: Rule = (result) => {
  const rate = result.inputs.annualReturnRate;
  return {
    id: 'methodology',
    category: 'observation',
    headline: `Returns are modelled at ${rate}% per annum with monthly compounding`,
    explanation:
      'The projection applies the assumed annual return on a monthly compounding basis throughout ' +
      'each phase. Adjusting the return assumption has a pronounced, non-linear effect on terminal ' +
      'wealth over long horizons.',
    score: 8,
  };
};

const RULES: Rule[] = [
  ruleDepletionRisk,
  ruleAggressiveWithdrawalRisk,
  ruleInflationRisk,
  ruleSipStepUpOpportunity,
  ruleReduceWithdrawalOpportunity,
  ruleHorizonOpportunity,
  ruleCompoundingShare,
  ruleContributionShare,
  ruleLateGrowth,
  ruleAccumulationDominates,
  ruleWealthMultiplier,
  ruleShortAccumulationRisk,
  ruleOutcomeSummary,
  ruleBaselineObservation,
  ruleMethodologyObservation,
];

/**
 * Generate the ranked institutional insights for a projection.
 *
 * Returns between {@link MIN_INSIGHTS} and {@link MAX_INSIGHTS} insights, ordered
 * by internal relevance score (descending) with a deterministic tie-break on
 * rule id. The baseline observation guarantees the section is never empty.
 */
export function generateInsights(result: ProjectionResult): Insight[] {
  const candidates: Candidate[] = [];
  for (const rule of RULES) {
    const candidate = rule(result);
    if (candidate !== null) {
      candidates.push(candidate);
    }
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.id.localeCompare(b.id);
  });

  const selected = candidates.slice(0, MAX_INSIGHTS);

  // The baseline rule always produces a candidate, so reaching MIN_INSIGHTS is
  // guaranteed for any valid projection; this clamp documents that contract.
  const count = Math.max(MIN_INSIGHTS, Math.min(selected.length, MAX_INSIGHTS));

  return selected.slice(0, Math.min(count, selected.length)).map((c) => ({
    id: c.id,
    category: c.category,
    headline: c.headline,
    explanation: c.explanation,
    score: Math.round(c.score),
  }));
}

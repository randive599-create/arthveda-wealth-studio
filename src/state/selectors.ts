/**
 * Section-scoped selectors.
 *
 * Each selector returns a stable slice of state so that UI sections subscribe
 * only to what they render (e.g. the projection table does not re-render when a
 * single dashboard card value changes). Selectors return references that live
 * inside `result`/`inputs`, so they are stable across unrelated state changes.
 */

import type {
  Composition,
  Currency,
  InflationConfig,
  InflationYear,
  Insight,
  Milestone,
  MonthRow,
  ProjectionInputs,
  ProjectionMode,
  ProjectionResult,
  Summary,
  YearRow,
} from '../engine/types';
import type { TimelineNode } from '../engine/timeline';
import type { StudioState } from './useStudioStore';

export const selectInputs = (s: StudioState): ProjectionInputs => s.inputs;
export const selectResult = (s: StudioState): ProjectionResult => s.result;

export const selectSummary = (s: StudioState): Summary => s.result.summary;
export const selectYearly = (s: StudioState): YearRow[] => s.result.yearly;
export const selectMonthly = (s: StudioState): MonthRow[] => s.result.monthly;
export const selectComposition = (s: StudioState): Composition => s.result.composition;
export const selectMilestones = (s: StudioState): Milestone[] => s.result.milestones;
export const selectMilestoneTitle = (s: StudioState): string => s.result.milestoneTitle;
export const selectTimeline = (s: StudioState): TimelineNode[] => s.result.timeline;
export const selectInsights = (s: StudioState): Insight[] => s.result.insights;
export const selectInflationSeries = (s: StudioState): InflationYear[] | null =>
  s.result.inflation;
export const selectFlags = (s: StudioState): ProjectionResult['flags'] => s.result.flags;

export const selectCurrency = (s: StudioState): Currency => s.inputs.currency;
export const selectMode = (s: StudioState): ProjectionMode => s.inputs.mode;
export const selectInflationConfig = (s: StudioState): InflationConfig => s.inputs.inflation;

export const selectScenarioLoadedFromUrl = (s: StudioState): boolean => s.scenarioLoadedFromUrl;

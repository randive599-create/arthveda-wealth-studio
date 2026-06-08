import { describe, expect, it } from 'vitest';
import { buildProjection } from '../index';
import { DEFAULT_INPUTS } from '../../state/defaults';

describe('buildProjection — default scenario (integration)', () => {
  const result = buildProjection(DEFAULT_INPUTS);

  it('produces a complete, well-shaped result', () => {
    expect(result.monthly).toHaveLength(DEFAULT_INPUTS.durationYears * 12);
    expect(result.yearly).toHaveLength(DEFAULT_INPUTS.durationYears);
    expect(result.inputs).toEqual(DEFAULT_INPUTS);
  });

  it('reports positive, finite headline metrics', () => {
    const { summary } = result;
    expect(summary.totalInvestment).toBeGreaterThan(0);
    expect(summary.finalCorpus).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(summary.finalCorpus)).toBe(true);
    expect(summary.totalWithdrawn).toBeGreaterThan(0);
    expect(summary.wealthMultiplier).toBeGreaterThan(0);
  });

  it('adapts milestones to INR and computes the first-crore year', () => {
    expect(result.milestoneTitle).toBe('Crorepati Countdown');
    expect(result.milestones.length).toBeGreaterThan(0);
    expect(result.summary.firstCroreYear).not.toBeNull();
  });

  it('provides inflation-adjusted figures (enabled by default)', () => {
    expect(result.inflation).not.toBeNull();
    expect(result.summary.inflationAdjustedCorpus).not.toBeNull();
    expect(result.composition.returnsPercentage).toBeGreaterThanOrEqual(0);
    expect(result.composition.returnsPercentage).toBeLessThanOrEqual(100);
  });
});

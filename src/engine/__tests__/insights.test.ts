import { describe, expect, it } from 'vitest';
import { buildProjection, generateInsights } from '../index';
import type { Insight } from '../types';
import { makeInputs } from './factory';

function ids(insights: Insight[]): string[] {
  return insights.map((i) => i.id);
}

describe('generateInsights — structure & ranking', () => {
  const result = buildProjection(
    makeInputs({
      mode: 'income',
      lumpsum: 500_000,
      monthlySip: 25_000,
      annualReturnRate: 12,
      durationYears: 30,
      sipStopYear: 20,
      withdrawalStartYear: 25,
      withdrawalReturnRate: 8,
      monthlySwp: 100_000,
      inflation: { enabled: true, rate: 6 },
    }),
  );

  it('returns between 3 and 5 insights', () => {
    expect(result.insights.length).toBeGreaterThanOrEqual(3);
    expect(result.insights.length).toBeLessThanOrEqual(5);
  });

  it('orders insights by descending internal score', () => {
    const scores = result.insights.map((i) => i.score);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });

  it('produces no duplicate rule ids', () => {
    const set = new Set(ids(result.insights));
    expect(set.size).toBe(result.insights.length);
  });

  it('assigns every insight a valid category', () => {
    for (const insight of result.insights) {
      expect(['opportunity', 'observation', 'risk']).toContain(insight.category);
      expect(insight.headline.length).toBeGreaterThan(0);
      expect(insight.explanation.length).toBeGreaterThan(0);
    }
  });

  it('is deterministic — identical inputs yield identical insights', () => {
    const again = buildProjection(result.inputs);
    expect(ids(again.insights)).toEqual(ids(result.insights));
  });
});

describe('generateInsights — inflation observations', () => {
  it('surfaces an inflation risk when inflation materially erodes value', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 1_000_000,
        monthlySip: 20_000,
        annualReturnRate: 10,
        durationYears: 30,
        sipStopYear: 30,
        inflation: { enabled: true, rate: 8 },
      }),
    );
    expect(ids(result.insights)).toContain('inflation-risk');
  });

  it('omits inflation risk when inflation is disabled', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 1_000_000,
        monthlySip: 20_000,
        annualReturnRate: 10,
        durationYears: 30,
        sipStopYear: 30,
        inflation: { enabled: false, rate: 0 },
      }),
    );
    expect(ids(result.insights)).not.toContain('inflation-risk');
  });
});

describe('generateInsights — withdrawal risks', () => {
  it('flags corpus depletion as the highest-priority risk', () => {
    const result = buildProjection(
      makeInputs({
        mode: 'income',
        lumpsum: 1_000_000,
        annualReturnRate: 0,
        withdrawalReturnRate: 0,
        durationYears: 10,
        sipStopYear: 1,
        withdrawalStartYear: 1,
        monthlySwp: 50_000,
      }),
    );
    expect(result.flags.depleted).toBe(true);
    expect(ids(result.insights)).toContain('depletion-risk');
    // Depletion carries the top score, so it must rank first.
    expect(result.insights[0].id).toBe('depletion-risk');
  });

  it('flags an aggressive (but non-depleting) withdrawal rate', () => {
    const result = buildProjection(
      makeInputs({
        mode: 'income',
        lumpsum: 10_000_000,
        monthlySip: 0,
        annualReturnRate: 10,
        withdrawalReturnRate: 9,
        durationYears: 12,
        sipStopYear: 1,
        withdrawalStartYear: 2,
        monthlySwp: 90_000,
      }),
    );
    expect(result.flags.depleted).toBe(false);
    expect(ids(result.insights)).toContain('aggressive-withdrawal-risk');
  });

  it('does not raise withdrawal risks in accumulation mode', () => {
    const result = buildProjection(
      makeInputs({
        mode: 'accumulation',
        lumpsum: 10_000_000,
        monthlySip: 10_000,
        annualReturnRate: 10,
        durationYears: 20,
        sipStopYear: 20,
        monthlySwp: 90_000,
      }),
    );
    expect(ids(result.insights)).not.toContain('aggressive-withdrawal-risk');
    expect(ids(result.insights)).not.toContain('depletion-risk');
  });
});

describe('generateInsights — opportunities', () => {
  it('suggests a SIP step-up when none is configured', () => {
    const result = buildProjection(
      makeInputs({
        mode: 'accumulation',
        lumpsum: 0,
        monthlySip: 20_000,
        sipStepUp: { method: 'percentage', percentage: 0, amount: 0 },
        annualReturnRate: 11,
        durationYears: 30,
        sipStopYear: 30,
      }),
    );
    expect(ids(result.insights)).toContain('sip-stepup-opportunity');
  });

  it('does not suggest a SIP step-up when one is already set', () => {
    const result = buildProjection(
      makeInputs({
        mode: 'accumulation',
        lumpsum: 0,
        monthlySip: 20_000,
        sipStepUp: { method: 'percentage', percentage: 10, amount: 0 },
        annualReturnRate: 11,
        durationYears: 30,
        sipStopYear: 30,
      }),
    );
    expect(ids(result.insights)).not.toContain('sip-stepup-opportunity');
  });

  it('suggests extending a short horizon', () => {
    const result = buildProjection(
      makeInputs({
        mode: 'accumulation',
        lumpsum: 100_000,
        monthlySip: 10_000,
        sipStepUp: { method: 'percentage', percentage: 10, amount: 0 },
        annualReturnRate: 10,
        durationYears: 10,
        sipStopYear: 10,
      }),
    );
    expect(ids(result.insights)).toContain('horizon-opportunity');
  });
});

describe('generateInsights — never empty', () => {
  it('always returns at least the minimum, including the baseline observation', () => {
    // A minimal, unremarkable plan still yields a populated section.
    const result = buildProjection(
      makeInputs({
        mode: 'accumulation',
        lumpsum: 0,
        monthlySip: 1_000,
        sipStepUp: { method: 'percentage', percentage: 10, amount: 0 },
        annualReturnRate: 1,
        durationYears: 30,
        sipStopYear: 30,
        inflation: { enabled: false, rate: 0 },
      }),
    );
    expect(result.insights.length).toBeGreaterThanOrEqual(3);
  });

  it('generateInsights can be called directly on a result', () => {
    const result = buildProjection(makeInputs({ durationYears: 30, sipStopYear: 30 }));
    const direct = generateInsights(result);
    expect(direct.length).toBeGreaterThanOrEqual(3);
    expect(direct).toEqual(result.insights);
  });
});

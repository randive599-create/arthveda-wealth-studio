import { describe, expect, it } from 'vitest';
import { buildProjection } from '../index';
import { buildTimeline } from '../timeline';
import { makeInputs } from './factory';

describe('buildTimeline — income mode', () => {
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
    }),
  );

  it('produces four nodes in lifecycle order', () => {
    expect(result.timeline.map((n) => n.kind)).toEqual([
      'start',
      'sipStop',
      'withdrawal',
      'final',
    ]);
  });

  it('anchors the start node at Year 0 with the lumpsum committed', () => {
    const start = result.timeline[0];
    expect(start.year).toBe(0);
    expect(start.yearsFromStart).toBe(0);
    expect(start.corpus).toBe(500_000);
    expect(start.totalInvested).toBe(500_000);
    expect(start.totalWithdrawn).toBe(0);
  });

  it('places SIP stop and withdrawal start at the configured years', () => {
    const sipStop = result.timeline[1];
    const withdrawal = result.timeline[2];
    expect(sipStop.year).toBe(20);
    expect(sipStop.corpus).toBe(result.yearly[19].corpus);
    expect(withdrawal.year).toBe(25);
    // Withdrawal start snapshot is the end of the previous year (year 24).
    expect(withdrawal.corpus).toBe(result.yearly[23].corpus);
  });

  it('ends at the final projection year with the final corpus', () => {
    const final = result.timeline[result.timeline.length - 1];
    expect(final.kind).toBe('final');
    expect(final.year).toBe(30);
    expect(final.corpus).toBe(result.summary.finalCorpus);
    expect(final.totalWithdrawn).toBe(result.summary.totalWithdrawn);
  });
});

describe('buildTimeline — accumulation mode', () => {
  const result = buildProjection(
    makeInputs({
      mode: 'accumulation',
      lumpsum: 500_000,
      monthlySip: 25_000,
      annualReturnRate: 12,
      durationYears: 30,
      sipStopYear: 30,
      withdrawalStartYear: 30,
      monthlySwp: 100_000,
    }),
  );

  it('omits the withdrawal node entirely', () => {
    expect(result.timeline.map((n) => n.kind)).toEqual(['start', 'sipStop', 'final']);
    expect(result.timeline.some((n) => n.kind === 'withdrawal')).toBe(false);
  });

  it('never reports any withdrawal across the timeline', () => {
    for (const node of result.timeline) {
      expect(node.totalWithdrawn).toBe(0);
    }
  });
});

describe('buildTimeline — direct invocation', () => {
  it('clamps node years within the available range', () => {
    const inputs = makeInputs({
      mode: 'income',
      durationYears: 10,
      sipStopYear: 5,
      withdrawalStartYear: 8,
    });
    const result = buildProjection(inputs);
    const timeline = buildTimeline(inputs, result.yearly);
    for (const node of timeline) {
      expect(node.year).toBeGreaterThanOrEqual(0);
      expect(node.year).toBeLessThanOrEqual(inputs.durationYears);
    }
  });
});

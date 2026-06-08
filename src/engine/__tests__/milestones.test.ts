import { describe, expect, it } from 'vitest';
import { buildProjection } from '../index';
import { detectMilestones, headlineMilestoneValue, milestoneTitle } from '../milestones';
import { makeInputs } from './factory';

describe('milestoneTitle', () => {
  it('uses Crorepati Countdown for INR and Milestone Countdown otherwise', () => {
    expect(milestoneTitle('INR')).toBe('Crorepati Countdown');
    expect(milestoneTitle('USD')).toBe('Milestone Countdown');
    expect(milestoneTitle('EUR')).toBe('Milestone Countdown');
  });
});

describe('headlineMilestoneValue', () => {
  it('is ₹1 Crore for INR and 1M for other currencies', () => {
    expect(headlineMilestoneValue('INR')).toBe(10_000_000);
    expect(headlineMilestoneValue('USD')).toBe(1_000_000);
    expect(headlineMilestoneValue('EUR')).toBe(1_000_000);
  });
});

describe('detectMilestones — INR', () => {
  it('returns only the tiers actually achieved, in ascending order', () => {
    const inputs = makeInputs({
      currency: 'INR',
      lumpsum: 10_000_000,
      durationYears: 1,
      sipStopYear: 1,
      withdrawalStartYear: 1,
    });
    const { monthly } = buildProjection(inputs);
    const milestones = detectMilestones(monthly, 'INR');

    // ₹1 Crore lumpsum clears 10L, 25L, 50L and 1Cr — but not 5Cr or 10Cr.
    expect(milestones.map((m) => m.label)).toEqual([
      '₹10 Lakh',
      '₹25 Lakh',
      '₹50 Lakh',
      '₹1 Crore',
    ]);
    for (const milestone of milestones) {
      expect(milestone.reachedYear).toBe(1);
      expect(milestone.reachedMonth).toBe(1);
      expect(milestone.corpusAtAchievement).toBeGreaterThanOrEqual(milestone.value);
    }
  });

  it('detects the extended high-net-worth tiers up to ₹100 Crore', () => {
    const inputs = makeInputs({
      currency: 'INR',
      lumpsum: 1_000_000_000,
      durationYears: 1,
      sipStopYear: 1,
      withdrawalStartYear: 1,
    });
    const { monthly } = buildProjection(inputs);
    const milestones = detectMilestones(monthly, 'INR');
    expect(milestones.map((m) => m.label)).toEqual([
      '₹10 Lakh',
      '₹25 Lakh',
      '₹50 Lakh',
      '₹1 Crore',
      '₹5 Crore',
      '₹10 Crore',
      '₹25 Crore',
      '₹50 Crore',
      '₹100 Crore',
    ]);
  });

  it('exposes the first-crore year on the summary', () => {
    const result = buildProjection(
      makeInputs({
        currency: 'INR',
        lumpsum: 10_000_000,
        durationYears: 1,
        sipStopYear: 1,
        withdrawalStartYear: 1,
      }),
    );
    expect(result.summary.firstCroreYear).toBe(1);
    expect(result.milestoneTitle).toBe('Crorepati Countdown');
  });
});

describe('detectMilestones — USD', () => {
  it('uses dollar tiers and the milestone title', () => {
    const result = buildProjection(
      makeInputs({
        currency: 'USD',
        lumpsum: 100_000,
        durationYears: 1,
        sipStopYear: 1,
        withdrawalStartYear: 1,
      }),
    );
    expect(result.milestones.map((m) => m.label)).toEqual(['$100K']);
    expect(result.milestoneTitle).toBe('Milestone Countdown');
    // Headline milestone (1M) is not reached.
    expect(result.summary.firstCroreYear).toBeNull();
  });

  it('detects the extended USD tiers up to $25M', () => {
    const result = buildProjection(
      makeInputs({
        currency: 'USD',
        lumpsum: 25_000_000,
        durationYears: 1,
        sipStopYear: 1,
        withdrawalStartYear: 1,
      }),
    );
    expect(result.milestones.map((m) => m.label)).toEqual([
      '$100K',
      '$250K',
      '$500K',
      '$1M',
      '$5M',
      '$10M',
      '$25M',
    ]);
  });
});

describe('detectMilestones — EUR', () => {
  it('detects the extended EUR tiers up to €25M', () => {
    const result = buildProjection(
      makeInputs({
        currency: 'EUR',
        lumpsum: 25_000_000,
        durationYears: 1,
        sipStopYear: 1,
        withdrawalStartYear: 1,
      }),
    );
    expect(result.milestones.map((m) => m.label)).toEqual([
      '€100K',
      '€250K',
      '€500K',
      '€1M',
      '€5M',
      '€10M',
      '€25M',
    ]);
    expect(result.milestoneTitle).toBe('Milestone Countdown');
  });
});

describe('detectMilestones — none achieved', () => {
  it('returns an empty list when no tier is reached', () => {
    const result = buildProjection(
      makeInputs({
        currency: 'INR',
        lumpsum: 100,
        durationYears: 1,
        sipStopYear: 1,
        withdrawalStartYear: 1,
      }),
    );
    expect(result.milestones).toEqual([]);
  });
});

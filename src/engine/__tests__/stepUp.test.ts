import { describe, expect, it } from 'vitest';
import { steppedAmount } from '../stepUp';
import type { StepUpConfig } from '../types';

const pct = (percentage: number): StepUpConfig => ({
  method: 'percentage',
  percentage,
  amount: 0,
});

const fixed = (amount: number): StepUpConfig => ({
  method: 'fixed',
  percentage: 0,
  amount,
});

describe('steppedAmount — percentage', () => {
  it('returns the base at step index 0', () => {
    expect(steppedAmount(25_000, 0, pct(10))).toBe(25_000);
  });

  it('applies a 10% step-up at the start of the next year', () => {
    expect(steppedAmount(25_000, 1, pct(10))).toBeCloseTo(27_500, 6);
  });

  it('compounds the step-up across multiple years', () => {
    expect(steppedAmount(25_000, 2, pct(10))).toBeCloseTo(30_250, 6);
  });
});

describe('steppedAmount — fixed', () => {
  it('returns the base at step index 0', () => {
    expect(steppedAmount(10_000, 0, fixed(2_000))).toBe(10_000);
  });

  it('adds a flat amount each year', () => {
    expect(steppedAmount(10_000, 1, fixed(2_000))).toBe(12_000);
    expect(steppedAmount(10_000, 3, fixed(2_000))).toBe(16_000);
  });
});

describe('steppedAmount — guards', () => {
  it('returns 0 when the base is 0', () => {
    expect(steppedAmount(0, 5, pct(10))).toBe(0);
    expect(steppedAmount(0, 5, fixed(2_000))).toBe(0);
  });

  it('never returns a negative amount', () => {
    expect(steppedAmount(1_000, 0, fixed(-100))).toBeGreaterThanOrEqual(0);
  });
});

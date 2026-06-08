import { describe, expect, it } from 'vitest';
import { isStartOfYear, phaseOfYear, yearOfMonth } from '../phases';

describe('yearOfMonth', () => {
  it('maps months to 1-based calendar years', () => {
    expect(yearOfMonth(1)).toBe(1);
    expect(yearOfMonth(12)).toBe(1);
    expect(yearOfMonth(13)).toBe(2);
    expect(yearOfMonth(24)).toBe(2);
    expect(yearOfMonth(25)).toBe(3);
  });
});

describe('isStartOfYear', () => {
  it('is true only on the first month of each year', () => {
    expect(isStartOfYear(1)).toBe(true);
    expect(isStartOfYear(13)).toBe(true);
    expect(isStartOfYear(25)).toBe(true);
    expect(isStartOfYear(2)).toBe(false);
    expect(isStartOfYear(12)).toBe(false);
  });
});

describe('phaseOfYear', () => {
  it('resolves accumulation, growth, and withdrawal with a gap year', () => {
    const sipStop = 5;
    const withdrawalStart = 10;
    expect(phaseOfYear(3, sipStop, withdrawalStart)).toBe('accumulation');
    expect(phaseOfYear(5, sipStop, withdrawalStart)).toBe('accumulation');
    expect(phaseOfYear(6, sipStop, withdrawalStart)).toBe('growth');
    expect(phaseOfYear(9, sipStop, withdrawalStart)).toBe('growth');
    expect(phaseOfYear(10, sipStop, withdrawalStart)).toBe('withdrawal');
    expect(phaseOfYear(12, sipStop, withdrawalStart)).toBe('withdrawal');
  });

  it('gives withdrawal precedence when withdrawalStart equals sipStop (no growth phase)', () => {
    const sipStop = 5;
    const withdrawalStart = 5;
    expect(phaseOfYear(4, sipStop, withdrawalStart)).toBe('accumulation');
    expect(phaseOfYear(5, sipStop, withdrawalStart)).toBe('withdrawal');
    expect(phaseOfYear(6, sipStop, withdrawalStart)).toBe('withdrawal');
  });
});

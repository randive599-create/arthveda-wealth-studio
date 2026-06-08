import { describe, expect, it } from 'vitest';
import { clampInputs, projectionInputsSchema, validateInputs } from '../schema';
import { DEFAULT_INPUTS } from '../defaults';

describe('validateInputs (strict)', () => {
  it('accepts the default scenario unchanged', () => {
    expect(validateInputs(DEFAULT_INPUTS)).toEqual(DEFAULT_INPUTS);
  });

  it('rejects withdrawalStartYear earlier than sipStopYear', () => {
    const bad = { ...DEFAULT_INPUTS, sipStopYear: 20, withdrawalStartYear: 5 };
    expect(() => validateInputs(bad)).toThrow();
  });

  it('rejects sipStopYear beyond the horizon', () => {
    const bad = { ...DEFAULT_INPUTS, durationYears: 10, sipStopYear: 11 };
    expect(() => validateInputs(bad)).toThrow();
  });

  it('rejects an annual return rate above 100%', () => {
    const bad = { ...DEFAULT_INPUTS, annualReturnRate: 101 };
    expect(() => validateInputs(bad)).toThrow();
  });

  it('rejects a duration beyond 100 years', () => {
    const bad = { ...DEFAULT_INPUTS, durationYears: 101 };
    expect(() => validateInputs(bad)).toThrow();
  });

  it('rejects an inflation rate above 20%', () => {
    const bad = { ...DEFAULT_INPUTS, inflation: { enabled: true, rate: 21 } };
    expect(() => validateInputs(bad)).toThrow();
  });

  it('accepts withdrawalStartYear equal to sipStopYear', () => {
    const ok = { ...DEFAULT_INPUTS, sipStopYear: 10, withdrawalStartYear: 10 };
    expect(() => validateInputs(ok)).not.toThrow();
  });
});

describe('clampInputs (lenient)', () => {
  it('clamps out-of-range numeric fields into valid ranges', () => {
    const clamped = clampInputs(
      {
        annualReturnRate: 500,
        withdrawalReturnRate: -10,
        durationYears: 200,
        sipStopYear: 300,
        inflation: { enabled: true, rate: 99 },
      },
      DEFAULT_INPUTS,
    );

    expect(clamped.annualReturnRate).toBe(100);
    expect(clamped.withdrawalReturnRate).toBe(0);
    expect(clamped.durationYears).toBe(100);
    expect(clamped.sipStopYear).toBe(100);
    expect(clamped.inflation.rate).toBe(20);
  });

  it('enforces the year-ordering invariant', () => {
    const clamped = clampInputs(
      { durationYears: 30, sipStopYear: 20, withdrawalStartYear: 5 },
      DEFAULT_INPUTS,
    );
    expect(clamped.sipStopYear).toBe(20);
    expect(clamped.withdrawalStartYear).toBe(20);
    expect(clamped.withdrawalStartYear).toBeGreaterThanOrEqual(clamped.sipStopYear);
  });

  it('falls back to INR for an unknown currency', () => {
    const clamped = clampInputs({ currency: 'GBP' }, DEFAULT_INPUTS);
    expect(clamped.currency).toBe('INR');
  });

  it('returns a schema-valid object even from empty/garbage input', () => {
    expect(() => validateInputs(clampInputs({}, DEFAULT_INPUTS))).not.toThrow();
    expect(() => validateInputs(clampInputs(null, DEFAULT_INPUTS))).not.toThrow();
    expect(() =>
      validateInputs(clampInputs({ lumpsum: 'oops', monthlySip: NaN }, DEFAULT_INPUTS)),
    ).not.toThrow();
  });

  it('coerces non-integer years to integers', () => {
    const clamped = clampInputs({ durationYears: 10.7, sipStopYear: 3.2 }, DEFAULT_INPUTS);
    expect(Number.isInteger(clamped.durationYears)).toBe(true);
    expect(Number.isInteger(clamped.sipStopYear)).toBe(true);
  });
});

describe('projectionInputsSchema', () => {
  it('safeParse succeeds on defaults', () => {
    expect(projectionInputsSchema.safeParse(DEFAULT_INPUTS).success).toBe(true);
  });
});


describe('mode handling', () => {
  it('accepts accumulation mode without enforcing withdrawal ordering', () => {
    const ok = {
      ...DEFAULT_INPUTS,
      mode: 'accumulation' as const,
      sipStopYear: 20,
      withdrawalStartYear: 5, // would be invalid in income mode, ignored here
    };
    expect(() => validateInputs(ok)).not.toThrow();
  });

  it('still enforces withdrawal ordering in income mode', () => {
    const bad = {
      ...DEFAULT_INPUTS,
      mode: 'income' as const,
      sipStopYear: 20,
      withdrawalStartYear: 5,
    };
    expect(() => validateInputs(bad)).toThrow();
  });

  it('clampInputs preserves the mode and defaults unknown modes to the base', () => {
    expect(clampInputs({ mode: 'accumulation' }, DEFAULT_INPUTS).mode).toBe('accumulation');
    expect(clampInputs({ mode: 'nonsense' }, DEFAULT_INPUTS).mode).toBe(DEFAULT_INPUTS.mode);
  });

  it('clampInputs does not force withdrawal ordering in accumulation mode', () => {
    const clamped = clampInputs(
      { mode: 'accumulation', durationYears: 30, sipStopYear: 20, withdrawalStartYear: 5 },
      DEFAULT_INPUTS,
    );
    expect(clamped.withdrawalStartYear).toBe(5);
    expect(() => validateInputs(clamped)).not.toThrow();
  });
});

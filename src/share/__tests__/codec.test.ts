import { describe, expect, it } from 'vitest';
import { compressToEncodedURIComponent } from 'lz-string';
import { decodeScenario, encodeScenario } from '../codec';
import { clampInputs } from '../../state/schema';
import { DEFAULT_INPUTS } from '../../state/defaults';
import type { ProjectionInputs } from '../../engine/types';

describe('codec round-trip', () => {
  it('encodes and decodes the default scenario losslessly (after clamping)', () => {
    const token = encodeScenario(DEFAULT_INPUTS);
    const decoded = decodeScenario(token);
    expect(decoded).not.toBeNull();
    expect(clampInputs(decoded, DEFAULT_INPUTS)).toEqual(DEFAULT_INPUTS);
  });

  it('round-trips a custom accumulation scenario with a fixed step-up', () => {
    const custom: ProjectionInputs = {
      ...DEFAULT_INPUTS,
      currency: 'USD',
      mode: 'accumulation',
      lumpsum: 1_234_567,
      monthlySip: 4_321,
      sipStepUp: { method: 'fixed', percentage: 0, amount: 1_500 },
      annualReturnRate: 9.5,
      durationYears: 42,
      sipStopYear: 42,
      withdrawalStartYear: 42,
      withdrawalReturnRate: 5,
      monthlySwp: 0,
      swpStepUp: { method: 'percentage', percentage: 3, amount: 0 },
      inflation: { enabled: false, rate: 4 },
    };
    const decoded = decodeScenario(encodeScenario(custom));
    expect(clampInputs(decoded, DEFAULT_INPUTS)).toEqual(custom);
  });

  it('produces a compact, URL-safe token (no spaces or reserved chars)', () => {
    const token = encodeScenario(DEFAULT_INPUTS);
    expect(token.length).toBeGreaterThan(0);
    expect(token).toMatch(/^[A-Za-z0-9+\-$_.!*'()]*$/);
    expect(token).not.toContain(' ');
  });

  it('keeps even a maximal scenario well within browser URL limits', () => {
    const maximal = {
      ...DEFAULT_INPUTS,
      currency: 'INR' as const,
      mode: 'income' as const,
      lumpsum: 999_999_999,
      monthlySip: 999_999,
      sipStepUp: { method: 'fixed' as const, percentage: 99.5, amount: 499_999 },
      annualReturnRate: 99.5,
      durationYears: 100,
      sipStopYear: 60,
      withdrawalStartYear: 70,
      withdrawalReturnRate: 88.5,
      monthlySwp: 1_999_999,
      swpStepUp: { method: 'percentage' as const, percentage: 19.5, amount: 99_999 },
      inflation: { enabled: true, rate: 19.5 },
    };
    const token = encodeScenario(maximal);
    // Token plus a generous base URL must stay far below the ~2000-char limit
    // that the most conservative browsers enforce.
    expect(token.length).toBeLessThan(600);
  });

  it('returns null for malformed or empty tokens', () => {
    expect(decodeScenario('')).toBeNull();
    expect(decodeScenario('not-a-valid-token!!!')).toBeNull();
    expect(decodeScenario('@@@@')).toBeNull();
  });

  it('rejects payloads with an unknown version', () => {
    // A well-formed lz-string payload whose version field is not supported.
    const futureToken = compressToEncodedURIComponent(JSON.stringify({ v: 999, c: 'INR' }));
    expect(decodeScenario(futureToken)).toBeNull();
    // A valid current-version token still decodes.
    expect(decodeScenario(encodeScenario(DEFAULT_INPUTS))).not.toBeNull();
  });
});

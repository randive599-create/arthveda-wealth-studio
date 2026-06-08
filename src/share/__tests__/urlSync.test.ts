import { describe, expect, it } from 'vitest';
import { buildShareUrl, readScenarioFromUrl, SCENARIO_PARAM } from '../urlSync';
import { clampInputs } from '../../state/schema';
import { DEFAULT_INPUTS } from '../../state/defaults';
import type { ProjectionInputs } from '../../engine/types';

const scenario: ProjectionInputs = {
  ...DEFAULT_INPUTS,
  currency: 'EUR',
  lumpsum: 750_000,
  monthlySip: 30_000,
  durationYears: 25,
  sipStopYear: 15,
  withdrawalStartYear: 18,
};

describe('buildShareUrl', () => {
  it('builds an absolute URL carrying the scenario token', () => {
    const url = buildShareUrl(scenario, 'https://arthvedawealth.in/studio');
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://arthvedawealth.in/studio');
    expect(parsed.searchParams.get(SCENARIO_PARAM)).toBeTruthy();
  });

  it('uses a stable fallback origin when no base and no window are available', () => {
    const url = buildShareUrl(scenario);
    expect(() => new URL(url)).not.toThrow();
    expect(new URL(url).searchParams.get(SCENARIO_PARAM)).toBeTruthy();
  });
});

describe('readScenarioFromUrl', () => {
  it('decodes a scenario from an explicit query string', () => {
    const url = buildShareUrl(scenario, 'https://arthvedawealth.in/studio');
    const search = new URL(url).search;
    const decoded = readScenarioFromUrl(search);
    expect(decoded).not.toBeNull();
    expect(clampInputs(decoded, DEFAULT_INPUTS)).toEqual(scenario);
  });

  it('returns null when there is no scenario parameter', () => {
    expect(readScenarioFromUrl('')).toBeNull();
    expect(readScenarioFromUrl('?foo=bar')).toBeNull();
  });

  it('returns null for a corrupt token', () => {
    expect(readScenarioFromUrl(`?${SCENARIO_PARAM}=%%%bad%%%`)).toBeNull();
  });
});

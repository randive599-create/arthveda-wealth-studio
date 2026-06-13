// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createStudioStore } from '../useStudioStore';
import { buildProjection } from '../../engine';
import {
  DEFAULT_INPUTS,
  FIRE_CALCULATOR_PRESET,
  LUMPSUM_CALCULATOR_PRESET,
  RETIREMENT_CALCULATOR_PRESET,
  SIP_CALCULATOR_PRESET,
  SWP_CALCULATOR_PRESET,
} from '../defaults';
import { clampInputs } from '../schema';
import type { ProjectionInputs } from '../../engine/types';

/**
 * A store that exercises the real initialization path (URL sync enabled, so
 * presetForCurrentPath runs), with synchronous recompute. URL sync only writes
 * on input changes — not at construction — so initializing it does not pollute
 * the address bar.
 */
function storeForRoute(path: string) {
  window.history.pushState({}, '', path);
  return createStudioStore({ debounceMs: 0, enableUrlSync: true });
}

const ROUTE_PRESETS: { path: string; preset: ProjectionInputs }[] = [
  { path: '/sip-calculator', preset: SIP_CALCULATOR_PRESET },
  { path: '/retirement-calculator', preset: RETIREMENT_CALCULATOR_PRESET },
  { path: '/swp-calculator', preset: SWP_CALCULATOR_PRESET },
  { path: '/lumpsum-calculator', preset: LUMPSUM_CALCULATOR_PRESET },
  { path: '/fire-calculator', preset: FIRE_CALCULATOR_PRESET },
];

afterEach(() => {
  window.history.pushState({}, '', '/');
});

describe('route-specific preset loading', () => {
  it.each(ROUTE_PRESETS)('loads the $path preset into the store on first load', ({ path, preset }) => {
    const store = storeForRoute(path);
    const { inputs, result, scenarioLoadedFromUrl } = store.getState();

    // The store opens with the route preset (clamping is a no-op for presets).
    expect(inputs).toEqual(clampInputs(preset, DEFAULT_INPUTS));
    // The projection engine receives the route-specific inputs.
    expect(result).toEqual(buildProjection(inputs));
    // It is a route preset, not a shared-URL scenario.
    expect(scenarioLoadedFromUrl).toBe(false);
  });

  it('opens the home studio (/) with the default scenario, not a preset', () => {
    const store = storeForRoute('/');
    expect(store.getState().inputs).toEqual(DEFAULT_INPUTS);
  });

  it('produces a distinct scenario for every calculator route', () => {
    const signatures = ROUTE_PRESETS.map(({ path }) => {
      const { inputs } = storeForRoute(path).getState();
      return JSON.stringify([
        inputs.mode,
        inputs.lumpsum,
        inputs.monthlySip,
        inputs.monthlySwp,
        inputs.durationYears,
        inputs.sipStopYear,
        inputs.withdrawalStartYear,
      ]);
    });
    expect(new Set(signatures).size).toBe(ROUTE_PRESETS.length);
  });

  it('reflects the expected per-calculator behavior', () => {
    const sip = storeForRoute('/sip-calculator').getState().inputs;
    expect(sip.mode).toBe('accumulation');
    expect(sip.lumpsum).toBe(0);
    expect(sip.monthlySip).toBeGreaterThan(0);

    const retirement = storeForRoute('/retirement-calculator').getState().inputs;
    expect(retirement.mode).toBe('income');
    expect(retirement.monthlySwp).toBeGreaterThan(0);
    expect(retirement.withdrawalStartYear).toBeLessThan(retirement.durationYears);

    const swp = storeForRoute('/swp-calculator').getState().inputs;
    expect(swp.mode).toBe('income');
    expect(swp.lumpsum).toBeGreaterThan(0);
    expect(swp.monthlySip).toBe(0);
    expect(swp.withdrawalStartYear).toBe(1);

    const lumpsum = storeForRoute('/lumpsum-calculator').getState().inputs;
    expect(lumpsum.mode).toBe('accumulation');
    expect(lumpsum.lumpsum).toBeGreaterThan(0);
    expect(lumpsum.monthlySip).toBe(0);

    const fire = storeForRoute('/fire-calculator').getState().inputs;
    expect(fire.mode).toBe('accumulation');
    expect(fire.monthlySip).toBeGreaterThanOrEqual(50_000);
  });
});

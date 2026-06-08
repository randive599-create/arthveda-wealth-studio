import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStudioStore } from '../useStudioStore';
import { buildProjection } from '../../engine';
import { DEFAULT_INPUTS } from '../defaults';

/** A synchronous, isolated store (no debounce, no URL/window interaction). */
function makeStore() {
  return createStudioStore({ debounceMs: 0, enableUrlSync: false });
}

describe('store initialization', () => {
  it('starts from PRD defaults with a matching projection', () => {
    const store = makeStore();
    const s = store.getState();
    expect(s.inputs).toEqual(DEFAULT_INPUTS);
    expect(s.result).toEqual(buildProjection(DEFAULT_INPUTS));
    expect(s.scenarioLoadedFromUrl).toBe(false);
  });
});

describe('input updates and recomputation', () => {
  it('updates inputs and recomputes the result synchronously (debounce 0)', () => {
    const store = makeStore();
    store.getState().setInput('lumpsum', 1_000_000);
    expect(store.getState().inputs.lumpsum).toBe(1_000_000);
    expect(store.getState().result.summary.totalInvestment).toBe(
      buildProjection({ ...DEFAULT_INPUTS, lumpsum: 1_000_000 }).summary.totalInvestment,
    );
  });

  it('clamps out-of-range values on the way in', () => {
    const store = makeStore();
    store.getState().setInput('annualReturnRate', 999);
    expect(store.getState().inputs.annualReturnRate).toBe(100);

    store.getState().setInput('durationYears', 500);
    expect(store.getState().inputs.durationYears).toBe(100);
  });

  it('keeps the year-ordering invariant in income mode', () => {
    const store = makeStore();
    store.getState().patchInputs({ mode: 'income', sipStopYear: 20, withdrawalStartYear: 5 });
    const { sipStopYear, withdrawalStartYear } = store.getState().inputs;
    expect(withdrawalStartYear).toBeGreaterThanOrEqual(sipStopYear);
  });

  it('manages currency, mode, step-up, and inflation through dedicated actions', () => {
    const store = makeStore();

    store.getState().setCurrency('USD');
    expect(store.getState().inputs.currency).toBe('USD');
    expect(store.getState().result.milestoneTitle).toBe('Milestone Countdown');

    store.getState().setMode('accumulation');
    expect(store.getState().inputs.mode).toBe('accumulation');

    store.getState().setSipStepUp({ method: 'fixed', amount: 2_000 });
    expect(store.getState().inputs.sipStepUp.method).toBe('fixed');
    expect(store.getState().inputs.sipStepUp.amount).toBe(2_000);

    store.getState().setInflationEnabled(false);
    expect(store.getState().inputs.inflation.enabled).toBe(false);
    expect(store.getState().result.summary.inflationAdjustedCorpus).toBeNull();

    store.getState().setInflationEnabled(true);
    store.getState().setInflationRate(8);
    expect(store.getState().inputs.inflation.rate).toBe(8);
    expect(store.getState().result.summary.inflationAdjustedCorpus).not.toBeNull();
  });
});

describe('scenario loading and reset', () => {
  it('loads an untrusted scenario, clamping invalid fields', () => {
    const store = makeStore();
    store.getState().loadScenario({
      currency: 'GBP', // invalid -> INR
      annualReturnRate: 250, // -> 100
      durationYears: 12,
      sipStopYear: 8,
      withdrawalStartYear: 10,
      mode: 'income',
    });
    const s = store.getState();
    expect(s.inputs.currency).toBe('INR');
    expect(s.inputs.annualReturnRate).toBe(100);
    expect(s.scenarioLoadedFromUrl).toBe(true);
    expect(s.result).toEqual(buildProjection(s.inputs));
  });

  it('resets back to the default scenario', () => {
    const store = makeStore();
    store.getState().setInput('lumpsum', 9_999_999);
    store.getState().reset();
    expect(store.getState().inputs).toEqual(DEFAULT_INPUTS);
    expect(store.getState().scenarioLoadedFromUrl).toBe(false);
  });
});

describe('shareable URL', () => {
  it('builds a URL that decodes back to the current inputs', () => {
    const store = makeStore();
    store.getState().setInput('lumpsum', 2_500_000);
    const url = store.getState().getShareableUrl('https://arthvedawealth.in/studio');
    expect(url).toContain('s=');
    expect(new URL(url).searchParams.get('s')).toBeTruthy();
  });
});

describe('debounced recomputation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('defers recompute until the debounce window elapses', () => {
    const store = createStudioStore({ debounceMs: 120, enableUrlSync: false });
    const before = store.getState().result.summary.totalInvestment;

    store.getState().setInput('lumpsum', store.getState().inputs.lumpsum + 5_000_000);
    // Inputs change immediately; result is still stale before the timer fires.
    expect(store.getState().result.summary.totalInvestment).toBe(before);

    vi.advanceTimersByTime(120);
    expect(store.getState().result.summary.totalInvestment).not.toBe(before);
  });

  it('flushRecompute applies pending changes immediately', () => {
    const store = createStudioStore({ debounceMs: 500, enableUrlSync: false });
    const before = store.getState().result.summary.totalInvestment;

    store.getState().setInput('lumpsum', store.getState().inputs.lumpsum + 5_000_000);
    expect(store.getState().result.summary.totalInvestment).toBe(before);

    store.getState().flushRecompute();
    expect(store.getState().result.summary.totalInvestment).not.toBe(before);
  });
});

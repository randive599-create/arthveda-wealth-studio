/**
 * The application store.
 *
 * Single source of truth: `inputs` (the only mutable domain state). Everything
 * else flows from it:
 *
 *   input change -> clamp -> (debounced) recompute -> result + URL sync
 *
 * `inputs` updates synchronously so controls feel live; the (cheap) projection
 * and the `history.replaceState` URL write are debounced so rapid slider drags
 * do not thrash. `result` always reflects the inputs after the debounce window
 * (or immediately when `debounceMs <= 0` / after `flushRecompute`).
 *
 * The store is framework-agnostic for testing: it can be driven entirely
 * through `getState()` / `setState()` / `subscribe()` without React.
 */

import { create } from 'zustand';
import { buildProjection } from '../engine';
import type {
  Currency,
  InflationConfig,
  ProjectionInputs,
  ProjectionMode,
  ProjectionResult,
  StepUpConfig,
} from '../engine/types';
import { buildShareUrl, readScenarioFromUrl, writeScenarioToUrl } from '../share/urlSync';
import {
  DEFAULT_INPUTS,
  FIRE_CALCULATOR_PRESET,
  LUMPSUM_CALCULATOR_PRESET,
  RETIREMENT_CALCULATOR_PRESET,
  SIP_CALCULATOR_PRESET,
  SWP_CALCULATOR_PRESET,
} from './defaults';
import { clampInputs } from './schema';

/** Tunable behaviour for a store instance. */
export interface StudioConfig {
  /** Debounce window (ms) for recompute + URL sync. `<= 0` recomputes synchronously. */
  debounceMs: number;
  /** Whether to read the URL on init and write it on change. */
  enableUrlSync: boolean;
}

export const DEFAULT_STUDIO_CONFIG: StudioConfig = {
  debounceMs: 120,
  enableUrlSync: true,
};

export interface StudioActions {
  /** Merge a partial patch into inputs, clamp, and schedule a recompute. */
  patchInputs: (patch: Partial<ProjectionInputs>) => void;
  /** Set a single top-level input field. */
  setInput: <K extends keyof ProjectionInputs>(key: K, value: ProjectionInputs[K]) => void;

  setCurrency: (currency: Currency) => void;
  setMode: (mode: ProjectionMode) => void;

  setSipStepUp: (patch: Partial<StepUpConfig>) => void;
  setSwpStepUp: (patch: Partial<StepUpConfig>) => void;

  setInflation: (patch: Partial<InflationConfig>) => void;
  setInflationEnabled: (enabled: boolean) => void;
  setInflationRate: (rate: number) => void;

  /** Replace the whole scenario from an untrusted source (e.g. a shared link). */
  loadScenario: (raw: unknown) => void;
  /** Reset to the PRD default scenario. */
  reset: () => void;

  /** Build a shareable URL for the current inputs (always current, ignores debounce). */
  getShareableUrl: (baseUrl?: string) => string;
  /** Force any pending debounced recompute to run immediately. */
  flushRecompute: () => void;
}

export interface StudioState extends StudioActions {
  /** The only mutable domain state. */
  inputs: ProjectionInputs;
  /** The canonical projection derived from `inputs`. */
  result: ProjectionResult;
  /** True when the initial inputs were hydrated from a shared URL. */
  scenarioLoadedFromUrl: boolean;
}

/**
 * Per-route default scenario. Each SEO calculator landing page opens with a
 * preset tuned to that page's topic instead of the studio default. This only
 * changes the *initial* inputs — the engine, formulas, and every action remain
 * identical. Returns `null` when there is no route-specific preset (e.g. the
 * home studio at `/`).
 */
const ROUTE_PRESETS: Record<string, ProjectionInputs> = {
  '/sip-calculator': SIP_CALCULATOR_PRESET,
  '/retirement-calculator': RETIREMENT_CALCULATOR_PRESET,
  '/swp-calculator': SWP_CALCULATOR_PRESET,
  '/lumpsum-calculator': LUMPSUM_CALCULATOR_PRESET,
  '/fire-calculator': FIRE_CALCULATOR_PRESET,
};

function presetForCurrentPath(): ProjectionInputs | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const path = window.location.pathname.replace(/\/+$/, '');
  return ROUTE_PRESETS[path] ?? null;
}

/** Resolve the initial inputs: a valid URL scenario if present, else defaults. */
function resolveInitialInputs(enableUrlSync: boolean): {
  inputs: ProjectionInputs;
  fromUrl: boolean;
} {
  if (enableUrlSync) {
    const raw = readScenarioFromUrl();
    if (raw !== null) {
      return { inputs: clampInputs(raw, DEFAULT_INPUTS), fromUrl: true };
    }
    // No shared scenario: honour a route-specific preset (e.g. SIP landing page).
    const preset = presetForCurrentPath();
    if (preset !== null) {
      return { inputs: clampInputs(preset, DEFAULT_INPUTS), fromUrl: false };
    }
  }
  return { inputs: DEFAULT_INPUTS, fromUrl: false };
}

/**
 * Create a Studio store instance. A configured singleton (`useStudioStore`) is
 * exported below for the application; tests can create isolated instances with
 * synchronous recompute and URL sync disabled.
 */
export function createStudioStore(config: Partial<StudioConfig> = {}) {
  const cfg: StudioConfig = { ...DEFAULT_STUDIO_CONFIG, ...config };
  let timer: ReturnType<typeof setTimeout> | null = null;

  return create<StudioState>((set, get) => {
    const recompute = (): void => {
      const { inputs } = get();
      set({ result: buildProjection(inputs) });
      if (cfg.enableUrlSync) {
        writeScenarioToUrl(inputs);
      }
    };

    const scheduleRecompute = (): void => {
      if (cfg.debounceMs <= 0) {
        recompute();
        return;
      }
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        recompute();
      }, cfg.debounceMs);
    };

    const applyInputs = (next: ProjectionInputs): void => {
      set({ inputs: next });
      scheduleRecompute();
    };

    const { inputs: initialInputs, fromUrl } = resolveInitialInputs(cfg.enableUrlSync);

    return {
      inputs: initialInputs,
      result: buildProjection(initialInputs),
      scenarioLoadedFromUrl: fromUrl,

      patchInputs(patch) {
        const merged = { ...get().inputs, ...patch };
        applyInputs(clampInputs(merged, DEFAULT_INPUTS));
      },

      setInput(key, value) {
        get().patchInputs({ [key]: value } as Partial<ProjectionInputs>);
      },

      setCurrency(currency) {
        get().patchInputs({ currency });
      },

      setMode(mode) {
        get().patchInputs({ mode });
      },

      setSipStepUp(patch) {
        get().patchInputs({ sipStepUp: { ...get().inputs.sipStepUp, ...patch } });
      },

      setSwpStepUp(patch) {
        get().patchInputs({ swpStepUp: { ...get().inputs.swpStepUp, ...patch } });
      },

      setInflation(patch) {
        get().patchInputs({ inflation: { ...get().inputs.inflation, ...patch } });
      },

      setInflationEnabled(enabled) {
        get().setInflation({ enabled });
      },

      setInflationRate(rate) {
        get().setInflation({ rate });
      },

      loadScenario(raw) {
        const next = clampInputs(raw, DEFAULT_INPUTS);
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
        set({ inputs: next, result: buildProjection(next), scenarioLoadedFromUrl: true });
        if (cfg.enableUrlSync) {
          writeScenarioToUrl(next);
        }
      },

      reset() {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
        set({
          inputs: DEFAULT_INPUTS,
          result: buildProjection(DEFAULT_INPUTS),
          scenarioLoadedFromUrl: false,
        });
        if (cfg.enableUrlSync) {
          writeScenarioToUrl(DEFAULT_INPUTS);
        }
      },

      getShareableUrl(baseUrl) {
        return buildShareUrl(get().inputs, baseUrl);
      },

      flushRecompute() {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
        recompute();
      },
    };
  });
}

/** The application's shared store instance. */
export const useStudioStore = createStudioStore();

/**
 * The default institutional scenario.
 *
 * Chosen to demonstrate all three phases (accumulation, growth, withdrawal),
 * inflation awareness, and a meaningful step-up, while remaining realistic for
 * a long-term private-wealth plan. This object is always valid against
 * `projectionInputsSchema` and serves as the clamping base for shared scenarios.
 */

import { DEFAULT_INFLATION_RATE } from '../engine/constants';
import type { ProjectionInputs } from '../engine/types';

export const DEFAULT_INPUTS: ProjectionInputs = {
  currency: 'INR',
  mode: 'income',

  lumpsum: 500_000,
  monthlySip: 25_000,
  sipStepUp: {
    method: 'percentage',
    percentage: 10,
    amount: 5_000,
  },

  annualReturnRate: 12,
  durationYears: 30,
  sipStopYear: 20,
  withdrawalStartYear: 25,

  withdrawalReturnRate: 8,
  monthlySwp: 100_000,
  swpStepUp: {
    method: 'percentage',
    percentage: 5,
    amount: 5_000,
  },

  inflation: {
    enabled: true,
    rate: DEFAULT_INFLATION_RATE,
  },
};

/**
 * Preset for the /sip-calculator SEO landing page.
 *
 * A SIP-friendly accumulation scenario (no withdrawal phase): no lumpsum, a
 * ₹10,000 monthly SIP, a 10% annual step-up, and a 20-year horizon. It reuses
 * the same engine and the same `ProjectionInputs` shape as the studio — only
 * the initial values differ. Always valid against `projectionInputsSchema`.
 */
export const SIP_CALCULATOR_PRESET: ProjectionInputs = {
  ...DEFAULT_INPUTS,
  currency: 'INR',
  mode: 'accumulation',
  lumpsum: 0,
  monthlySip: 10_000,
  sipStepUp: {
    method: 'percentage',
    percentage: 10,
    amount: 5_000,
  },
  annualReturnRate: 12,
  durationYears: 20,
  sipStopYear: 20,
  withdrawalStartYear: 20,
};

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


/**
 * Preset for the /retirement-calculator SEO landing page.
 *
 * A full accumulation + income retirement plan: a 30-year working-life SIP with
 * a 10% step-up, then a 10-year retirement-income (SWP) phase drawing an
 * inflation-linked monthly income. Reuses the same engine and the same
 * `ProjectionInputs` shape as the studio. Always valid against the schema.
 */
export const RETIREMENT_CALCULATOR_PRESET: ProjectionInputs = {
  ...DEFAULT_INPUTS,
  currency: 'INR',
  mode: 'income',
  lumpsum: 0,
  monthlySip: 30_000,
  sipStepUp: {
    method: 'percentage',
    percentage: 10,
    amount: 5_000,
  },
  annualReturnRate: 12,
  durationYears: 40,
  sipStopYear: 30,
  withdrawalStartYear: 30,
  withdrawalReturnRate: 8,
  monthlySwp: 150_000,
  swpStepUp: {
    method: 'percentage',
    percentage: 6,
    amount: 5_000,
  },
};

/**
 * Preset for the /swp-calculator SEO landing page.
 *
 * A pure Systematic Withdrawal Plan: a ₹1 crore starting corpus (lumpsum) with
 * no SIP, drawing a flat ₹50,000 monthly income from year one at an 8% post-
 * retirement return over a 25-year horizon. Withdrawals begin immediately
 * (sipStopYear = withdrawalStartYear = 1). Always valid against the schema.
 */
export const SWP_CALCULATOR_PRESET: ProjectionInputs = {
  ...DEFAULT_INPUTS,
  currency: 'INR',
  mode: 'income',
  lumpsum: 10_000_000,
  monthlySip: 0,
  sipStepUp: {
    method: 'percentage',
    percentage: 0,
    amount: 0,
  },
  annualReturnRate: 8,
  durationYears: 25,
  sipStopYear: 1,
  withdrawalStartYear: 1,
  withdrawalReturnRate: 8,
  monthlySwp: 50_000,
  swpStepUp: {
    method: 'percentage',
    percentage: 0,
    amount: 0,
  },
};

/**
 * Preset for the /lumpsum-calculator SEO landing page.
 *
 * A one-time investment that compounds for the full horizon: a ₹10 lakh lumpsum
 * with no SIP and no withdrawal phase, at 12% over 20 years. Always valid
 * against the schema.
 */
export const LUMPSUM_CALCULATOR_PRESET: ProjectionInputs = {
  ...DEFAULT_INPUTS,
  currency: 'INR',
  mode: 'accumulation',
  lumpsum: 1_000_000,
  monthlySip: 0,
  sipStepUp: {
    method: 'percentage',
    percentage: 0,
    amount: 0,
  },
  annualReturnRate: 12,
  durationYears: 20,
  sipStopYear: 20,
  withdrawalStartYear: 20,
};

/**
 * Preset for the /fire-calculator SEO landing page.
 *
 * An aggressive Financial-Independence accumulation plan: a ₹5 lakh head start
 * plus a ₹50,000 monthly SIP with a 10% annual step-up, at 12% over 20 years,
 * building toward a financial-independence corpus. Always valid against the
 * schema.
 */
export const FIRE_CALCULATOR_PRESET: ProjectionInputs = {
  ...DEFAULT_INPUTS,
  currency: 'INR',
  mode: 'accumulation',
  lumpsum: 500_000,
  monthlySip: 50_000,
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

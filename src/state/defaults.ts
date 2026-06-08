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

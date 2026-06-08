/**
 * Test helper: build a fully-valid `ProjectionInputs` from a minimal, neutral
 * base, overriding only the fields a test cares about.
 *
 * The base is deliberately inert (no money, 0% rates, single year) so that each
 * test isolates exactly one behaviour.
 */

import type {
  InflationConfig,
  ProjectionInputs,
  StepUpConfig,
} from '../types';

type Overrides = Partial<
  Omit<ProjectionInputs, 'sipStepUp' | 'swpStepUp' | 'inflation'>
> & {
  sipStepUp?: Partial<StepUpConfig>;
  swpStepUp?: Partial<StepUpConfig>;
  inflation?: Partial<InflationConfig>;
};

const BASE: ProjectionInputs = {
  currency: 'INR',
  mode: 'income',
  lumpsum: 0,
  monthlySip: 0,
  sipStepUp: { method: 'percentage', percentage: 0, amount: 0 },
  annualReturnRate: 0,
  durationYears: 1,
  sipStopYear: 1,
  withdrawalStartYear: 1,
  withdrawalReturnRate: 0,
  monthlySwp: 0,
  swpStepUp: { method: 'percentage', percentage: 0, amount: 0 },
  inflation: { enabled: false, rate: 0 },
};

export function makeInputs(overrides: Overrides = {}): ProjectionInputs {
  return {
    ...BASE,
    ...overrides,
    sipStepUp: { ...BASE.sipStepUp, ...overrides.sipStepUp },
    swpStepUp: { ...BASE.swpStepUp, ...overrides.swpStepUp },
    inflation: { ...BASE.inflation, ...overrides.inflation },
  };
}

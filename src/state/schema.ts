/**
 * Input validation and safe clamping.
 *
 * Two entry points are provided:
 *   - `validateInputs`  — strict parse; throws on invalid data. Use for tests
 *                         and anywhere a hard guarantee is required.
 *   - `clampInputs`     — lenient coercion; never throws. Out-of-range values
 *                         are clamped into valid ranges and cross-field rules
 *                         are enforced. Use when hydrating from untrusted
 *                         sources such as a shared URL.
 *
 * Cross-field rules:
 *   - 1 <= sipStopYear <= durationYears
 *   - In 'income' mode: sipStopYear <= withdrawalStartYear <= durationYears
 *     (withdrawal bounds are not enforced in 'accumulation' mode, where the
 *      withdrawal parameters are ignored by the engine).
 */

import { z } from 'zod';
import {
  DEFAULT_INFLATION_RATE,
  MAX_DURATION_YEARS,
  MAX_INFLATION_RATE,
  MAX_RETURN_RATE,
  MAX_STEPUP_AMOUNT_GUARD,
  MAX_STEPUP_PERCENT,
  MIN_DURATION_YEARS,
  MIN_INFLATION_RATE,
  MIN_MONEY,
  MIN_RETURN_RATE,
  MIN_STEPUP_AMOUNT,
  MIN_STEPUP_PERCENT,
  MIN_YEAR_INDEX,
  SUPPORTED_CURRENCIES,
} from '../engine/constants';
import type { Currency, ProjectionInputs, ProjectionMode, StepUpConfig } from '../engine/types';

const currencySchema = z.enum(['INR', 'USD', 'EUR']);
const modeSchema = z.enum(['accumulation', 'income']);

const stepUpSchema = z.object({
  method: z.enum(['percentage', 'fixed']),
  percentage: z.number().finite().min(MIN_STEPUP_PERCENT).max(MAX_STEPUP_PERCENT),
  amount: z.number().finite().min(MIN_STEPUP_AMOUNT),
});

const inflationSchema = z.object({
  enabled: z.boolean(),
  rate: z.number().finite().min(MIN_INFLATION_RATE).max(MAX_INFLATION_RATE),
});

const money = z.number().finite().min(MIN_MONEY);
const year = z.number().int().min(MIN_YEAR_INDEX).max(MAX_DURATION_YEARS);

/**
 * Strict schema. Validates types, ranges, and cross-field invariants.
 */
export const projectionInputsSchema = z
  .object({
    currency: currencySchema,
    mode: modeSchema,
    lumpsum: money,
    monthlySip: money,
    sipStepUp: stepUpSchema,
    annualReturnRate: z.number().finite().min(MIN_RETURN_RATE).max(MAX_RETURN_RATE),
    durationYears: z.number().int().min(MIN_DURATION_YEARS).max(MAX_DURATION_YEARS),
    sipStopYear: year,
    withdrawalStartYear: year,
    withdrawalReturnRate: z.number().finite().min(MIN_RETURN_RATE).max(MAX_RETURN_RATE),
    monthlySwp: money,
    swpStepUp: stepUpSchema,
    inflation: inflationSchema,
  })
  .superRefine((value, ctx) => {
    if (value.sipStopYear > value.durationYears) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sipStopYear'],
        message: 'sipStopYear must not exceed durationYears',
      });
    }
    // Withdrawal ordering only applies when an income phase is active.
    if (value.mode === 'income') {
      if (value.withdrawalStartYear < value.sipStopYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['withdrawalStartYear'],
          message: 'withdrawalStartYear must be greater than or equal to sipStopYear',
        });
      }
      if (value.withdrawalStartYear > value.durationYears) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['withdrawalStartYear'],
          message: 'withdrawalStartYear must not exceed durationYears',
        });
      }
    }
  });

/**
 * Strictly validate raw input, returning a typed `ProjectionInputs`. Throws a
 * `ZodError` if the data is invalid.
 */
export function validateInputs(raw: unknown): ProjectionInputs {
  return projectionInputsSchema.parse(raw) as ProjectionInputs;
}

/** Clamp a finite number into [min, max]; fall back to `fallback` if not finite. */
function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(Math.max(n, min), max);
}

/** Clamp to an integer within [min, max]. */
function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  return Math.round(clampNumber(value, min, max, fallback));
}

/** Coerce an unknown value into a valid currency, defaulting to INR. */
function clampCurrency(value: unknown): Currency {
  return SUPPORTED_CURRENCIES.includes(value as Currency) ? (value as Currency) : 'INR';
}

/** Coerce an unknown value into a valid projection mode. */
function clampMode(value: unknown, fallback: ProjectionMode): ProjectionMode {
  return value === 'accumulation' || value === 'income' ? value : fallback;
}

/** Coerce an unknown value into a valid step-up config. */
function clampStepUp(value: unknown, fallback: StepUpConfig): StepUpConfig {
  const v = (value ?? {}) as Partial<StepUpConfig>;
  const method = v.method === 'fixed' || v.method === 'percentage' ? v.method : fallback.method;
  return {
    method,
    percentage: clampNumber(
      v.percentage,
      MIN_STEPUP_PERCENT,
      MAX_STEPUP_PERCENT,
      fallback.percentage,
    ),
    amount: clampNumber(v.amount, MIN_STEPUP_AMOUNT, MAX_STEPUP_AMOUNT_GUARD, fallback.amount),
  };
}

/**
 * Leniently coerce arbitrary/untrusted data into a valid `ProjectionInputs`.
 * Never throws. Out-of-range values are clamped and the year ordering
 * invariant (sipStopYear <= withdrawalStartYear <= durationYears) is enforced.
 *
 * @param raw the untrusted partial input.
 * @param base a known-valid base used to fill missing fields (e.g. defaults).
 */
export function clampInputs(raw: unknown, base: ProjectionInputs): ProjectionInputs {
  const v = (raw ?? {}) as Partial<ProjectionInputs>;

  const durationYears = clampInt(
    v.durationYears,
    MIN_DURATION_YEARS,
    MAX_DURATION_YEARS,
    base.durationYears,
  );

  // sipStopYear is bounded by the horizon.
  const sipStopYear = clampInt(v.sipStopYear, MIN_YEAR_INDEX, durationYears, base.sipStopYear);

  const mode = clampMode(v.mode, base.mode);

  // In income mode, withdrawalStartYear must be in [sipStopYear, durationYears].
  // In accumulation mode it is ignored by the engine, so we only keep it within
  // the horizon for sane round-tripping.
  const withdrawalLowerBound = mode === 'income' ? sipStopYear : MIN_YEAR_INDEX;
  const withdrawalStartYear = clampInt(
    v.withdrawalStartYear,
    withdrawalLowerBound,
    durationYears,
    Math.min(Math.max(base.withdrawalStartYear, withdrawalLowerBound), durationYears),
  );

  return {
    currency: clampCurrency(v.currency),
    mode,
    lumpsum: clampNumber(v.lumpsum, MIN_MONEY, Number.MAX_SAFE_INTEGER, base.lumpsum),
    monthlySip: clampNumber(v.monthlySip, MIN_MONEY, Number.MAX_SAFE_INTEGER, base.monthlySip),
    sipStepUp: clampStepUp(v.sipStepUp, base.sipStepUp),
    annualReturnRate: clampNumber(
      v.annualReturnRate,
      MIN_RETURN_RATE,
      MAX_RETURN_RATE,
      base.annualReturnRate,
    ),
    durationYears,
    sipStopYear,
    withdrawalStartYear,
    withdrawalReturnRate: clampNumber(
      v.withdrawalReturnRate,
      MIN_RETURN_RATE,
      MAX_RETURN_RATE,
      base.withdrawalReturnRate,
    ),
    monthlySwp: clampNumber(v.monthlySwp, MIN_MONEY, Number.MAX_SAFE_INTEGER, base.monthlySwp),
    swpStepUp: clampStepUp(v.swpStepUp, base.swpStepUp),
    inflation: {
      enabled:
        typeof v.inflation?.enabled === 'boolean' ? v.inflation.enabled : base.inflation.enabled,
      rate: clampNumber(
        v.inflation?.rate,
        MIN_INFLATION_RATE,
        MAX_INFLATION_RATE,
        base.inflation?.rate ?? DEFAULT_INFLATION_RATE,
      ),
    },
  };
}

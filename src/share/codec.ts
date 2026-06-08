/**
 * Compact, URL-safe scenario codec.
 *
 * A scenario (the full `ProjectionInputs`) is mapped to a short-key object,
 * JSON-stringified, then compressed with lz-string's URL-component encoder.
 * Short keys plus compression keep shared links small enough for chat/email.
 *
 * Decoding is deliberately lenient: it returns an untrusted, partially-shaped
 * object (or `null` on any failure). Callers MUST pass the result through
 * `clampInputs` before use, so malformed or hostile payloads can never produce
 * an invalid projection.
 */

import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import type { ProjectionInputs, StepUpConfig, StepUpMethod } from '../engine/types';
import { SCENARIO_VERSION, migrateEncoded } from './version';

/** Encoded step-up: method ('p' | 'f'), percentage, amount. */
interface EncodedStepUp {
  m: 'p' | 'f';
  p: number;
  a: number;
}

/** The compact wire shape. Keys are intentionally terse. */
interface EncodedScenario {
  v: number;
  c: ProjectionInputs['currency'];
  md: ProjectionInputs['mode'];
  l: number;
  s: number;
  su: EncodedStepUp;
  r: number;
  d: number;
  ss: number;
  ws: number;
  wr: number;
  w: number;
  wu: EncodedStepUp;
  ie: boolean;
  ir: number;
}

function encodeMethod(method: StepUpMethod): 'p' | 'f' {
  return method === 'fixed' ? 'f' : 'p';
}

function decodeMethod(value: unknown): StepUpMethod {
  return value === 'f' ? 'fixed' : 'percentage';
}

function encodeStepUp(step: StepUpConfig): EncodedStepUp {
  return { m: encodeMethod(step.method), p: step.percentage, a: step.amount };
}

/** Decode a step-up into a partial shape; numbers are passed through as-is for clamping. */
function decodeStepUp(value: unknown): Partial<StepUpConfig> {
  const v = (value ?? {}) as Partial<EncodedStepUp>;
  return {
    method: decodeMethod(v.m),
    percentage: typeof v.p === 'number' ? v.p : Number.NaN,
    amount: typeof v.a === 'number' ? v.a : Number.NaN,
  };
}

/**
 * Encode a scenario into a compact, URL-safe token.
 */
export function encodeScenario(inputs: ProjectionInputs): string {
  const encoded: EncodedScenario = {
    v: SCENARIO_VERSION,
    c: inputs.currency,
    md: inputs.mode,
    l: inputs.lumpsum,
    s: inputs.monthlySip,
    su: encodeStepUp(inputs.sipStepUp),
    r: inputs.annualReturnRate,
    d: inputs.durationYears,
    ss: inputs.sipStopYear,
    ws: inputs.withdrawalStartYear,
    wr: inputs.withdrawalReturnRate,
    w: inputs.monthlySwp,
    wu: encodeStepUp(inputs.swpStepUp),
    ie: inputs.inflation.enabled,
    ir: inputs.inflation.rate,
  };
  return compressToEncodedURIComponent(JSON.stringify(encoded));
}

/**
 * Decode a token into an untrusted, partially-shaped inputs object. Returns
 * `null` on any failure (bad token, JSON error, unknown version). The result is
 * intended to be passed to `clampInputs` for sanitization.
 */
export function decodeScenario(token: string): Partial<ProjectionInputs> | null {
  if (!token) {
    return null;
  }

  let json: string | null;
  try {
    json = decompressFromEncodedURIComponent(token);
  } catch {
    return null;
  }
  if (!json) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  const migrated = migrateEncoded(parsed as { v?: unknown } & Record<string, unknown>);
  if (migrated === null) {
    return null;
  }

  const e = migrated as Partial<EncodedScenario>;
  return {
    currency: e.c,
    mode: e.md,
    lumpsum: typeof e.l === 'number' ? e.l : Number.NaN,
    monthlySip: typeof e.s === 'number' ? e.s : Number.NaN,
    sipStepUp: decodeStepUp(e.su) as StepUpConfig,
    annualReturnRate: typeof e.r === 'number' ? e.r : Number.NaN,
    durationYears: typeof e.d === 'number' ? e.d : Number.NaN,
    sipStopYear: typeof e.ss === 'number' ? e.ss : Number.NaN,
    withdrawalStartYear: typeof e.ws === 'number' ? e.ws : Number.NaN,
    withdrawalReturnRate: typeof e.wr === 'number' ? e.wr : Number.NaN,
    monthlySwp: typeof e.w === 'number' ? e.w : Number.NaN,
    swpStepUp: decodeStepUp(e.wu) as StepUpConfig,
    inflation: {
      enabled: typeof e.ie === 'boolean' ? e.ie : false,
      rate: typeof e.ir === 'number' ? e.ir : Number.NaN,
    },
  };
}

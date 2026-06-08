/**
 * URL <-> scenario synchronization.
 *
 * - `readScenarioFromUrl` decodes the `?s=` parameter into an untrusted inputs
 *   object (to be clamped by the caller), or returns `null`.
 * - `buildShareUrl` produces an absolute, shareable URL for a scenario.
 * - `writeScenarioToUrl` updates the address bar via `history.replaceState`
 *   (never `pushState`, so rapid edits do not pollute browser history).
 *
 * Every function is safe to call in non-browser environments (SSR, tests):
 * reads/writes that need `window` become no-ops or accept an explicit input.
 */

import type { ProjectionInputs } from '../engine/types';
import { decodeScenario, encodeScenario } from './codec';

/** Query-string key that carries the compressed scenario token. */
export const SCENARIO_PARAM = 's';

/** Fallback origin used when building a URL outside the browser. */
const FALLBACK_BASE = 'https://arthvedawealth.in/';

function hasBrowserHistory(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.history !== 'undefined' &&
    typeof window.location !== 'undefined'
  );
}

/**
 * Read and decode the scenario from a query string. Defaults to the current
 * browser URL when `search` is omitted. Returns `null` when there is no token
 * or it cannot be decoded.
 */
export function readScenarioFromUrl(search?: string): Partial<ProjectionInputs> | null {
  const query = search ?? (hasBrowserHistory() ? window.location.search : '');
  if (!query) {
    return null;
  }
  const token = new URLSearchParams(query).get(SCENARIO_PARAM);
  if (!token) {
    return null;
  }
  return decodeScenario(token);
}

/**
 * Build an absolute, shareable URL for the given scenario.
 *
 * @param inputs the scenario to encode.
 * @param baseUrl optional base (origin + path). Defaults to the current page in
 *   the browser, or a stable fallback origin elsewhere.
 */
export function buildShareUrl(inputs: ProjectionInputs, baseUrl?: string): string {
  const token = encodeScenario(inputs);
  const base =
    baseUrl ??
    (hasBrowserHistory()
      ? `${window.location.origin}${window.location.pathname}`
      : FALLBACK_BASE);
  const url = new URL(base);
  url.searchParams.set(SCENARIO_PARAM, token);
  return url.toString();
}

/**
 * Synchronize the current browser address bar to the given scenario using
 * `history.replaceState`. No-op outside the browser.
 */
export function writeScenarioToUrl(inputs: ProjectionInputs): void {
  if (!hasBrowserHistory()) {
    return;
  }
  const token = encodeScenario(inputs);
  const url = new URL(window.location.href);
  url.searchParams.set(SCENARIO_PARAM, token);
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Scenario serialization version.
 *
 * The encoded scenario payload embeds this version so that the format can
 * evolve without breaking previously-shared links. When the encoded shape
 * changes, bump `SCENARIO_VERSION` and extend `migrateEncoded` to upgrade
 * older payloads to the current shape.
 */

/** Current scenario payload version. */
export const SCENARIO_VERSION = 1 as const;

/**
 * Migrate a decoded payload of any known prior version to the current version's
 * shape. Returns `null` if the version is unknown/unsupported (the caller then
 * falls back to defaults).
 *
 * Only version 1 exists today, so this is an identity pass for v1 and a
 * rejection for everything else.
 */
export function migrateEncoded(
  payload: { v?: unknown } & Record<string, unknown>,
): Record<string, unknown> | null {
  if (payload.v === SCENARIO_VERSION) {
    return payload;
  }
  return null;
}

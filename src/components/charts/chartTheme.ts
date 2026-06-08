/**
 * Shared chart theming.
 *
 * Every chart color, font, and stroke originates here so the on-screen palette
 * matches the design tokens exactly and stays identical in the PDF export path
 * (hex only — no oklch). Recharts needs literal values rather than CSS custom
 * properties for SVG fills, so the token hexes are mirrored here as constants.
 */

export const CHART_COLORS = {
  ink: '#111827',
  inkSecondary: '#4b5563',
  accent: '#064e3b',
  accentHover: '#047857',
  returns: '#10b981',
  invested: '#9ca3af',
  hairline: '#e5e7eb',
  canvas: '#ffffff',
  mist: '#f9fafb',
} as const;

export const CHART_FONTS = {
  mono: "'IBM Plex Mono', ui-monospace, monospace",
  body: "'Work Sans', system-ui, sans-serif",
} as const;

/** Axis tick typography shared across charts. */
export const AXIS_TICK = {
  fill: CHART_COLORS.inkSecondary,
  fontSize: 11,
  fontFamily: CHART_FONTS.mono,
} as const;

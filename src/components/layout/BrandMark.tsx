/**
 * The official ArthVeda Wealth logo, used in the footer brand block.
 *
 * Renders the tightly-trimmed web asset (`arthveda-logo-web.png`) — the same one
 * the top navigation and homepage hero use — so the logo appears consistently
 * sized (artwork filling the box, not lost in transparent padding) everywhere on
 * the site. The asset is a lightweight transparent PNG, kept crisp on screen.
 *
 * `size` sets the rendered HEIGHT in px; the width follows the asset's true
 * aspect ratio (never square-forced, so there is no crop/stretch), and the
 * inline `aspect-ratio` reserves the box so there is no layout shift.
 */

import type { CSSProperties } from 'react';

const LOGO_SRC = '/brand/arthveda-logo-web.png';
// Intrinsic dimensions of the trimmed asset (246 x 256), used to preserve the
// exact aspect ratio and reserve layout space.
const LOGO_ASPECT = '246 / 256';

export interface BrandMarkProps {
  /** Rendered height in px. Width follows the logo's aspect ratio. */
  size?: number;
  className?: string;
  testId?: string;
}

export function BrandMark({ size, className, testId }: BrandMarkProps) {
  const style: CSSProperties = { objectFit: 'contain', aspectRatio: LOGO_ASPECT };
  if (size != null) {
    style.height = size;
    style.width = 'auto';
  }

  return (
    <img
      src={LOGO_SRC}
      alt="ArthVeda Wealth"
      className={className}
      data-testid={testId}
      decoding="async"
      style={style}
    />
  );
}

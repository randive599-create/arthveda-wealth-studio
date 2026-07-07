/**
 * The official ArthVeda Wealth logo (the stylized "A" with gold growth bars and
 * arc above the wordmark). Rendered as a lightweight, transparent PNG so it
 * stays crisp on screen while keeping the page weight tiny — the web derivative
 * is ~19 KB, downscaled from the 1024px master.
 *
 * Sizing has two modes:
 *   - `size` (px): a fixed square, applied via inline style (header, footer).
 *   - `className`: responsive height utilities such as
 *     `h-14 w-auto sm:h-16 lg:h-[72px]` (top navigation).
 *
 * Crucially it sets NO fixed width/height *attributes* — those would pin the
 * intrinsic box (e.g. 36px) and visually override the Tailwind height classes.
 * A square `aspect-ratio` keeps the box reserved so there is no layout shift in
 * either mode, and the aspect ratio is preserved exactly (no crop/stretch).
 */

import type { CSSProperties } from 'react';

const LOGO_SRC = '/brand/arthveda-logo-192.png';

export interface BrandMarkProps {
  /** Fixed square size in px. Omit when sizing via responsive `className`. */
  size?: number;
  className?: string;
  testId?: string;
}

export function BrandMark({ size, className, testId }: BrandMarkProps) {
  const style: CSSProperties = { objectFit: 'contain', aspectRatio: '1 / 1' };
  if (size != null) {
    style.width = size;
    style.height = size;
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

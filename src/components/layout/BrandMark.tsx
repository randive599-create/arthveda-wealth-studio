/**
 * The official ArthVeda Wealth logo (the stylized "A" with gold growth bars and
 * arc above the wordmark). Rendered as a lightweight, transparent PNG so it
 * stays crisp on screen while keeping the page weight tiny — the web derivative
 * is ~19 KB, downscaled from the 1024px master. Square footprint (size × size)
 * so it drops into every existing layout slot the old monogram occupied.
 */

const LOGO_SRC = '/brand/arthveda-logo-192.png';

export interface BrandMarkProps {
  size?: number;
  className?: string;
  testId?: string;
}

export function BrandMark({ size = 36, className, testId }: BrandMarkProps) {
  return (
    <img
      src={LOGO_SRC}
      width={size}
      height={size}
      alt="ArthVeda Wealth"
      className={className}
      data-testid={testId}
      decoding="async"
      style={{ objectFit: 'contain' }}
    />
  );
}

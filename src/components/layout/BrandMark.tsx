/**
 * The ArthVeda monogram: an emerald square enclosing a serif "A" with an
 * emerald cross-bar accent. Rendered inline as SVG so it scales crisply and
 * needs no network request. Decorative — labelled via the wordmark beside it.
 */

export interface BrandMarkProps {
  size?: number;
  className?: string;
  testId?: string;
}

export function BrandMark({ size = 36, className, testId }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="ArthVeda"
      data-testid={testId}
    >
      <rect width="32" height="32" rx="6" fill="#064E3B" />
      <path d="M16 6 L25 26 H20.5 L16 15 L11.5 26 H7 Z" fill="#FFFFFF" />
      <rect x="13.4" y="19.2" width="5.2" height="2.2" fill="#10B981" />
    </svg>
  );
}

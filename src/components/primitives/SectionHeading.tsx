/**
 * Section heading rendered in the serif display face (Cormorant Garamond),
 * with an optional supporting line in the body face. Used to title each studio
 * section with a calm, editorial hierarchy.
 */

import type { ReactNode } from 'react';

export interface SectionHeadingProps {
  title: ReactNode;
  /** Optional eyebrow label set in small uppercase mono above the title. */
  eyebrow?: ReactNode;
  /** Optional supporting description below the title. */
  description?: ReactNode;
  className?: string;
}

export function SectionHeading({ title, eyebrow, description, className }: SectionHeadingProps) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading text-2xl font-bold leading-tight text-ink sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-secondary">{description}</p>
      ) : null}
    </div>
  );
}

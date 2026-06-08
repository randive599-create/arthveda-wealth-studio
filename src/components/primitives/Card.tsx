/**
 * Institutional card primitive.
 *
 * Crisp hairline border, restrained 8px radius, no shadow, no gradient, no
 * glassmorphism — the visual contract for the entire studio. An optional
 * `accent` variant draws the emerald emphasis used by the hero metric.
 */

import type { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'accent';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const BASE =
  'rounded-[var(--radius-card)] bg-canvas border transition-colors duration-150';

const VARIANT: Record<CardVariant, string> = {
  default: 'border-hairline',
  accent: 'border-accent border-2',
};

export function Card({ variant = 'default', className, children, ...rest }: CardProps) {
  return (
    <div className={`${BASE} ${VARIANT[variant]} ${className ?? ''}`} {...rest}>
      {children}
    </div>
  );
}

/**
 * Instagram follow control, shared across the footer, homepage community
 * section, and the About / Contact pages.
 *
 * Three variants keep the visual language consistent while adapting to context:
 *   - 'solid'   — emerald filled button (primary CTA, matches Download Report)
 *   - 'outline' — hairline button that fills emerald on hover
 *   - 'icon'    — compact square icon-only link (used in the footer brand block)
 *
 * All variants open the profile in a new tab with safe `rel`, carry an explicit
 * accessible label, and use only the existing design tokens.
 */

import { Instagram } from 'lucide-react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../../lib/social';
import { TESTIDS } from '../../lib/testids';

type InstagramVariant = 'solid' | 'outline' | 'icon';

export interface InstagramButtonProps {
  variant?: InstagramVariant;
  /** Visible label for the labelled variants. Defaults to "Follow @arthvedawealth". */
  label?: string;
  className?: string;
  testId?: string;
}

const LABELLED_BASE =
  'group inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] ' +
  'px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

const VARIANT_CLASS: Record<Exclude<InstagramVariant, 'icon'>, string> = {
  solid: 'border border-accent bg-accent text-white hover:bg-accent-hover',
  outline: 'border border-hairline bg-canvas text-ink hover:border-accent hover:text-accent',
};

export function InstagramButton({
  variant = 'solid',
  label = `Follow ${INSTAGRAM_HANDLE}`,
  className,
  testId = TESTIDS.instagramLink,
}: InstagramButtonProps) {
  if (variant === 'icon') {
    return (
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Follow ${INSTAGRAM_HANDLE} on Instagram (opens in a new tab)`}
        data-testid={testId}
        className={`
          inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)]
          border border-hairline bg-canvas text-ink-secondary transition-colors duration-150
          hover:border-accent hover:text-accent
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
          ${className ?? ''}
        `}
      >
        <Instagram size={18} strokeWidth={1.75} aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} on Instagram (opens in a new tab)`}
      data-testid={testId}
      className={`${LABELLED_BASE} ${VARIANT_CLASS[variant]} ${className ?? ''}`}
    >
      <Instagram size={16} strokeWidth={2} aria-hidden="true" />
      {label}
    </a>
  );
}

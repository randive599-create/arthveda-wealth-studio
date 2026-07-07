/**
 * Studio header and ArthVeda branding section.
 *
 * Composed as a centered brand hero — closer to a private-bank landing page
 * than a dashboard chrome bar. Three deliberately distinct tiers establish the
 * hierarchy:
 *
 *   1. ARTHVEDA            — oversized serif wordmark, the dominant element.
 *   2. WEALTH STUDIO       — wide-tracked mono divider, flanked by hairlines.
 *
 * Generous vertical breathing space frames the lockup; the tagline and trust
 * line sit beneath, centered and measured for calm readability.
 */

import { Shield } from 'lucide-react';
import { TESTIDS } from '../../lib/testids';

const TAGLINE =
  'Visualize every stage of your financial journey — accumulation, growth, preservation, and income — in one institutional-grade projection studio.';

export function StudioHeader() {
  return (
    <header className="border-b border-hairline bg-canvas" data-testid={TESTIDS.header}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-20">
        {/* Primary brand element — the trimmed web logo (transparent border
            removed so the artwork fills the box), sized larger than the navbar
            logo: 72 / 84 / 96px. Inline aspect-ratio matches the asset (246x256)
            so there is no distortion and no layout shift. The padded master PNG
            and all other branding assets are unchanged. */}
        <img
          src="/brand/arthveda-logo-web.png"
          alt="ArthVeda Wealth"
          data-testid={TESTIDS.brandMark}
          className="h-[72px] w-auto sm:h-[84px] lg:h-24"
          style={{ aspectRatio: '246 / 256', objectFit: 'contain' }}
          decoding="async"
        />

        <h1
          className="mt-7 font-heading text-5xl font-bold leading-[0.95] tracking-[-0.01em] text-ink sm:text-6xl lg:text-7xl"
          data-testid={TESTIDS.brandWordmark}
        >
          ArthVeda
        </h1>

        <div className="mt-5 flex items-center gap-3 sm:gap-4">
          <span className="h-px w-8 bg-hairline sm:w-16" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent sm:text-sm sm:tracking-[0.42em]">
            Wealth Studio
          </span>
          <span className="h-px w-8 bg-hairline sm:w-16" aria-hidden="true" />
        </div>

        <p
          className="mt-8 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base"
          data-testid={TESTIDS.brandTagline}
        >
          {TAGLINE}
        </p>

        <p
          className="mt-6 inline-flex items-center gap-2 border-t border-hairline pt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary"
          data-testid={TESTIDS.trustMessage}
        >
          <Shield size={13} strokeWidth={1.75} aria-hidden="true" />
          Illustrative projections for long-term planning · Not investment advice
        </p>
      </div>
    </header>
  );
}

/**
 * Application shell and responsive grid.
 *
 * Layout (desktop, lg+): a 12-column grid — a sticky 4/12 Parameters column on
 * the left and an 8/12 Projection Studio column on the right. On lg+ the
 * Parameters column is independently scrollable (its own overflow within the
 * viewport height) so users can reach every input without scrolling the page
 * and pushing the charts/results out of view. Below lg the grid collapses to a
 * single column — parameters first, then the studio — with normal page
 * scrolling and extra bottom padding so the mobile fixed summary bar never
 * overlaps content.
 *
 * This phase wires the structure and the dashboard. Parameter inputs and charts
 * are deliberately not yet present; their containers are established here so the
 * later phases drop into a stable layout.
 */

import type { ReactNode } from 'react';
import { TESTIDS } from '../../lib/testids';
import { CalculatorNav } from './CalculatorNav';
import { StudioHeader } from './StudioHeader';
import { StickySummaryBar } from './StickySummaryBar';
import { TrustFooter } from './TrustFooter';

export interface AppShellProps {
  /**
   * Left column content (parameters). Required for the default 'studio'
   * variant; ignored by the 'full' variant.
   */
  parameters?: ReactNode;
  /** Right column content (dashboard, and later charts/table). */
  studio: ReactNode;
  /**
   * Whether to render the ArthVeda brand hero (StudioHeader) above the grid.
   *
   * Defaults to `true` for the home Wealth Studio (`/`). The
   * dedicated calculator landing pages pass `false`: their own page H1 + intro
   * must lead the page so the calculator-specific content sits above the fold,
   * and so the page exposes a single, calculator-specific <h1> for SEO rather
   * than the generic "ArthVeda" wordmark heading.
   */
  showHero?: boolean;
  /**
   * Layout variant.
   *
   *   - 'studio' (default): the 4/12 sticky Parameters column + 8/12 studio
   *     column, with the store-backed sticky summary bar. Used by the generic
   *     Wealth Studio and the SEO landing pages.
   *   - 'full': a single full-width content column with no parameters aside and
   *     no store-backed summary bar. Used by self-contained pages (the
   *     dedicated FIRE calculator) that own their entire layout and do not read
   *     the shared studio store.
   */
  variant?: 'studio' | 'full';
}

export function AppShell({
  parameters,
  studio,
  showHero = true,
  variant = 'studio',
}: AppShellProps) {
  if (variant === 'full') {
    return (
      <div className="min-h-screen bg-canvas text-ink" data-testid={TESTIDS.appShell}>
        <CalculatorNav />

        {showHero && <StudioHeader />}

        <div
          className={
            'mx-auto w-full max-w-[1400px] px-5 pb-28 sm:px-8 lg:pb-12' +
            (showHero ? '' : ' pt-8 sm:pt-10')
          }
        >
          {studio}
        </div>

        <TrustFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink" data-testid={TESTIDS.appShell}>
      <CalculatorNav />

      {showHero && <StudioHeader />}

      <div
        className={
          'mx-auto w-full max-w-[1400px] px-5 pb-28 sm:px-8 lg:pb-12' +
          // Without the hero the grid would be flush against the viewport top,
          // so add top padding to give the page H1 breathing room.
          (showHero ? '' : ' pt-8 sm:pt-10')
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <aside
            className="lg:col-span-4"
            aria-label="Projection parameters"
            data-testid={TESTIDS.parametersColumn}
          >
            {/*
              On lg+, the sticky wrapper becomes its own scroll container sized
              to the viewport (top gap 1.5rem + bottom gap 1.5rem = 3rem), so
              the Plan Inputs panel scrolls independently while the right column
              stays put. overflow-x is hidden to guarantee no horizontal
              scrollbar. The currency control is a native <select>, whose
              dropdown renders in the browser top layer and is therefore never
              clipped by this overflow. Below lg none of this applies — the
              panel stacks and the page scrolls normally.
            */}
            <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh_-_3rem)] lg:overflow-y-auto lg:overflow-x-hidden">
              {parameters}
            </div>
          </aside>

          <main
            className="space-y-8 lg:col-span-8"
            aria-label="Projection studio"
            data-testid={TESTIDS.studioColumn}
          >
            <StickySummaryBar />
            {studio}
          </main>
        </div>
      </div>

      <TrustFooter />
    </div>
  );
}

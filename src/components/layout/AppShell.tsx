/**
 * Application shell and responsive grid.
 *
 * Layout (desktop, lg+): a 12-column grid — a sticky 4/12 Parameters column on
 * the left and an 8/12 Projection Studio column on the right. Below lg the grid
 * collapses to a single column: parameters first, then the studio, with extra
 * bottom padding so the mobile fixed summary bar never overlaps content.
 *
 * This phase wires the structure and the dashboard. Parameter inputs and charts
 * are deliberately not yet present; their containers are established here so the
 * later phases drop into a stable layout.
 */

import type { ReactNode } from 'react';
import { TESTIDS } from '../../lib/testids';
import { StudioHeader } from './StudioHeader';
import { StickySummaryBar } from './StickySummaryBar';
import { TrustFooter } from './TrustFooter';

export interface AppShellProps {
  /** Left column content (parameters). */
  parameters: ReactNode;
  /** Right column content (dashboard, and later charts/table). */
  studio: ReactNode;
}

export function AppShell({ parameters, studio }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink" data-testid={TESTIDS.appShell}>
      <StudioHeader />

      <div className="mx-auto w-full max-w-[1400px] px-5 pb-28 sm:px-8 lg:pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <aside
            className="lg:col-span-4"
            aria-label="Projection parameters"
            data-testid={TESTIDS.parametersColumn}
          >
            <div className="lg:sticky lg:top-6">{parameters}</div>
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

/**
 * Application composition root.
 *
 * Wires the studio shell: header + branding, the responsive two-column grid,
 * the sticky summary bar, the dashboard, the visualizations, the wealth journey
 * and milestone sections, the AI insights, and the year-by-year projection
 * ledger. The charts are lazily loaded to keep the initial bundle lean.
 */

import { lazy, Suspense } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DashboardGrid } from './components/dashboard/DashboardGrid';
import { ParametersPanel } from './components/parameters/ParametersPanel';
import { ChartSkeleton } from './components/charts/ChartSkeleton';
import { WealthJourneyTimeline } from './components/timeline/WealthJourneyTimeline';
import { MilestoneCountdown } from './components/milestones/MilestoneCountdown';
import { AIWealthInsights } from './components/insights/AIWealthInsights';
import { ProjectionTable } from './components/table/ProjectionTable';
import { DownloadReportButton } from './components/report/DownloadReportButton';
import { ShareScenarioButton } from './components/report/ShareScenarioButton';

// Route-split the SIP landing page so the home studio bundle does not carry its
// SEO content; it loads as its own chunk only on /sip-calculator.
const SipCalculatorPage = lazy(() =>
  import('./pages/sip/SipCalculatorPage').then((m) => ({ default: m.SipCalculatorPage })),
);

// Recharts is a large dependency; load the charts lazily so it is split into
// its own chunk and does not block the initial paint of the studio shell.
const WealthMountain = lazy(() =>
  import('./components/charts/WealthMountain').then((m) => ({ default: m.WealthMountain })),
);
const WealthDonut = lazy(() =>
  import('./components/charts/WealthDonut').then((m) => ({ default: m.WealthDonut })),
);

// The FAQ is below the fold and not needed for first paint; code-split it into
// its own chunk. It still injects its FAQPage JSON-LD on mount, so SEO markup
// is preserved.
const FaqSection = lazy(() =>
  import('./components/faq/FaqSection').then((m) => ({ default: m.FaqSection })),
);

/** The default Wealth Projection Studio (home page). */
function StudioPage() {
  return (
    <AppShell
      parameters={<ParametersPanel />}
      studio={
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              Projection Studio
            </p>
            <div className="flex items-center gap-3">
              <ShareScenarioButton />
              <DownloadReportButton />
            </div>
          </div>
          <DashboardGrid />
          <Suspense fallback={<ChartSkeleton title="Wealth Mountain" eyebrow="Primary Visualization" />}>
            <WealthMountain />
          </Suspense>
          <Suspense fallback={<ChartSkeleton title="Wealth Composition" eyebrow="Secondary Visualization" />}>
            <WealthDonut />
          </Suspense>
          <WealthJourneyTimeline />
          <MilestoneCountdown />
          <AIWealthInsights />
          <ProjectionTable />
          <Suspense fallback={null}>
            <FaqSection />
          </Suspense>
        </>
      }
    />
  );
}

/** Normalize a pathname by stripping a trailing slash (except root). */
function currentPath(): string {
  if (typeof window === 'undefined') {
    return '/';
  }
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

export default function App() {
  if (currentPath() === '/sip-calculator') {
    return (
      <Suspense fallback={null}>
        <SipCalculatorPage />
      </Suspense>
    );
  }
  return <StudioPage />;
}

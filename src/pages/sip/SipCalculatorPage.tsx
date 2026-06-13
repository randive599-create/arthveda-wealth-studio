/**
 * /sip-calculator — SEO landing page.
 *
 * Reuses the existing ArthVeda calculator (the same store, engine, parameters
 * panel, dashboard, charts, timeline, milestones, insights, and ledger) with a
 * SIP-friendly preset, then adds long-form SEO content, an engine-computed
 * example table, internal links, and a 10-item FAQ with FAQPage JSON-LD.
 *
 * No calculator logic is reimplemented or modified here.
 */

import { lazy, Suspense } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DashboardGrid } from '../../components/dashboard/DashboardGrid';
import { ParametersPanel } from '../../components/parameters/ParametersPanel';
import { ChartSkeleton } from '../../components/charts/ChartSkeleton';
import { WealthJourneyTimeline } from '../../components/timeline/WealthJourneyTimeline';
import { MilestoneCountdown } from '../../components/milestones/MilestoneCountdown';
import { AIWealthInsights } from '../../components/insights/AIWealthInsights';
import { ProjectionTable } from '../../components/table/ProjectionTable';
import { DownloadReportButton } from '../../components/report/DownloadReportButton';
import { ShareScenarioButton } from '../../components/report/ShareScenarioButton';
import { TESTIDS } from '../../lib/testids';
import { SipSeoContent } from './SipSeoContent';
import { useSipSeoHead } from './useSipSeoHead';

// Recharts is large; load the charts lazily so they are split out of the
// initial bundle, exactly as on the home studio.
const WealthMountain = lazy(() =>
  import('../../components/charts/WealthMountain').then((m) => ({ default: m.WealthMountain })),
);
const WealthDonut = lazy(() =>
  import('../../components/charts/WealthDonut').then((m) => ({ default: m.WealthDonut })),
);

export function SipCalculatorPage() {
  useSipSeoHead();

  return (
    <AppShell
      showHero={false}
      parameters={<ParametersPanel />}
      studio={
        <div className="space-y-8" data-testid={TESTIDS.sipCalculatorPage}>
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              SIP Calculator
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              SIP Calculator India — Calculate SIP Returns &amp; Future Wealth
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              Estimate the future value of your Systematic Investment Plan, model step-up SIP
              growth, and see your inflation-adjusted wealth — powered by the ArthVeda projection
              engine. Adjust the inputs to see your projection update instantly.
            </p>
          </header>

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

          <SipSeoContent />
        </div>
      }
    />
  );
}

/**
 * Application composition root.
 *
 * Wires the studio shell: header + branding, the responsive two-column grid,
 * the sticky summary bar, the dashboard, the visualizations, the wealth journey
 * and milestone sections, the AI insights, and the year-by-year projection
 * ledger. The charts are lazily loaded to keep the initial bundle lean.
 */

import { lazy, Suspense, type LazyExoticComponent } from 'react';
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
import { ExploreCalculators } from './components/navigation/ExploreCalculators';
import { CommunitySection } from './components/social/CommunitySection';
import { getCurrentPath } from './lib/path';

// Route-split each calculator landing page so the home studio bundle does not
// carry their SEO content; each loads as its own chunk only on its route.
const SipCalculatorPage = lazy(() =>
  import('./pages/sip/SipCalculatorPage').then((m) => ({ default: m.SipCalculatorPage })),
);
const RetirementCalculatorPage = lazy(() =>
  import('./pages/retirement/RetirementCalculatorPage').then((m) => ({
    default: m.RetirementCalculatorPage,
  })),
);
const SwpCalculatorPage = lazy(() =>
  import('./pages/swp/SwpCalculatorPage').then((m) => ({ default: m.SwpCalculatorPage })),
);
const LumpsumCalculatorPage = lazy(() =>
  import('./pages/lumpsum/LumpsumCalculatorPage').then((m) => ({
    default: m.LumpsumCalculatorPage,
  })),
);
const FireCalculatorPage = lazy(() =>
  import('./pages/fire/FireCalculatorPage').then((m) => ({ default: m.FireCalculatorPage })),
);
const SipVsStepUpCalculatorPage = lazy(() =>
  import('./pages/sip-vs-stepup/SipVsStepUpCalculatorPage').then((m) => ({
    default: m.SipVsStepUpCalculatorPage,
  })),
);
const AboutPage = lazy(() =>
  import('./pages/about/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const ContactPage = lazy(() =>
  import('./pages/contact/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const PrivacyPage = lazy(() =>
  import('./pages/privacy/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import('./pages/terms/TermsPage').then((m) => ({ default: m.TermsPage })),
);
const DisclaimerPage = lazy(() =>
  import('./pages/disclaimer/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage })),
);
const CookiePage = lazy(() =>
  import('./pages/cookies/CookiePage').then((m) => ({ default: m.CookiePage })),
);
const EditorialPage = lazy(() =>
  import('./pages/editorial/EditorialPage').then((m) => ({ default: m.EditorialPage })),
);
const MethodologyPage = lazy(() =>
  import('./pages/methodology/MethodologyPage').then((m) => ({ default: m.MethodologyPage })),
);
const TrustPage = lazy(() =>
  import('./pages/trust/TrustPage').then((m) => ({ default: m.TrustPage })),
);
const RiskPage = lazy(() =>
  import('./pages/risk/RiskPage').then((m) => ({ default: m.RiskPage })),
);
// Learn section: the homepage and the dynamic article route are each their own
// lazily-loaded chunk, so the Learn code never touches the calculator bundles.
const LearnHomePage = lazy(() =>
  import('./pages/learn/LearnHomePage').then((m) => ({ default: m.LearnHomePage })),
);
const LearnArticlePage = lazy(() =>
  import('./pages/learn/LearnArticlePage').then((m) => ({ default: m.LearnArticlePage })),
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

/** The default Wealth Studio home page. */
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
          <ExploreCalculators currentPath="/" />
          <CommunitySection />
        </>
      }
    />
  );
}

/** Map of pathname -> route-split landing page component. */
const ROUTES: Record<string, LazyExoticComponent<() => JSX.Element>> = {
  '/sip-calculator': SipCalculatorPage,
  '/retirement-calculator': RetirementCalculatorPage,
  '/swp-calculator': SwpCalculatorPage,
  '/lumpsum-calculator': LumpsumCalculatorPage,
  '/fire-calculator': FireCalculatorPage,
  '/sip-vs-stepup-sip-calculator': SipVsStepUpCalculatorPage,
  '/about-us': AboutPage,
  '/contact-us': ContactPage,
  '/privacy-policy': PrivacyPage,
  '/terms-and-conditions': TermsPage,
  '/disclaimer': DisclaimerPage,
  '/cookie-policy': CookiePage,
  '/editorial-policy': EditorialPage,
  '/calculator-methodology': MethodologyPage,
  '/why-trust-our-calculators': TrustPage,
  '/risk-disclosure': RiskPage,
  '/learn': LearnHomePage,
};

export default function App() {
  const path = getCurrentPath();

  const RoutePage = ROUTES[path];
  if (RoutePage) {
    return (
      <Suspense fallback={null}>
        <RoutePage />
      </Suspense>
    );
  }

  // Dynamic Learn article routes: /learn/<slug>. The article page resolves the
  // slug from the current path itself.
  if (path.startsWith('/learn/')) {
    return (
      <Suspense fallback={null}>
        <LearnArticlePage />
      </Suspense>
    );
  }

  return <StudioPage />;
}

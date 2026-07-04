/**
 * /risk-disclosure — the ArthVeda Risk Disclosure page.
 *
 * A content (non-calculator) page that reuses the shared AppShell (full-width
 * variant, no hero) and the standard SEO head: title, description, canonical,
 * Open Graph/Twitter, and Breadcrumb JSON-LD schema.
 * A prerendered static version is emitted at build time via the same
 * architecture as the other legal and informational pages.
 *
 * No calculator engine, formula, chart, PDF or existing route is changed.
 */

import { AppShell } from '../../components/layout/AppShell';
import { RiskContent } from './RiskContent';
import {
  RISK_INTRO,
  RISK_META,
  buildRiskBreadcrumbJsonLd,
} from './riskContent';
import { useSeoHead } from '../shared/useSeoHead';

export function RiskPage() {
  useSeoHead({
    meta: RISK_META,
    extraJsonLd: [
      { key: 'risk-breadcrumb', build: buildRiskBreadcrumbJsonLd },
    ],
  });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid="risk-disclosure-page">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              Risk
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Risk Disclosure
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              {RISK_INTRO}
            </p>
          </header>

          <RiskContent />
        </div>
      }
    />
  );
}

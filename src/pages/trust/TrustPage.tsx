/**
 * /why-trust-our-calculators — the ArthVeda "Why You Can Trust Our Calculators"
 * page.
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
import { TrustContent } from './TrustContent';
import {
  TRUST_INTRO,
  TRUST_META,
  buildTrustBreadcrumbJsonLd,
} from './trustContent';
import { useSeoHead } from '../shared/useSeoHead';

export function TrustPage() {
  useSeoHead({
    meta: TRUST_META,
    extraJsonLd: [
      { key: 'trust-breadcrumb', build: buildTrustBreadcrumbJsonLd },
    ],
  });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid="why-trust-our-calculators-page">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              Trust &amp; Transparency
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Why You Can Trust Our Calculators
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              {TRUST_INTRO}
            </p>
          </header>

          <TrustContent />
        </div>
      }
    />
  );
}

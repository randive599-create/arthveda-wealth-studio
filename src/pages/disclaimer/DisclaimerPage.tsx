/**
 * /disclaimer — the ArthVeda Disclaimer page.
 *
 * A content (non-calculator) page that reuses the shared AppShell (full-width
 * variant, no hero) and the standard SEO head: title, description, canonical,
 * Open Graph/Twitter, and WebPage + Breadcrumb JSON-LD schemas.
 * A prerendered static version is emitted at build time via the same
 * architecture as the calculator, about, contact, privacy, and terms pages.
 *
 * No calculator engine, formula, chart, PDF or existing route is changed.
 */

import { AppShell } from '../../components/layout/AppShell';
import { DisclaimerContent } from './DisclaimerContent';
import {
  DISCLAIMER_INTRO,
  DISCLAIMER_META,
  buildDisclaimerBreadcrumbJsonLd,
  buildDisclaimerWebPageJsonLd,
} from './disclaimerContent';
import { useSeoHead } from '../shared/useSeoHead';

export function DisclaimerPage() {
  useSeoHead({
    meta: DISCLAIMER_META,
    extraJsonLd: [
      { key: 'disclaimer-webpage', build: buildDisclaimerWebPageJsonLd },
      { key: 'disclaimer-breadcrumb', build: buildDisclaimerBreadcrumbJsonLd },
    ],
  });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid="disclaimer-page">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              Legal
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Disclaimer
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              {DISCLAIMER_INTRO}
            </p>
          </header>

          <DisclaimerContent />
        </div>
      }
    />
  );
}

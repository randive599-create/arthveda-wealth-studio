/**
 * /about-us — the ArthVeda About page.
 *
 * A content (non-calculator) page that reuses the shared AppShell (full-width
 * variant, no hero) and the standard SEO head: title, description, canonical,
 * Open Graph/Twitter, and an Organization JSON-LD. A prerendered static version
 * is emitted at build time via the same architecture as the calculator pages.
 *
 * No calculator engine, formula, chart, PDF or existing route is changed.
 */

import { AppShell } from '../../components/layout/AppShell';
import { TESTIDS } from '../../lib/testids';
import { AboutContent } from './AboutContent';
import { ABOUT_INTRO, ABOUT_META, buildAboutOrganizationJsonLd } from './aboutContent';
import { useSeoHead } from '../shared/useSeoHead';

export function AboutPage() {
  useSeoHead({
    meta: ABOUT_META,
    extraJsonLd: [{ key: 'about-organization', build: buildAboutOrganizationJsonLd }],
  });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid={TESTIDS.aboutPage}>
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              About
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              About ArthVeda
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              {ABOUT_INTRO}
            </p>
          </header>

          <AboutContent />
        </div>
      }
    />
  );
}

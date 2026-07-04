/**
 * /calculator-methodology — the ArthVeda Calculator Methodology page.
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
import { MethodologyContent } from './MethodologyContent';
import {
  METHODOLOGY_INTRO,
  METHODOLOGY_META,
  buildMethodologyBreadcrumbJsonLd,
} from './methodologyContent';
import { useSeoHead } from '../shared/useSeoHead';

export function MethodologyPage() {
  useSeoHead({
    meta: METHODOLOGY_META,
    extraJsonLd: [
      { key: 'methodology-breadcrumb', build: buildMethodologyBreadcrumbJsonLd },
    ],
  });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid="calculator-methodology-page">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              Methodology
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Calculator Methodology
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              {METHODOLOGY_INTRO}
            </p>
          </header>

          <MethodologyContent />
        </div>
      }
    />
  );
}

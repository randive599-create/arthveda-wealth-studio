/**
 * /editorial-policy — the ArthVeda Editorial Policy page.
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
import { EditorialContent } from './EditorialContent';
import {
  EDITORIAL_INTRO,
  EDITORIAL_META,
  buildEditorialBreadcrumbJsonLd,
} from './editorialContent';
import { useSeoHead } from '../shared/useSeoHead';

export function EditorialPage() {
  useSeoHead({
    meta: EDITORIAL_META,
    extraJsonLd: [
      { key: 'editorial-breadcrumb', build: buildEditorialBreadcrumbJsonLd },
    ],
  });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid="editorial-policy-page">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              Editorial
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Editorial Policy
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              {EDITORIAL_INTRO}
            </p>
          </header>

          <EditorialContent />
        </div>
      }
    />
  );
}

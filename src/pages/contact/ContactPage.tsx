/**
 * /contact-us — the ArthVeda Contact page.
 *
 * A content (non-calculator) page that reuses the shared AppShell (full-width
 * variant, no hero) and the standard SEO head: title, description, canonical,
 * Open Graph/Twitter, and ContactPage + Breadcrumb + FAQPage JSON-LD schemas.
 * A prerendered static version is emitted at build time via the same
 * architecture as the calculator and about pages.
 *
 * No calculator engine, formula, chart, PDF or existing route is changed.
 */

import { AppShell } from '../../components/layout/AppShell';
import { ContactContent } from './ContactContent';
import {
  CONTACT_INTRO,
  CONTACT_META,
  buildContactBreadcrumbJsonLd,
  buildContactFaqJsonLd,
  buildContactPageJsonLd,
} from './contactContent';
import { useSeoHead } from '../shared/useSeoHead';

export function ContactPage() {
  useSeoHead({
    meta: CONTACT_META,
    faqKey: 'contact-faq',
    buildFaqJsonLd: buildContactFaqJsonLd,
    extraJsonLd: [
      { key: 'contact-page', build: buildContactPageJsonLd },
      { key: 'contact-breadcrumb', build: buildContactBreadcrumbJsonLd },
    ],
  });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid="contact-page">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              Contact
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Contact ArthVeda
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              {CONTACT_INTRO}
            </p>
          </header>

          <ContactContent />
        </div>
      }
    />
  );
}

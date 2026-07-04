/**
 * Terms & Conditions — long-form, server-renderable content (used by both the
 * client page and the prerendered static HTML): terms sections, contact
 * information, and internal links. Built from existing Card / SectionHeading
 * primitives — no new visual language.
 */

import { ArrowUpRight, FileText, Mail } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import {
  TERMS_SECTIONS,
  TERMS_EMAIL,
  TERMS_LAST_UPDATED,
  TERMS_INTERNAL_LINKS,
} from './termsContent';

export function TermsContent() {
  return (
    <div className="space-y-8">
      {/* Last Updated */}
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
        Last Updated: {TERMS_LAST_UPDATED}
      </p>

      {/* Sections 1–9 */}
      {TERMS_SECTIONS.map((section) => (
        <Card key={section.number} className="p-6">
          <SectionHeading
            eyebrow={`Section ${section.number}`}
            title={section.title}
          />
          <div className="mt-4 flex items-start gap-3">
            <FileText
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-accent"
            />
            <p className="text-sm leading-relaxed text-ink-secondary">{section.body}</p>
          </div>
        </Card>
      ))}

      {/* 10 — Contact */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Section 10"
          title="Contact"
          description="If you have any questions about these Terms & Conditions, please contact us."
        />
        <div className="mt-4 flex items-center gap-2">
          <Mail size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-accent" />
          <a
            href={`mailto:${TERMS_EMAIL}`}
            className="font-mono text-sm font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline"
          >
            {TERMS_EMAIL}
          </a>
        </div>
      </Card>

      {/* Internal Links */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Explore"
          title="Explore ArthVeda"
          description="Learn more about us or try our financial planning calculators."
        />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TERMS_INTERNAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="
                group flex flex-col rounded-[var(--radius-control)] border border-hairline p-4
                transition-colors hover:border-accent
              "
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-heading text-lg font-bold leading-snug text-ink group-hover:text-accent">
                  {link.label}
                </span>
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-secondary transition-colors group-hover:text-accent"
                />
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-secondary">
                {link.description}
              </span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

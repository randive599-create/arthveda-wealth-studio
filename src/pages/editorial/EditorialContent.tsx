/**
 * Editorial Policy — long-form, server-renderable content (used by both the
 * client page and the prerendered static HTML): editorial policy sections and
 * internal links. Built from existing Card / SectionHeading primitives — no new
 * visual language.
 */

import { ArrowUpRight, FileText } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import {
  EDITORIAL_SECTIONS,
  EDITORIAL_LAST_UPDATED,
  EDITORIAL_INTERNAL_LINKS,
} from './editorialContent';

export function EditorialContent() {
  return (
    <div className="space-y-8">
      {/* Last Updated */}
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
        Last Updated: {EDITORIAL_LAST_UPDATED}
      </p>

      {/* Sections 1–8 */}
      {EDITORIAL_SECTIONS.map((section) => (
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

      {/* Internal Links */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Explore"
          title="Explore ArthVeda"
          description="Learn more about us or review our other policies."
        />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EDITORIAL_INTERNAL_LINKS.map((link) => (
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

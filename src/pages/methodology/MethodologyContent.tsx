/**
 * Calculator Methodology — long-form, server-renderable content (used by both
 * the client page and the prerendered static HTML): methodology sections (each
 * with an explanatory body and optional bullet points) and internal links.
 * Built from existing Card / SectionHeading primitives — no new visual language.
 */

import { ArrowUpRight, Check, FileText } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import {
  METHODOLOGY_SECTIONS,
  METHODOLOGY_LAST_UPDATED,
  METHODOLOGY_INTERNAL_LINKS,
} from './methodologyContent';

export function MethodologyContent() {
  return (
    <div className="space-y-8">
      {/* Last Updated */}
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
        Last Updated: {METHODOLOGY_LAST_UPDATED}
      </p>

      {/* Sections 1–9 */}
      {METHODOLOGY_SECTIONS.map((section) => (
        <Card key={section.number} className="p-6">
          <SectionHeading eyebrow={`Section ${section.number}`} title={section.title} />
          <div className="mt-4 flex items-start gap-3">
            <FileText
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-accent"
            />
            <p className="text-sm leading-relaxed text-ink-secondary">{section.body}</p>
          </div>
          {section.points ? (
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {section.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <Check
                    size={14}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-accent"
                  />
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      ))}

      {/* Internal Links */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Explore"
          title="Explore ArthVeda"
          description="Try our calculators or review our policies."
        />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METHODOLOGY_INTERNAL_LINKS.map((link) => (
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

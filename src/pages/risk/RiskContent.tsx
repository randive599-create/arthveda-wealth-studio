/**
 * Risk Disclosure — long-form, server-renderable content (used by both the
 * client page and the prerendered static HTML): risk sections (each with an
 * explanatory body and optional bullet points) and internal links. Built from
 * existing Card / SectionHeading primitives — no new visual language.
 */

import { ArrowUpRight, AlertTriangle, Check } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import {
  RISK_SECTIONS,
  RISK_LAST_UPDATED,
  RISK_INTERNAL_LINKS,
} from './riskContent';

export function RiskContent() {
  return (
    <div className="space-y-8">
      {/* Last Updated */}
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
        Last Updated: {RISK_LAST_UPDATED}
      </p>

      {/* Sections 1–7 */}
      {RISK_SECTIONS.map((section) => (
        <Card key={section.number} className="p-6">
          <SectionHeading eyebrow={`Section ${section.number}`} title={section.title} />
          <div className="mt-4 flex items-start gap-3">
            <AlertTriangle
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
          description="Review our policies and learn how our calculators work."
        />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RISK_INTERNAL_LINKS.map((link) => (
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

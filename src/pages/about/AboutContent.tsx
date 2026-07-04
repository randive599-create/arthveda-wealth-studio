/**
 * About ArthVeda — long-form, server-renderable content (used by both the client
 * page and the prerendered static HTML): mission, what we offer (linked cards),
 * philosophy, an important non-advisory note, and contact information. Built
 * from existing Card / SectionHeading primitives — no new visual language.
 */

import { ArrowUpRight, Mail, Globe, XCircle } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { InstagramButton } from '../../components/social/InstagramButton';
import { SOCIAL_DISPLAY_NAME } from '../../lib/social';
import { TESTIDS } from '../../lib/testids';
import {
  ABOUT_DISCLAIMERS,
  ABOUT_EMAIL,
  ABOUT_FOUNDER,
  ABOUT_OFFERINGS,
  ABOUT_WEBSITE,
} from './aboutContent';

const PHILOSOPHY: { title: string; body: string }[] = [
  {
    title: 'Long-term wealth creation',
    body: 'We focus on multi-decade compounding rather than short-term market timing or speculation.',
  },
  {
    title: 'Retirement readiness',
    body: 'Plan the corpus you need and the income it must sustain, adjusted for inflation.',
  },
  {
    title: 'Disciplined investing',
    body: 'Consistent, automated investing — with step-ups as income grows — beats sporadic effort.',
  },
  {
    title: 'Financial independence',
    body: 'Tools to map your path to financial independence and the freedom it brings.',
  },
];

export function AboutContent() {
  return (
    <div className="space-y-8">
      {/* 1 — Wealth Planning Made Simple */}
      <Card className="p-6">
        <SectionHeading eyebrow="Who we are" title="Wealth Planning Made Simple" />
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary sm:text-base">
          ArthVeda is a modern wealth projection platform designed to help individuals visualize
          their financial future through advanced planning calculators and projection tools.
        </p>
      </Card>

      {/* 2 — Our Mission */}
      <Card className="p-6">
        <SectionHeading eyebrow="Why we exist" title="Our Mission" />
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary sm:text-base">
          To help investors make informed long-term financial decisions through projections,
          planning tools, and educational content.
        </p>
      </Card>

      {/* 3 — Meet the Founder */}
      <Card className="p-6" data-testid={TESTIDS.aboutFounder}>
        <SectionHeading eyebrow="Founder" title="Meet the Founder" />
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Monogram avatar (decorative — the name is provided in text alongside it). */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-accent text-canvas"
            aria-hidden="true"
          >
            <span className="font-heading text-2xl font-bold tracking-tight">
              {ABOUT_FOUNDER.initials}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="font-heading text-xl font-bold leading-snug text-ink">
              {ABOUT_FOUNDER.name}
            </h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              {ABOUT_FOUNDER.role}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-ink-secondary sm:text-base">
              {ABOUT_FOUNDER.name} brings years of experience from the manufacturing industry, where
              disciplined processes and long-term thinking guide every decision. Away from his
              profession, he has a strong personal interest in investing, financial planning, and
              long-term wealth creation.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary sm:text-base">
              He built ArthVeda Wealth Studio to help Indian investors make better financial
              decisions through transparent, easy-to-use calculators.
            </p>

            {/* Mission statement — why ArthVeda Wealth Studio was created (founder's voice). */}
            <blockquote className="mt-5 border-l-2 border-accent bg-mist px-5 py-4">
              <p className="font-heading text-base italic leading-relaxed text-ink sm:text-lg">
                &ldquo;I created ArthVeda Wealth Studio to give everyday investors the clear, honest
                planning tools I was looking for myself &mdash; free from jargon, sales pressure, and
                hidden assumptions.&rdquo;
              </p>
              <footer className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
                &mdash; {ABOUT_FOUNDER.name}, Founder
              </footer>
            </blockquote>

            {/* Transparency note — humble, no fabricated credentials. */}
            <p className="mt-4 text-xs leading-relaxed text-ink-secondary">
              Suyog is passionate about financial planning and building practical tools for
              investors. He is an independent creator &mdash; not a financial advisor &mdash; and
              ArthVeda does not provide investment advice.
            </p>
          </div>
        </div>
      </Card>

      {/* 4 — What We Offer */}
      <Card className="p-6" data-testid={TESTIDS.aboutOffer}>
        <SectionHeading
          eyebrow="What we offer"
          title="A complete suite of planning tools"
          description="Every ArthVeda calculator, powered by the same projection engine."
        />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ABOUT_OFFERINGS.map((offering) => (
            <a
              key={offering.href}
              href={offering.href}
              data-testid={TESTIDS.aboutOfferLink(offering.href)}
              className="
                group flex flex-col rounded-[var(--radius-control)] border border-hairline p-4
                transition-colors hover:border-accent
              "
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-heading text-lg font-bold leading-snug text-ink group-hover:text-accent">
                  {offering.label}
                </span>
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-secondary transition-colors group-hover:text-accent"
                />
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-secondary">
                {offering.description}
              </span>
            </a>
          ))}
        </div>
      </Card>

      {/* 5 — Our Philosophy */}
      <Card className="p-6">
        <SectionHeading eyebrow="How we think" title="Our Philosophy" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PHILOSOPHY.map((item) => (
            <div key={item.title} className="rounded-[var(--radius-control)] border border-hairline p-4">
              <h3 className="font-heading text-lg font-bold leading-snug text-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 6 — Important Note */}
      <Card className="border-risk-strong p-6" data-testid={TESTIDS.aboutDisclaimer}>
        <SectionHeading eyebrow="Please note" title="Important Note" />
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
          ArthVeda is an educational and financial planning platform. It does <strong className="text-ink">not</strong>{' '}
          provide:
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ABOUT_DISCLAIMERS.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-ink-secondary">
              <XCircle size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-risk-strong" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* 7 — Contact Information */}
      <Card className="p-6" data-testid={TESTIDS.aboutContact}>
        <SectionHeading eyebrow="Get in touch" title="Contact Information" />
        <div className="mt-4 space-y-3">
          <p className="flex items-center gap-2 text-sm text-ink-secondary">
            <Mail size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-accent" />
            <a
              href={`mailto:${ABOUT_EMAIL}`}
              className="font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline"
            >
              {ABOUT_EMAIL}
            </a>
          </p>
          <p className="flex items-center gap-2 text-sm text-ink-secondary">
            <Globe size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-accent" />
            <a
              href={ABOUT_WEBSITE}
              className="font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline"
            >
              {ABOUT_WEBSITE}
            </a>
          </p>
        </div>
      </Card>

      {/* 8 — Connect With ArthVeda */}
      <Card className="p-6" data-testid={TESTIDS.aboutConnect}>
        <SectionHeading eyebrow="Social" title="Connect With ArthVeda" />
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          Stay connected with {SOCIAL_DISPLAY_NAME} for regular investing insights, financial
          education, calculator updates, and wealth-building ideas.
        </p>
        <div className="mt-5">
          <InstagramButton
            variant="solid"
            label={`Follow ${SOCIAL_DISPLAY_NAME}`}
            testId={TESTIDS.aboutConnectInstagram}
          />
        </div>
      </Card>
    </div>
  );
}

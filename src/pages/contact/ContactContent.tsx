/**
 * Contact ArthVeda — long-form, server-renderable content (used by both the
 * client page and the prerendered static HTML): email contact, purposes, why
 * contact us, FAQ accordion, and internal links. Built from existing Card /
 * SectionHeading primitives — no new visual language.
 */

import { ArrowUpRight, Mail, MessageSquare, Lightbulb, Plus, Instagram } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { InstagramButton } from '../../components/social/InstagramButton';
import { INSTAGRAM_HANDLE, SOCIAL_DISPLAY_NAME } from '../../lib/social';
import { TESTIDS } from '../../lib/testids';
import {
  CONTACT_EMAIL,
  CONTACT_FAQ,
  CONTACT_INTERNAL_LINKS,
  CONTACT_PURPOSES,
  CONTACT_REASONS,
} from './contactContent';

export function ContactContent() {
  return (
    <div className="space-y-8">
      {/* 1 — Ways to Contact */}
      <Card className="p-6">
        <SectionHeading eyebrow="Get in touch" title="Ways to Contact" />
        <div className="mt-4 space-y-4">
          <div className="rounded-[var(--radius-control)] border border-hairline p-4">
            <div className="flex items-center gap-2">
              <Mail size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-accent" />
              <span className="font-heading text-lg font-bold leading-snug text-ink">Email</span>
            </div>
            <p className="mt-2">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-mono text-sm font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
              What you can write to us about
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CONTACT_PURPOSES.map((purpose) => (
                <li key={purpose} className="flex items-center gap-2 text-sm text-ink-secondary">
                  <MessageSquare
                    size={14}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="shrink-0 text-accent"
                  />
                  {purpose}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* 2 — Connect With Us (premium cards) */}
      <Card className="p-6" data-testid={TESTIDS.contactConnect}>
        <SectionHeading
          eyebrow="Social"
          title="Connect With Us"
          description="Reach us directly by email or follow along on Instagram."
        />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Instagram card */}
          <div className="flex h-full flex-col rounded-[var(--radius-control)] border border-hairline p-5 transition-colors hover:border-accent">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-gold-wash text-gold">
                <Instagram size={18} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="font-heading text-lg font-bold leading-snug text-ink">Instagram</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Follow {SOCIAL_DISPLAY_NAME} ({INSTAGRAM_HANDLE}) for investing insights and
              calculator tips.
            </p>
            <div className="mt-4">
              <InstagramButton
                variant="outline"
                label={`Follow ${INSTAGRAM_HANDLE}`}
                testId={TESTIDS.contactConnectInstagram}
              />
            </div>
          </div>

          {/* Email card */}
          <div className="flex h-full flex-col rounded-[var(--radius-control)] border border-hairline p-5 transition-colors hover:border-accent">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-accent-wash text-accent">
                <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="font-heading text-lg font-bold leading-snug text-ink">Email</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              For enquiries, feedback, bug reports and partnerships.
            </p>
            <div className="mt-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-mono text-sm font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </Card>

      {/* 3 — Why Contact Us? */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="How we can help"
          title="Why Contact Us?"
          description="There are many ways we can work together to improve your financial planning experience."
        />
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CONTACT_REASONS.map((reason) => (
            <div
              key={reason}
              className="flex items-start gap-2.5 rounded-[var(--radius-control)] border border-hairline p-4"
            >
              <Lightbulb
                size={16}
                strokeWidth={1.75}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-accent"
              />
              <span className="text-sm leading-relaxed text-ink-secondary">{reason}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 — Frequently Asked Questions */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Knowledge"
          title="Frequently Asked Questions"
          description="Common questions about contacting ArthVeda, feature requests, and collaborations."
        />
        <div className="mt-6 divide-y divide-hairline">
          {CONTACT_FAQ.map((entry, index) => (
            <details key={entry.question} className="group py-1" data-testid={`contact-faq-item-${index}`}>
              <summary
                className="
                  flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-left
                  outline-none focus-visible:ring-2 focus-visible:ring-accent
                "
              >
                <span className="font-heading text-lg font-bold leading-snug text-ink">
                  {entry.question}
                </span>
                <Plus
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="shrink-0 text-ink-secondary transition-transform duration-200 group-open:rotate-45"
                />
              </summary>
              <p className="pb-4 pr-8 text-sm leading-relaxed text-ink-secondary">{entry.answer}</p>
            </details>
          ))}
        </div>
      </Card>

      {/* 4 — Explore Our Tools (internal links) */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Explore"
          title="Explore Our Tools"
          description="Jump to any of the ArthVeda calculators or learn more about us."
        />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTACT_INTERNAL_LINKS.map((link) => (
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

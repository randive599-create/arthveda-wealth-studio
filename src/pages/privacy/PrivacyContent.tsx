/**
 * Privacy Policy — long-form, server-renderable content (used by both the
 * client page and the prerendered static HTML): policy sections, contact
 * information, and internal links. Built from existing Card / SectionHeading
 * primitives — no new visual language.
 */

import { ArrowUpRight, Shield, Cookie, Server, Lock, Users, UserCheck, Mail } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import {
  INFORMATION_COLLECTED,
  INFORMATION_USES,
  COOKIE_PURPOSES,
  THIRD_PARTY_SERVICES,
  USER_RIGHTS,
  PRIVACY_EMAIL,
  PRIVACY_LAST_UPDATED,
  PRIVACY_INTERNAL_LINKS,
} from './privacyContent';

export function PrivacyContent() {
  return (
    <div className="space-y-8">
      {/* Last Updated */}
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
        Last Updated: {PRIVACY_LAST_UPDATED}
      </p>

      {/* 1 — Information We Collect */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Section 1"
          title="Information We Collect"
          description="We may collect information that you voluntarily provide while using our platform."
        />
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-relaxed text-ink-secondary">
            When you interact with ArthVeda, you may voluntarily provide the following information:
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {INFORMATION_COLLECTED.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-ink-secondary">
                <Shield
                  size={14}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="shrink-0 text-accent"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
            We do <strong className="text-ink">not</strong> collect financial account information,
            bank details, investment portfolio data, or any sensitive financial credentials.
          </p>
        </div>
      </Card>

      {/* 2 — How We Use Information */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Section 2"
          title="How We Use Information"
          description="Information collected is used solely to improve your experience and our services."
        />
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {INFORMATION_USES.map((use) => (
            <li key={use} className="flex items-center gap-2 text-sm text-ink-secondary">
              <Users
                size={14}
                strokeWidth={1.75}
                aria-hidden="true"
                className="shrink-0 text-accent"
              />
              {use}
            </li>
          ))}
        </ul>
      </Card>

      {/* 3 — Cookies */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Section 3"
          title="Cookies"
          description="Our website may use cookies and similar technologies for the following purposes."
        />
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {COOKIE_PURPOSES.map((purpose) => (
            <li key={purpose} className="flex items-center gap-2 text-sm text-ink-secondary">
              <Cookie
                size={14}
                strokeWidth={1.75}
                aria-hidden="true"
                className="shrink-0 text-accent"
              />
              {purpose}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
          You can control cookie preferences through your browser settings. Disabling cookies may
          affect certain features of the website.
        </p>
      </Card>

      {/* 4 — Third-Party Services */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Section 4"
          title="Third-Party Services"
          description="We use the following third-party services to operate and improve our platform."
        />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {THIRD_PARTY_SERVICES.map((service) => (
            <div
              key={service.name}
              className="flex items-start gap-2.5 rounded-[var(--radius-control)] border border-hairline p-4"
            >
              <Server
                size={16}
                strokeWidth={1.75}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-accent"
              />
              <div>
                <span className="font-heading text-base font-bold leading-snug text-ink">
                  {service.name}
                </span>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-secondary">
                  {service.purpose}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
          Each third-party service operates under its own privacy policy. We encourage you to
          review their respective policies for details on how they handle data.
        </p>
      </Card>

      {/* 5 — Data Security */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Section 5"
          title="Data Security"
          description="We take reasonable measures to protect any information you provide."
        />
        <div className="mt-4 flex items-start gap-3">
          <Lock
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-accent"
          />
          <p className="text-sm leading-relaxed text-ink-secondary">
            We implement reasonable technical and organisational security measures to protect
            information from unauthorised access, alteration, disclosure, or destruction. However,
            no method of electronic transmission or storage is 100% secure, and we cannot guarantee
            absolute security. All calculations run entirely in your browser — your calculator
            inputs are never transmitted to or stored on our servers.
          </p>
        </div>
      </Card>

      {/* 6 — Children's Privacy */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Section 6"
          title="Children's Privacy"
        />
        <div className="mt-4 flex items-start gap-3">
          <UserCheck
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-accent"
          />
          <p className="text-sm leading-relaxed text-ink-secondary">
            ArthVeda is not intended for use by children under 13 years of age. We do not knowingly
            collect personal information from children under 13. If we become aware that a child
            under 13 has provided personal information, we will take steps to remove such
            information promptly.
          </p>
        </div>
      </Card>

      {/* 7 — Your Rights */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Section 7"
          title="Your Rights"
          description="You have the right to contact us regarding your personal information."
        />
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {USER_RIGHTS.map((right) => (
            <li key={right} className="flex items-center gap-2 text-sm text-ink-secondary">
              <Shield
                size={14}
                strokeWidth={1.75}
                aria-hidden="true"
                className="shrink-0 text-accent"
              />
              {right}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
          To exercise any of these rights, please contact us using the email address below.
        </p>
      </Card>

      {/* 8 — Contact */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Section 8"
          title="Contact"
          description="If you have any questions about this Privacy Policy, please contact us."
        />
        <div className="mt-4 flex items-center gap-2">
          <Mail size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-accent" />
          <a
            href={`mailto:${PRIVACY_EMAIL}`}
            className="font-mono text-sm font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline"
          >
            {PRIVACY_EMAIL}
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
          {PRIVACY_INTERNAL_LINKS.map((link) => (
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

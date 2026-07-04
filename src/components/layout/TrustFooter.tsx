/**
 * Sitewide footer — a structured premium finance footer.
 *
 * Five columns (brand + four link groups) over a bottom bar carrying the
 * copyright and the educational disclaimer. Present on every screen. All
 * content is static (no images, no async), so the footer introduces no layout
 * shift. Column headings are <h2> and each group is a labelled <nav> for
 * accessibility. Uses only existing design tokens — emerald/white/mist with a
 * restrained gold accent — so the institutional identity is preserved.
 */

import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { InstagramButton } from '../social/InstagramButton';
import { TESTIDS } from '../../lib/testids';

interface FooterLink {
  href: string;
  label: string;
}

const CALCULATOR_LINKS: FooterLink[] = [
  { href: '/sip-calculator', label: 'SIP Calculator' },
  { href: '/sip-vs-stepup-sip-calculator', label: 'SIP vs Step-Up SIP' },
  { href: '/retirement-calculator', label: 'Retirement Calculator' },
  { href: '/swp-calculator', label: 'SWP Calculator' },
  { href: '/lumpsum-calculator', label: 'Lumpsum Calculator' },
  { href: '/fire-calculator', label: 'FIRE Calculator' },
];

const COMPANY_LINKS: FooterLink[] = [
  { href: '/about-us', label: 'About Us' },
  { href: '/contact-us', label: 'Contact Us' },
];

const RESOURCE_ITEMS: string[] = ['Blog', 'Financial Guides', 'FAQs'];

const LEGAL_LINKS: FooterLink[] = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/cookie-policy', label: 'Cookie Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/editorial-policy', label: 'Editorial Policy' },
  { href: '/calculator-methodology', label: 'Calculator Methodology' },
  { href: '/why-trust-our-calculators', label: 'Why Trust Our Calculators' },
  { href: '/risk-disclosure', label: 'Risk Disclosure' },
];

const LINK_CLASS =
  'text-sm text-ink-secondary underline-offset-2 transition-colors duration-150 ' +
  'hover:text-accent hover:underline focus-visible:outline-none focus-visible:text-accent';

/** A subtle, non-interactive "Coming Soon" badge for unbuilt resources. */
function ComingSoonBadge() {
  return (
    <span
      className="
        inline-flex items-center rounded-[var(--radius-control)] border border-hairline
        bg-mist px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-secondary
      "
    >
      Coming Soon
    </span>
  );
}

/** A titled footer column with its own accessible landmark. */
function FooterColumn({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const headingId = `footer-col-${id}`;
  return (
    <nav aria-labelledby={headingId} className={className}>
      <h2
        id={headingId}
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink"
      >
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </nav>
  );
}

export function TrustFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t-2 border-accent bg-mist"
      data-testid={TESTIDS.trustFooter}
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Section 1 — Brand + social */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <BrandMark size={28} />
              <span className="font-heading text-xl font-bold leading-none text-ink">
                ArthVeda Wealth Studio
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-secondary">
              Helping Indian investors make informed financial decisions through transparent
              investment calculators, practical financial planning tools, and educational
              resources.
            </p>
            <div className="mt-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                Follow us
              </p>
              <div className="mt-3">
                <InstagramButton variant="icon" testId={TESTIDS.footerInstagram} />
              </div>
            </div>
          </div>

          {/* Section 2 — Investment Calculators */}
          <FooterColumn id="calculators" title="Investment Calculators" className="lg:col-span-2">
            {CALCULATOR_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={LINK_CLASS}>
                  {link.label}
                </a>
              </li>
            ))}
          </FooterColumn>

          {/* Section 3 — Company */}
          <FooterColumn id="company" title="Company" className="lg:col-span-2">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  data-testid={link.href === '/about-us' ? TESTIDS.footerAbout : undefined}
                  className={LINK_CLASS}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </FooterColumn>

          {/* Section 4 — Resources (not yet available) */}
          <FooterColumn id="resources" title="Resources" className="lg:col-span-2">
            {RESOURCE_ITEMS.map((item) => (
              <li key={item} className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-ink-secondary">{item}</span>
                <ComingSoonBadge />
              </li>
            ))}
          </FooterColumn>

          {/* Section 5 — Legal */}
          <FooterColumn id="legal" title="Legal" className="lg:col-span-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={LINK_CLASS}>
                  {link.label}
                </a>
              </li>
            ))}
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-hairline pt-6">
          <p className="text-sm font-medium text-ink" data-testid={TESTIDS.footerContact}>
            © {year} ArthVeda Wealth Studio. All Rights Reserved.
          </p>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-ink-secondary">
            Investment calculators are intended for educational and planning purposes only. Actual
            investment returns may differ from projections.
          </p>
        </div>
      </div>
    </footer>
  );
}

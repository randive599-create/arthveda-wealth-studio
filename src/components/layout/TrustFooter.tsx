/**
 * Footer disclaimer, present on every screen. Reiterates the illustrative,
 * non-advisory nature of the projections.
 */

import { TESTIDS } from '../../lib/testids';

export function TrustFooter() {
  return (
    <footer className="border-t border-hairline bg-mist" data-testid={TESTIDS.trustFooter}>
      <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8">
        <p className="font-heading text-base font-bold text-ink">ArthVeda · Private Office</p>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-ink-secondary">
          This projection is illustrative and provided for long-term financial planning purposes
          only. It is not investment advice, a recommendation, or a guarantee of future results.
          Figures assume constant rates and monthly compounding and will differ from actual market
          outcomes.
        </p>
        <nav aria-label="Footer" className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <a
            href="/"
            className="text-sm font-medium text-ink-secondary underline-offset-2 hover:text-ink hover:underline"
          >
            Home
          </a>
          <a
            href="/about-us"
            data-testid={TESTIDS.footerAbout}
            className="text-sm font-medium text-ink-secondary underline-offset-2 hover:text-ink hover:underline"
          >
            About Us
          </a>
          <a
            href="/contact-us"
            className="text-sm font-medium text-ink-secondary underline-offset-2 hover:text-ink hover:underline"
          >
            Contact Us
          </a>
          <a
            href="/privacy-policy"
            className="text-sm font-medium text-ink-secondary underline-offset-2 hover:text-ink hover:underline"
          >
            Privacy Policy
          </a>
          <a
            href="/terms-and-conditions"
            className="text-sm font-medium text-ink-secondary underline-offset-2 hover:text-ink hover:underline"
          >
            Terms &amp; Conditions
          </a>
          <a
            href="/disclaimer"
            className="text-sm font-medium text-ink-secondary underline-offset-2 hover:text-ink hover:underline"
          >
            Disclaimer
          </a>
          <a
            href="/cookie-policy"
            className="text-sm font-medium text-ink-secondary underline-offset-2 hover:text-ink hover:underline"
          >
            Cookie Policy
          </a>
        </nav>
        <p className="mt-4 text-sm text-ink-secondary" data-testid={TESTIDS.footerContact}>
          Contact:{' '}
          <a
            href="mailto:info@arthvedawealth.in"
            className="font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline"
          >
            info@arthvedawealth.in
          </a>
        </p>
      </div>
    </footer>
  );
}

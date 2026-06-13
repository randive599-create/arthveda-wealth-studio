/**
 * /swp-calculator — a dedicated SWP (Systematic Withdrawal Plan) calculator.
 *
 * Unlike the other landing pages, this page does NOT reuse the generic Wealth
 * Projection studio (which exposed SIP-oriented inputs). It renders a
 * purpose-built SWP experience (withdrawal-focused inputs, SWP outputs, a
 * corpus depletion curve, and an SWP PDF report) via <SwpCalculator />, while
 * keeping the existing SEO content (long-form copy + 10-item FAQ with FAQPage
 * JSON-LD) and the existing routing.
 *
 * The withdrawal projection still runs on the shared ArthVeda engine (see
 * swpModel.ts) — no engine, formula, chart library, or PDF engine is changed;
 * they are reused.
 */

import { AppShell } from '../../components/layout/AppShell';
import { TESTIDS } from '../../lib/testids';
import { SwpCalculator } from './SwpCalculator';
import { SwpSeoContent } from './SwpSeoContent';
import { SWP_META, buildSwpFaqJsonLd } from './swpContent';
import { useSeoHead } from '../shared/useSeoHead';

export function SwpCalculatorPage() {
  useSeoHead({ meta: SWP_META, faqKey: 'swp-faq', buildFaqJsonLd: buildSwpFaqJsonLd });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid={TESTIDS.swpCalculatorPage}>
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              SWP Calculator
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              SWP Calculator — Systematic Withdrawal Plan &amp; Monthly Income
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              Model a Systematic Withdrawal Plan from an existing corpus: see how long your money
              lasts, your total withdrawals, the inflation-adjusted value of your income, and the
              probability your portfolio survives the full term. Adjust the inputs to update your
              plan instantly.
            </p>
          </header>

          <SwpCalculator />

          <SwpSeoContent />
        </div>
      }
    />
  );
}

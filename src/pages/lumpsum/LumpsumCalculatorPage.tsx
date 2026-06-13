/**
 * /lumpsum-calculator — a dedicated Lumpsum (one-time investment) calculator.
 *
 * Unlike the other landing pages, this page does NOT reuse the generic Wealth
 * Projection studio (which exposed SIP-oriented inputs). It renders a
 * purpose-built lumpsum experience (one-time-investment inputs, lumpsum outputs,
 * an investment growth curve, and a lumpsum PDF report) via <LumpsumCalculator
 * />, while keeping the existing SEO content (long-form copy + 10-item FAQ with
 * FAQPage JSON-LD) and the existing routing.
 *
 * The compounding still runs on the shared ArthVeda engine (see lumpsumModel.ts)
 * — no engine, formula, chart library, or PDF engine is changed; they are
 * reused.
 */

import { AppShell } from '../../components/layout/AppShell';
import { TESTIDS } from '../../lib/testids';
import { LumpsumCalculator } from './LumpsumCalculator';
import { LumpsumSeoContent } from './LumpsumSeoContent';
import { LUMPSUM_META, buildLumpsumFaqJsonLd } from './lumpsumContent';
import { useSeoHead } from '../shared/useSeoHead';

export function LumpsumCalculatorPage() {
  useSeoHead({ meta: LUMPSUM_META, faqKey: 'lumpsum-faq', buildFaqJsonLd: buildLumpsumFaqJsonLd });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid={TESTIDS.lumpsumCalculatorPage}>
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              Lumpsum Calculator
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Lumpsum Calculator — One-Time Investment Growth Projection
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              Project the future value of a one-time investment: see your final corpus, total gain,
              CAGR, inflation-adjusted wealth, and how many times your money grows. Adjust the inputs
              to update your projection instantly.
            </p>
          </header>

          <LumpsumCalculator />

          <LumpsumSeoContent />
        </div>
      }
    />
  );
}

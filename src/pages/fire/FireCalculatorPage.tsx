/**
 * /fire-calculator — a dedicated FIRE (Financial Independence, Retire Early)
 * calculator.
 *
 * Unlike the other landing pages, this page does NOT reuse the generic Wealth
 * Projection studio. It renders a purpose-built FIRE experience (FIRE-specific
 * inputs, outputs, charts, and a FIRE PDF report) via <FireCalculator />, while
 * keeping the existing SEO content (long-form copy + 10-item FAQ with FAQPage
 * JSON-LD) and the existing routing.
 *
 * The corpus accumulation still runs on the shared ArthVeda projection engine
 * (see fireModel.ts) — no engine, formula, chart library, or PDF engine is
 * changed; they are reused.
 */

import { AppShell } from '../../components/layout/AppShell';
import { TESTIDS } from '../../lib/testids';
import { FireCalculator } from './FireCalculator';
import { FireSeoContent } from './FireSeoContent';
import { FIRE_META, buildFireFaqJsonLd } from './fireContent';
import { useSeoHead } from '../shared/useSeoHead';

export function FireCalculatorPage() {
  useSeoHead({ meta: FIRE_META, faqKey: 'fire-faq', buildFaqJsonLd: buildFireFaqJsonLd });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid={TESTIDS.fireCalculatorPage}>
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              FIRE Calculator
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              FIRE Calculator — Financial Independence &amp; Early Retirement
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              Find your FIRE number, project your corpus to your target retirement age, and see
              whether you are on track for financial independence — with inflation-adjusted targets
              and a clear wealth gap. Adjust the inputs to update your plan instantly.
            </p>
          </header>

          <FireCalculator />

          <FireSeoContent />
        </div>
      }
    />
  );
}

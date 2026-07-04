/**
 * /retirement-calculator — a dedicated Retirement Planner.
 *
 * Unlike the generic Wealth Studio, this page renders a purpose-built
 * two-phase retirement planner (accumulation + drawdown) via <RetirementPlanner
 * />: retirement-specific inputs, the corpus-required / projected / gap /
 * sustainability outputs, accumulation / drawdown / gap charts, and a retirement
 * PDF report. It keeps the existing SEO content (long-form copy + 10-item FAQ
 * with FAQPage JSON-LD) and the existing routing.
 *
 * Both phases still run on the shared ArthVeda engine (see retirementModel.ts) —
 * no engine, formula, chart library, or PDF engine is changed; they are reused.
 * No other calculator is affected.
 */

import { AppShell } from '../../components/layout/AppShell';
import { TESTIDS } from '../../lib/testids';
import { RetirementPlanner } from './RetirementPlanner';
import { RetirementSeoContent } from './RetirementSeoContent';
import { RETIREMENT_META, buildRetirementFaqJsonLd } from './retirementContent';
import { useSeoHead } from '../shared/useSeoHead';

export function RetirementCalculatorPage() {
  useSeoHead({
    meta: RETIREMENT_META,
    faqKey: 'retirement-faq',
    buildFaqJsonLd: buildRetirementFaqJsonLd,
  });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid={TESTIDS.retirementCalculatorPage}>
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              Retirement Calculator
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Retirement Calculator India — Plan Your Corpus &amp; Retirement Income
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              Plan both phases of retirement: accumulate your corpus to your retirement age, then
              draw an inflation-growing income through retirement. See the corpus you need, what you
              are projected to have, your wealth gap, and whether your income is sustainable. Adjust
              the inputs to update instantly.
            </p>
          </header>

          <RetirementPlanner />

          <RetirementSeoContent />
        </div>
      }
    />
  );
}

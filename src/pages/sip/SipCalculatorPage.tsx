/**
 * /sip-calculator — a dedicated SIP Calculator India experience.
 *
 * Unlike a generic Wealth Studio, this page renders a purpose-built
 * SIP calculator (Basic + Advanced inputs, SIP-specific primary and advanced
 * results, SIP charts, a Monthly-SIP → Corpus comparison, and a SIP PDF report)
 * via <SipCalculator />. It keeps the existing SIP SEO content, FAQ, FAQPage
 * schema and canonical URL (see useSipSeoHead + SipSeoContent), and the routing.
 *
 * The projection still runs on the shared ArthVeda engine (see sipModel.ts) — no
 * engine, formula, chart library, or PDF engine is changed; they are reused. No
 * other calculator and not the homepage are affected.
 */

import { AppShell } from '../../components/layout/AppShell';
import { TESTIDS } from '../../lib/testids';
import { SipCalculator } from './SipCalculator';
import { SipSeoContent } from './SipSeoContent';
import { useSipSeoHead } from './useSipSeoHead';

export function SipCalculatorPage() {
  useSipSeoHead();

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid={TESTIDS.sipCalculatorPage}>
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              SIP Calculator
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              SIP Calculator India — Calculate SIP Returns &amp; Future Wealth
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              Estimate the maturity value of your Systematic Investment Plan, the wealth you create,
              and your returns. Start with the basics, expand advanced options for step-up and
              inflation, and compare how different monthly SIPs grow. Adjust the inputs to update
              instantly.
            </p>
          </header>

          <SipCalculator />

          <SipSeoContent />
        </div>
      }
    />
  );
}

/**
 * /sip-vs-stepup-sip-calculator — a dedicated SIP vs Step-Up SIP comparison
 * calculator. Self-contained experience: comparison inputs + step-up method
 * toggle, primary + unique outputs, four charts, a full comparison table, SEO
 * content (with an engine-generated growth table and 10-item FAQ), and a
 * comparison PDF.
 *
 * SEO: canonical, Open Graph/Twitter and FAQPage + BreadcrumbList JSON-LD via
 * useSeoHead; a prerendered static page is emitted at build time. The projection
 * runs on the shared ArthVeda engine — no existing calculator or formula is
 * changed.
 */

import { AppShell } from '../../components/layout/AppShell';
import { TESTIDS } from '../../lib/testids';
import { SipVsStepUpCalculator } from './SipVsStepUpCalculator';
import { StepUpSeoContent } from './StepUpSeoContent';
import {
  STEPUP_META,
  buildStepUpBreadcrumbJsonLd,
  buildStepUpFaqJsonLd,
} from './stepUpContent';
import { useSeoHead } from '../shared/useSeoHead';

export function SipVsStepUpCalculatorPage() {
  useSeoHead({
    meta: STEPUP_META,
    faqKey: 'stepup-faq',
    buildFaqJsonLd: buildStepUpFaqJsonLd,
    extraJsonLd: [{ key: 'stepup-breadcrumb', build: buildStepUpBreadcrumbJsonLd }],
  });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        <div className="space-y-8" data-testid={TESTIDS.stepUpCalculatorPage}>
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              SIP vs Step-Up SIP
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              SIP vs Step-Up SIP Calculator India
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
              Compare a normal SIP against a step-up SIP — by percentage or fixed amount — and see
              the extra wealth created, how many years you save, the equivalent flat SIP, and how
              much faster your money grows. Adjust the inputs to update instantly.
            </p>
          </header>

          <SipVsStepUpCalculator />

          <StepUpSeoContent />
        </div>
      }
    />
  );
}

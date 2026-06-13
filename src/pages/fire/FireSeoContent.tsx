/**
 * Long-form, SEO-oriented editorial content for the FIRE calculator landing
 * page: what FIRE is, why it works, an engine-computed example corpus-growth
 * table, why use ArthVeda, internal links to the other calculators, and a
 * 10-item FAQ with FAQPage JSON-LD. Built entirely from existing design
 * primitives — no new visual language.
 */

import { Plus, ArrowUpRight } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { TESTIDS } from '../../lib/testids';
import { FIRE_FAQ, FIRE_INTERNAL_LINKS, buildFireExampleRows } from './fireContent';

const FIRE_BENEFITS: { title: string; body: string }[] = [
  {
    title: 'A clear financial-independence target',
    body: 'Translate your annual expenses into a concrete corpus to aim for, then track your projected progress toward it.',
  },
  {
    title: 'Savings rate is the biggest lever',
    body: 'Investing a high share of income both grows your corpus faster and lowers the expenses it must one day cover.',
  },
  {
    title: 'Compounding does the heavy lifting',
    body: 'Early, consistent investing gives compounding more time, so most of a FIRE corpus typically comes from growth.',
  },
  {
    title: 'Step-up as income rises',
    body: 'Increasing contributions each year accelerates the timeline, since additional capital compounds for the remaining horizon.',
  },
  {
    title: 'Inflation-aware planning',
    body: "See your corpus in today's purchasing power so your FIRE number reflects real expenses, not a headline figure.",
  },
  {
    title: 'Freedom and optionality',
    body: 'Reaching financial independence gives you the choice to keep working, change careers, or retire early on your terms.',
  },
];

const ARTHVEDA_REASONS: string[] = [
  'Aggressive accumulation with an optional annual step-up — the same institutional engine that powers the full ArthVeda studio.',
  'Inflation-adjusted (real) corpus alongside the nominal figure, so your FIRE target reflects genuine purchasing power.',
  'A year-by-year projection ledger, wealth-composition breakdown, and milestone tracking — not just a single number.',
  'Everything runs locally in your browser. No sign-up, no data leaves your device, and any scenario is shareable as a link.',
];

export function FireSeoContent() {
  const exampleRows = buildFireExampleRows();

  return (
    <div className="space-y-8">
      {/* What is FIRE */}
      <Card className="p-6">
        <SectionHeading eyebrow="Guide" title="What is FIRE?" />
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-secondary">
          <p>
            <strong className="text-ink">FIRE</strong> — Financial Independence, Retire Early — is a
            strategy of saving and investing a high share of your income so that your corpus can
            eventually cover your living expenses indefinitely. Reaching it gives you the freedom to
            stop working far earlier than a traditional retirement age, or simply the option to.
          </p>
          <p>
            Your <strong className="text-ink">FIRE number</strong> is the corpus that sustainably
            funds your annual spending — a common rule of thumb is roughly 25 times your yearly
            expenses, matching a 4% withdrawal rate. This calculator models an aggressive
            accumulation plan with an optional annual step-up and projects, year by year, how your
            corpus grows toward that target.
          </p>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-6">
        <SectionHeading eyebrow="Why it works" title="Principles of FIRE" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIRE_BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-[var(--radius-control)] border border-hairline p-4"
            >
              <h3 className="font-heading text-lg font-bold leading-snug text-ink">
                {benefit.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{benefit.body}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Example growth table */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Illustration"
          title="Example FIRE corpus growth"
          description="A ₹5 lakh head start plus a ₹50,000 monthly investment with a 10% annual step-up at an assumed 12% return over 20 years — the default scenario above. Figures are illustrative, not guaranteed."
        />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline">
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Year
                </th>
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Total Invested
                </th>
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Est. Corpus
                </th>
                <th className="py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Returns
                </th>
              </tr>
            </thead>
            <tbody>
              {exampleRows.map((row) => (
                <tr key={row.year} className="border-b border-hairline last:border-0">
                  <td className="py-2.5 pr-4 font-mono text-sm font-semibold text-ink">
                    {row.year}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-sm text-ink-secondary">
                    {row.invested}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-sm font-semibold text-ink">
                    {row.corpus}
                  </td>
                  <td className="py-2.5 font-mono text-sm text-accent">{row.returns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Why ArthVeda */}
      <Card className="p-6">
        <SectionHeading eyebrow="The difference" title="Why use the ArthVeda FIRE Calculator" />
        <ul className="mt-5 space-y-3">
          {ARTHVEDA_REASONS.map((reason) => (
            <li key={reason} className="flex gap-3 text-sm leading-relaxed text-ink-secondary">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Internal links */}
      <Card className="p-6" data-testid={TESTIDS.fireInternalLinks}>
        <SectionHeading eyebrow="Explore" title="More ArthVeda calculators" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIRE_INTERNAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="
                group flex items-start justify-between gap-3 rounded-[var(--radius-control)]
                border border-hairline p-4 transition-colors hover:border-accent
              "
            >
              <span>
                <span className="font-heading text-lg font-bold leading-snug text-ink group-hover:text-accent">
                  {link.label}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-secondary">
                  {link.description}
                </span>
              </span>
              <ArrowUpRight
                size={18}
                strokeWidth={1.75}
                aria-hidden="true"
                className="mt-1 shrink-0 text-ink-secondary transition-colors group-hover:text-accent"
              />
            </a>
          ))}
        </div>
      </Card>

      {/* FAQ */}
      <Card className="p-6" data-testid={TESTIDS.fireFaqSection}>
        <SectionHeading
          eyebrow="Knowledge"
          title="FIRE Calculator — Frequently Asked Questions"
          description="Common questions about financial independence, the FIRE number, the 4% rule, savings rate, and inflation."
        />
        <div className="mt-6 divide-y divide-hairline">
          {FIRE_FAQ.map((entry, index) => (
            <details
              key={entry.question}
              className="group py-1"
              data-testid={TESTIDS.fireFaqItem(index)}
            >
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
    </div>
  );
}

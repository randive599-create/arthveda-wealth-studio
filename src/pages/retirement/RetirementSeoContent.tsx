/**
 * Long-form, SEO-oriented editorial content for the retirement calculator
 * landing page: what retirement planning is, why it matters, an engine-computed
 * example corpus-growth table, why use ArthVeda, internal links to the other
 * calculators, and a 10-item FAQ with FAQPage JSON-LD. Built entirely from
 * existing design primitives — no new visual language.
 */

import { Plus } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { ExploreCalculators } from '../../components/navigation/ExploreCalculators';
import { TESTIDS } from '../../lib/testids';
import { RETIREMENT_FAQ, buildRetirementExampleRows } from './retirementContent';

const RETIREMENT_BENEFITS: { title: string; body: string }[] = [
  {
    title: 'Plan corpus and income together',
    body: 'Model the wealth you accumulate while working and the monthly income it can sustain in retirement — both stages in a single projection.',
  },
  {
    title: 'Start early, contribute less',
    body: 'Because compounding rewards time, beginning earlier can sharply reduce the monthly amount needed to reach the same retirement corpus.',
  },
  {
    title: 'Inflation-aware targets',
    body: 'See your corpus and income in present-day value so your plan reflects real purchasing power, not just a large nominal headline figure.',
  },
  {
    title: 'Separate pre- and post-retirement returns',
    body: 'Set a growth rate for the accumulation years and a more conservative rate once retired and drawing income.',
  },
  {
    title: 'Step-up your savings',
    body: 'Raise your contribution each year in line with income so more capital compounds for the remaining horizon.',
  },
  {
    title: 'Test sustainability',
    body: 'Check whether a chosen income lasts the full horizon — the studio flags the year the corpus would be exhausted, if any.',
  },
];

const ARTHVEDA_REASONS: string[] = [
  'A complete two-phase model — accumulation then withdrawal — powered by the same institutional engine that drives the full ArthVeda studio.',
  'Inflation-adjusted (real) corpus and income alongside nominal figures, so you see what your retirement is genuinely worth.',
  'A year-by-year projection ledger, wealth-composition breakdown, and milestone tracking — not just a single number.',
  'Everything runs locally in your browser. No sign-up, no data leaves your device, and any scenario is shareable as a link.',
];

export function RetirementSeoContent() {
  const exampleRows = buildRetirementExampleRows();

  return (
    <div className="space-y-8">
      {/* What is retirement planning */}
      <Card className="p-6">
        <SectionHeading eyebrow="Guide" title="What is a retirement calculator?" />
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-secondary">
          <p>
            A <strong className="text-ink">retirement calculator</strong> helps you answer two
            linked questions: how large a corpus you need to retire, and how much monthly income
            that corpus can sustain. Rather than a single number, sound retirement planning spans
            two stages — the <strong className="text-ink">accumulation</strong> years while you save
            and invest, and the <strong className="text-ink">withdrawal</strong> years when you draw
            an income.
          </p>
          <p>
            This studio models both. Contribute a monthly amount with an optional annual step-up
            during your working life, then switch to a withdrawal phase that pays a monthly income
            at a more conservative post-retirement return. Enable inflation adjustment to see the
            result in today&rsquo;s purchasing power, which is essential for an honest plan.
          </p>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-6">
        <SectionHeading eyebrow="Why it works" title="Benefits of planning your retirement" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {RETIREMENT_BENEFITS.map((benefit) => (
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

      {/* Example corpus growth table */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Illustration"
          title="Example retirement corpus growth"
          description="A ₹30,000 monthly SIP with a 10% annual step-up at an assumed 12% return, retiring after 30 years — the default scenario above. Figures are illustrative, not guaranteed."
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
        <SectionHeading
          eyebrow="The difference"
          title="Why use the ArthVeda Retirement Calculator"
        />
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

      {/* Explore other calculators */}
      <ExploreCalculators currentPath="/retirement-calculator" />

      {/* FAQ */}
      <Card className="p-6" data-testid={TESTIDS.retirementFaqSection}>
        <SectionHeading
          eyebrow="Knowledge"
          title="Retirement Calculator — Frequently Asked Questions"
          description="Common questions about retirement corpus, sustainable withdrawals, inflation, and long-term planning."
        />
        <div className="mt-6 divide-y divide-hairline">
          {RETIREMENT_FAQ.map((entry, index) => (
            <details
              key={entry.question}
              className="group py-1"
              data-testid={TESTIDS.retirementFaqItem(index)}
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

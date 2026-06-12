/**
 * Long-form, SEO-oriented editorial content for the SIP calculator landing
 * page: what a SIP is, its benefits, an engine-computed example growth table,
 * why use ArthVeda, internal links to the other calculators, and a 10-item FAQ
 * accordion. Built entirely from existing design primitives (Card,
 * SectionHeading) and the shared currency formatter — no new visual language.
 */

import { Plus, ArrowUpRight } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { TESTIDS } from '../../lib/testids';
import { SIP_FAQ, SIP_INTERNAL_LINKS, buildSipExampleRows } from './sipContent';

const SIP_BENEFITS: { title: string; body: string }[] = [
  {
    title: 'Disciplined, automatic investing',
    body: 'A fixed monthly contribution turns investing into a habit and removes the temptation to time the market.',
  },
  {
    title: 'Rupee-cost averaging',
    body: 'Investing the same amount regularly buys more units when prices are low and fewer when high, smoothing your average cost.',
  },
  {
    title: 'The power of compounding',
    body: 'Returns earned start earning their own returns. Over long horizons, compounding typically contributes the majority of the final corpus.',
  },
  {
    title: 'Step-up flexibility',
    body: 'Raising your SIP each year in line with income lets the additional capital compound for the remaining horizon and lifts the outcome materially.',
  },
  {
    title: 'Low entry barrier',
    body: 'You can start small and scale up over time, making long-term wealth creation accessible from a modest monthly amount.',
  },
  {
    title: 'Goal alignment',
    body: 'SIPs map naturally to long-term goals — retirement, a home, education — where time in the market matters more than timing it.',
  },
];

const ARTHVEDA_REASONS: string[] = [
  'Monthly compounding with an optional annual step-up — the same institutional engine that powers the full ArthVeda studio.',
  'Inflation-adjusted (real) corpus alongside nominal figures, so you see what your wealth is genuinely worth.',
  'A year-by-year projection ledger, wealth-composition breakdown, and milestone tracking — not just a single number.',
  'Everything runs locally in your browser. No sign-up, no data leaves your device, and any scenario is shareable as a link.',
];

export function SipSeoContent() {
  const exampleRows = buildSipExampleRows();

  return (
    <div className="space-y-8">
      {/* What is SIP */}
      <Card className="p-6">
        <SectionHeading eyebrow="Guide" title="What is a SIP?" />
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-secondary">
          <p>
            A <strong className="text-ink">Systematic Investment Plan (SIP)</strong> is a method of
            investing a fixed amount at regular intervals — typically every month — rather than
            committing a large sum all at once. Each contribution buys into your chosen investment
            and then compounds over time, so a modest, consistent monthly habit can grow into a
            substantial corpus over the long term.
          </p>
          <p>
            Because you invest across market ups and downs, a SIP naturally averages your purchase
            cost and removes the pressure of trying to time the market. Pair that with an annual{' '}
            <strong className="text-ink">step-up</strong> — increasing your contribution as your
            income grows — and the compounding effect becomes even more pronounced.
          </p>
        </div>
      </Card>

      {/* Benefits of SIP */}
      <Card className="p-6">
        <SectionHeading eyebrow="Why it works" title="Benefits of SIP" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SIP_BENEFITS.map((benefit) => (
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

      {/* Example SIP growth table */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Illustration"
          title="Example SIP growth"
          description="A ₹10,000 monthly SIP with a 10% annual step-up at an assumed 12% return — the default scenario above. Figures are illustrative, not guaranteed."
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
        <SectionHeading eyebrow="The difference" title="Why use the ArthVeda SIP Calculator" />
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

      {/* Internal links to the other calculators */}
      <Card className="p-6" data-testid={TESTIDS.sipInternalLinks}>
        <SectionHeading eyebrow="Explore" title="More ArthVeda calculators" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SIP_INTERNAL_LINKS.map((link) => (
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

      {/* SIP FAQ */}
      <Card className="p-6" data-testid={TESTIDS.sipFaqSection}>
        <SectionHeading
          eyebrow="Knowledge"
          title="SIP Calculator — Frequently Asked Questions"
          description="Common questions about SIPs, step-up SIPs, returns, inflation, and long-term planning."
        />
        <div className="mt-6 divide-y divide-hairline">
          {SIP_FAQ.map((entry, index) => (
            <details
              key={entry.question}
              className="group py-1"
              data-testid={TESTIDS.sipFaqItem(index)}
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

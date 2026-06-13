/**
 * Long-form, SEO-oriented editorial content for the SWP calculator landing
 * page: what an SWP is, its benefits, an engine-computed example withdrawal
 * table, why use ArthVeda, internal links to the other calculators, and a
 * 10-item FAQ with FAQPage JSON-LD. Built entirely from existing design
 * primitives — no new visual language.
 */

import { Plus, ArrowUpRight } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { TESTIDS } from '../../lib/testids';
import { SWP_FAQ, SWP_INTERNAL_LINKS, buildSwpExampleRows } from './swpContent';

const SWP_BENEFITS: { title: string; body: string }[] = [
  {
    title: 'A salary-like retirement income',
    body: 'Draw a fixed amount each month from your corpus, turning a lump sum into a predictable, recurring income.',
  },
  {
    title: 'The balance keeps compounding',
    body: 'Only the amount you withdraw leaves the corpus; the rest stays invested and continues to earn returns.',
  },
  {
    title: 'Flexible and adjustable',
    body: 'Raise, lower, pause or step up your withdrawals over time as your needs and circumstances change.',
  },
  {
    title: 'Inflation-linked step-up',
    body: 'Increase your withdrawal each year so your income keeps pace with rising living costs.',
  },
  {
    title: 'Know how long it lasts',
    body: 'See the year-by-year balance and a clear flag for the year the corpus would be exhausted, if any.',
  },
  {
    title: 'Tax-efficient for many investors',
    body: 'Withdrawing only what you need each month can be more efficient than redeeming a large amount at once, depending on local rules.',
  },
];

const ARTHVEDA_REASONS: string[] = [
  'Monthly withdrawal simulation with an optional annual step-up — the same institutional engine that powers the full ArthVeda studio.',
  'Inflation-adjusted (real) corpus and withdrawals alongside nominal figures, so you see the true value of your income.',
  'A year-by-year projection ledger and an explicit depletion flag, so sustainability is never a guess.',
  'Everything runs locally in your browser. No sign-up, no data leaves your device, and any scenario is shareable as a link.',
];

export function SwpSeoContent() {
  const exampleRows = buildSwpExampleRows();

  return (
    <div className="space-y-8">
      {/* What is SWP */}
      <Card className="p-6">
        <SectionHeading eyebrow="Guide" title="What is an SWP?" />
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-secondary">
          <p>
            A <strong className="text-ink">Systematic Withdrawal Plan (SWP)</strong> lets you
            withdraw a fixed amount from your investment corpus at regular intervals — typically
            every month — while the remaining balance stays invested and keeps earning returns. It
            is the mirror image of a SIP: instead of paying in, you draw out.
          </p>
          <p>
            SWPs are widely used in retirement to convert an accumulated corpus into a steady,
            salary-like income. Because only the withdrawn amount leaves the portfolio, the rest
            continues to compound — and with an annual{' '}
            <strong className="text-ink">step-up</strong> you can let your income rise to offset
            inflation.
          </p>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-6">
        <SectionHeading eyebrow="Why it works" title="Benefits of an SWP" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SWP_BENEFITS.map((benefit) => (
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

      {/* Example withdrawal table */}
      <Card className="p-6">
        <SectionHeading
          eyebrow="Illustration"
          title="Example SWP withdrawals"
          description="A ₹1 crore corpus drawing ₹50,000 a month at an assumed 8% return — the default scenario above. Figures are illustrative, not guaranteed."
        />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline">
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Year
                </th>
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Annual Withdrawal
                </th>
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Corpus Remaining
                </th>
                <th className="py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                  Total Withdrawn
                </th>
              </tr>
            </thead>
            <tbody>
              {exampleRows.map((row) => (
                <tr key={row.year} className="border-b border-hairline last:border-0">
                  <td className="py-2.5 pr-4 font-mono text-sm font-semibold text-ink">
                    {row.year}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-sm text-accent">{row.withdrawal}</td>
                  <td className="py-2.5 pr-4 font-mono text-sm font-semibold text-ink">
                    {row.corpus}
                  </td>
                  <td className="py-2.5 font-mono text-sm text-ink-secondary">
                    {row.totalWithdrawn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Why ArthVeda */}
      <Card className="p-6">
        <SectionHeading eyebrow="The difference" title="Why use the ArthVeda SWP Calculator" />
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
      <Card className="p-6" data-testid={TESTIDS.swpInternalLinks}>
        <SectionHeading eyebrow="Explore" title="More ArthVeda calculators" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SWP_INTERNAL_LINKS.map((link) => (
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
      <Card className="p-6" data-testid={TESTIDS.swpFaqSection}>
        <SectionHeading
          eyebrow="Knowledge"
          title="SWP Calculator — Frequently Asked Questions"
          description="Common questions about systematic withdrawals, sustainable income, inflation, and how long a corpus lasts."
        />
        <div className="mt-6 divide-y divide-hairline">
          {SWP_FAQ.map((entry, index) => (
            <details
              key={entry.question}
              className="group py-1"
              data-testid={TESTIDS.swpFaqItem(index)}
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

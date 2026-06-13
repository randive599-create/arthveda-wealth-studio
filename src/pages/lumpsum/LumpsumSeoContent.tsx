/**
 * Long-form, SEO-oriented editorial content for the lumpsum calculator landing
 * page: what a lumpsum investment is, its benefits, an engine-computed example
 * growth table, why use ArthVeda, internal links to the other calculators, and
 * a 10-item FAQ with FAQPage JSON-LD. Built entirely from existing design
 * primitives — no new visual language.
 */

import { Plus } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { ExploreCalculators } from '../../components/navigation/ExploreCalculators';
import { TESTIDS } from '../../lib/testids';
import { LUMPSUM_FAQ, buildLumpsumExampleRows } from './lumpsumContent';

const LUMPSUM_BENEFITS: { title: string; body: string }[] = [
  {
    title: 'Capital works immediately',
    body: 'The entire amount is invested from day one, so every rupee has the maximum possible time to compound.',
  },
  {
    title: 'Maximum compounding runway',
    body: 'Over long horizons, a one-time investment can multiply several times as returns themselves begin earning returns.',
  },
  {
    title: 'Simple and low-effort',
    body: 'A single decision puts your money to work — no monthly transactions to manage or remember.',
  },
  {
    title: 'Ideal for windfalls',
    body: 'A bonus, maturity proceeds or an inheritance can be deployed at once rather than sitting idle in cash.',
  },
  {
    title: 'Inflation-aware view',
    body: "See the corpus in today's purchasing power so you understand what the future value is genuinely worth.",
  },
  {
    title: 'Pairs well with a SIP',
    body: 'Combine an initial lumpsum with an ongoing monthly SIP to blend immediate deployment with disciplined, averaged investing.',
  },
];

const ARTHVEDA_REASONS: string[] = [
  'Monthly compounding of a one-time investment — the same institutional engine that powers the full ArthVeda studio.',
  'Inflation-adjusted (real) corpus alongside the nominal figure, so you see what your lumpsum is genuinely worth.',
  'A year-by-year projection ledger, wealth-composition breakdown, and milestone tracking — not just a single number.',
  'Everything runs locally in your browser. No sign-up, no data leaves your device, and any scenario is shareable as a link.',
];

export function LumpsumSeoContent() {
  const exampleRows = buildLumpsumExampleRows();

  return (
    <div className="space-y-8">
      {/* What is a lumpsum */}
      <Card className="p-6">
        <SectionHeading eyebrow="Guide" title="What is a lumpsum investment?" />
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-secondary">
          <p>
            A <strong className="text-ink">lumpsum investment</strong> is a single, one-time
            deployment of capital — for example investing a bonus, maturity proceeds or an
            inheritance all at once — which then compounds for the full horizon. It contrasts with a
            SIP, where you invest smaller amounts at regular intervals.
          </p>
          <p>
            Because the whole amount is invested from the start, a lumpsum gives compounding the
            longest possible runway. This calculator applies{' '}
            <strong className="text-ink">monthly compounding</strong> at the return you assume and
            projects your corpus year by year, with an optional inflation adjustment that reveals
            the value in today&rsquo;s money.
          </p>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-6">
        <SectionHeading eyebrow="Why it works" title="Benefits of a lumpsum investment" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {LUMPSUM_BENEFITS.map((benefit) => (
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
          title="Example lumpsum growth"
          description="A ₹10 lakh one-time investment at an assumed 12% return over 20 years — the default scenario above. Figures are illustrative, not guaranteed."
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
        <SectionHeading eyebrow="The difference" title="Why use the ArthVeda Lumpsum Calculator" />
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
      <ExploreCalculators currentPath="/lumpsum-calculator" />

      {/* FAQ */}
      <Card className="p-6" data-testid={TESTIDS.lumpsumFaqSection}>
        <SectionHeading
          eyebrow="Knowledge"
          title="Lumpsum Calculator — Frequently Asked Questions"
          description="Common questions about one-time investments, compounding, inflation, and lumpsum versus SIP."
        />
        <div className="mt-6 divide-y divide-hairline">
          {LUMPSUM_FAQ.map((entry, index) => (
            <details
              key={entry.question}
              className="group py-1"
              data-testid={TESTIDS.lumpsumFaqItem(index)}
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

/**
 * Long-form SEO content for /sip-vs-stepup-sip-calculator: editorial sections,
 * the engine-generated "how a ₹10,000 SIP grows" table, the 10-item FAQ (its
 * FAQPage JSON-LD is injected by useSeoHead), and cross-links to the other
 * calculators. Built from existing primitives — no new visual language.
 */

import { Plus } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { ExploreCalculators } from '../../components/navigation/ExploreCalculators';
import { formatCompactCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import {
  GROWTH_TABLE_BASE_SIP,
  GROWTH_TABLE_RETURN_PCT,
  STEPUP_FAQ,
  buildStepUpGrowthTable,
} from './stepUpContent';

const BENEFITS: { title: string; body: string }[] = [
  {
    title: 'Keeps pace with your income',
    body: 'As your salary grows, your SIP grows automatically — so you invest more without ever having to remember to raise it.',
  },
  {
    title: 'Beats inflation',
    body: 'A rising contribution preserves the real value of what you invest, instead of the same nominal amount buying less each year.',
  },
  {
    title: 'Dramatically larger corpus',
    body: 'Because later, larger contributions still compound, a modest annual step-up can create a multiple of the extra wealth over long horizons.',
  },
  {
    title: 'Reach goals sooner',
    body: 'Stepping up lets you hit the same wealth target years earlier than a flat SIP — see exactly how many in the Years Saved insight above.',
  },
];

export function StepUpSeoContent() {
  const money = (value: number) => formatCompactCurrency(value, 'INR');
  const growth = buildStepUpGrowthTable();

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <SectionHeading eyebrow="Guide" title="What is a Step-Up SIP?" />
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-secondary">
          <p>
            A <strong className="text-ink">Step-Up SIP</strong> (or top-up SIP) is a Systematic
            Investment Plan whose monthly contribution increases automatically every year. Instead of
            investing the same amount for the entire tenure, you raise it — either by a fixed
            <strong className="text-ink"> percentage</strong> (e.g. 10% more each year) or by a fixed
            <strong className="text-ink"> amount</strong> (e.g. ₹1,000 more each year).
          </p>
          <p>
            Because your later contributions are larger and still have years to compound, a step-up
            SIP builds a substantially bigger corpus than a flat SIP for only a modest increase in
            discipline.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading eyebrow="Comparison" title="Step-Up SIP vs Normal SIP" />
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-secondary">
          <p>
            A <strong className="text-ink">normal SIP</strong> invests a constant amount every month
            for the whole tenure. A <strong className="text-ink">step-up SIP</strong> raises that
            amount yearly. Both earn the same rate of return — the step-up simply puts more capital to
            work over time, so far more compounds in the crucial final years.
          </p>
          <p>
            The calculator above quantifies the gap precisely: the extra wealth created, how much
            faster your money grows, the equivalent flat SIP, and how many years a normal SIP would
            need to catch up.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading eyebrow="Why it works" title="Benefits of a Step-Up SIP" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="rounded-[var(--radius-control)] border border-hairline p-4">
              <h3 className="font-heading text-lg font-bold leading-snug text-ink">{benefit.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{benefit.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading eyebrow="Suitability" title="Who should use a Step-Up SIP?" />
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-secondary">
          <p>
            Step-up SIPs are ideal for <strong className="text-ink">salaried investors</strong> who
            expect their income to rise, anyone investing for a <strong className="text-ink">long
            horizon</strong> (retirement, a child&rsquo;s education, financial independence), and
            disciplined investors who want their investing to scale with their earnings without
            manual intervention each year.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading
          eyebrow="Illustration"
          title="How much additional wealth can a Step-Up SIP create?"
          description={`Final corpus for a ${money(GROWTH_TABLE_BASE_SIP)} monthly SIP at an assumed ${GROWTH_TABLE_RETURN_PCT}% return — engine-generated.`}
        />
        <div className="mt-6 overflow-x-auto" data-testid={TESTIDS.stepUpGrowthTable}>
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline">
                {['Tenure', 'Normal SIP', '5% Step-Up', '10% Step-Up', '15% Step-Up'].map((h) => (
                  <th
                    key={h}
                    className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-secondary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {growth.map((row) => (
                <tr key={row.years} className="border-b border-hairline last:border-0">
                  <td className="py-2.5 pr-4 font-mono text-sm font-semibold text-ink">
                    {row.years} years
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-sm text-ink-secondary">{money(row.normal)}</td>
                  <td className="py-2.5 pr-4 font-mono text-sm text-ink">{money(row.pct5)}</td>
                  <td className="py-2.5 pr-4 font-mono text-sm text-ink">{money(row.pct10)}</td>
                  <td className="py-2.5 font-mono text-sm text-accent">{money(row.pct15)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeading eyebrow="Methods" title="Step-Up SIP: Percentage vs Fixed Amount" />
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-secondary">
          <p>
            A <strong className="text-ink">percentage step-up</strong> grows your SIP geometrically —
            10% on ₹10,000 is ₹1,000 in year two but much more in later years — so it scales with a
            rising income and usually wins over long horizons.
          </p>
          <p>
            A <strong className="text-ink">fixed-amount step-up</strong> adds the same rupee amount
            each year (e.g. ₹1,000), which is simpler and more predictable but grows more slowly.
            Use the toggle above to compare either method against a normal SIP for your own numbers.
          </p>
        </div>
      </Card>

      {/* FAQ */}
      <Card className="p-6" data-testid="stepup-faq-section">
        <SectionHeading
          eyebrow="Knowledge"
          title="SIP vs Step-Up SIP — Frequently Asked Questions"
          description="Common questions about step-up SIPs, the methods, and how much extra wealth they create."
        />
        <div className="mt-6 divide-y divide-hairline">
          {STEPUP_FAQ.map((entry, index) => (
            <details key={entry.question} className="group py-1" data-testid={`stepup-faq-item-${index}`}>
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

      {/* Explore other calculators */}
      <ExploreCalculators currentPath="/sip-vs-stepup-sip-calculator" />
    </div>
  );
}

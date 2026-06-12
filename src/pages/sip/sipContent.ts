/**
 * Content + structured-data for the /sip-calculator SEO landing page.
 *
 * All financial figures in the example table are produced by the existing
 * ArthVeda engine (buildProjection) from the SIP_CALCULATOR_PRESET — no numbers
 * are hand-written, and no calculation logic lives here.
 */

import { buildProjection } from '../../engine';
import { SIP_CALCULATOR_PRESET } from '../../state/defaults';
import { formatCurrency } from '../../format/currency';
import type { FaqEntry } from '../../components/faq/faqData';

/** SEO metadata for the page <head>. */
export const SIP_META = {
  title: 'SIP Calculator India – Calculate SIP Returns & Future Wealth | ArthVeda',
  description:
    "Calculate SIP returns, future wealth, step-up SIP growth, and long-term investment " +
    "projections with ArthVeda's advanced SIP Calculator.",
  canonical: 'https://arthvedawealth.in/sip-calculator',
} as const;

/** Internal links to the other ArthVeda calculators (site structure / SEO). */
export interface InternalLink {
  href: string;
  label: string;
  description: string;
}

export const SIP_INTERNAL_LINKS: InternalLink[] = [
  {
    href: '/retirement-calculator',
    label: 'Retirement Calculator',
    description: 'Plan the corpus you need to retire and the income it can sustain.',
  },
  {
    href: '/swp-calculator',
    label: 'SWP Calculator',
    description: 'Model a Systematic Withdrawal Plan and a monthly retirement income.',
  },
  {
    href: '/lumpsum-calculator',
    label: 'Lumpsum Calculator',
    description: 'Project the growth of a one-time investment over the long term.',
  },
  {
    href: '/fire-calculator',
    label: 'FIRE Calculator',
    description: 'Estimate your path to Financial Independence and early retirement.',
  },
];

/** Ten SIP-focused FAQ entries (drive both the on-page accordion and JSON-LD). */
export const SIP_FAQ: FaqEntry[] = [
  {
    question: 'What is a SIP (Systematic Investment Plan)?',
    answer:
      'A Systematic Investment Plan is a disciplined way to invest a fixed amount at regular ' +
      'intervals — usually every month — instead of investing a large sum at once. It encourages ' +
      'consistency, averages your purchase cost over time, and lets long-term compounding do the ' +
      'heavy lifting.',
  },
  {
    question: 'How does this SIP calculator work?',
    answer:
      'The calculator compounds your monthly SIP on a monthly basis at the annual return you assume, ' +
      'optionally increasing the contribution each year with a step-up. It then projects your invested ' +
      'capital, estimated corpus, and returns for every year of the horizon, and can show the result ' +
      "in today's purchasing power when inflation adjustment is enabled.",
  },
  {
    question: 'What is a step-up SIP and how does it boost returns?',
    answer:
      'A step-up SIP raises your monthly contribution every year — for example by 10% — typically in ' +
      'line with income growth. Because each increase compounds for the remaining years, a step-up can ' +
      'grow the final corpus substantially compared with a flat SIP of the same starting amount.',
  },
  {
    question: 'How much wealth can a ₹10,000 monthly SIP create?',
    answer:
      'It depends on the return, the horizon, and any step-up. With a 10% annual step-up and a 12% ' +
      'assumed return over 20 years, a ₹10,000 starting SIP can grow into a multiple of the capital you ' +
      'actually invest — adjust the inputs above to see your own projection update instantly.',
  },
  {
    question: 'What rate of return should I assume for my SIP?',
    answer:
      'There is no single correct figure. Many long-term equity investors model conservative and ' +
      'optimistic scenarios — for example 10% and 12% per annum — and compare the outcomes. You can ' +
      'change the return rate freely and watch the projection recalculate in real time.',
  },
  {
    question: 'Is a SIP better than a lumpsum investment?',
    answer:
      'They serve different needs. A SIP suits investors building wealth from regular income and helps ' +
      'average market entry points, while a lumpsum puts capital to work immediately when you have it. ' +
      'This studio lets you combine both, so you can compare and blend the two strategies.',
  },
  {
    question: 'How does inflation affect my SIP returns?',
    answer:
      'Inflation erodes the future purchasing power of money. When inflation adjustment is enabled, the ' +
      'calculator shows both the nominal corpus and its real (present-day) value, so you can see what ' +
      'your projected SIP wealth is genuinely worth at the end of the horizon.',
  },
  {
    question: 'Can I change or stop my SIP later?',
    answer:
      'Yes. In practice SIPs are flexible — you can increase, pause, or stop contributions. In the ' +
      'calculator you can model this by adjusting the monthly SIP, the step-up, and the SIP Stop Year ' +
      'to reflect when contributions end while the corpus keeps compounding.',
  },
  {
    question: 'Are SIP returns guaranteed?',
    answer:
      'No. SIP returns depend on the performance of the underlying investments, which vary year to ' +
      'year. The projections here are deterministic illustrations based on the constant assumptions you ' +
      'provide; treat them as a planning baseline, not a guarantee of future results.',
  },
  {
    question: 'How are SIP returns taxed in India?',
    answer:
      'Taxation depends on the type of fund and your holding period, and rules change over time. This ' +
      'calculator projects pre-tax growth for planning purposes only and does not compute tax. Consult a ' +
      'qualified tax or financial professional for advice specific to your situation.',
  },
];

/** FAQPage JSON-LD for the SIP page, built from SIP_FAQ. */
export function buildSipFaqJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SIP_FAQ.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  });
}

/** A single row of the illustrative SIP-growth table. */
export interface SipExampleRow {
  year: number;
  invested: string;
  corpus: string;
  returns: string;
}

/**
 * Build the example SIP-growth table from the engine using the page preset
 * (₹10,000 SIP, 10% step-up, 12% return, 20 years). Reuses buildProjection so
 * the figures are always consistent with the live calculator above.
 */
export function buildSipExampleRows(years: number[] = [5, 10, 15, 20]): SipExampleRow[] {
  const result = buildProjection(SIP_CALCULATOR_PRESET);
  const currency = SIP_CALCULATOR_PRESET.currency;
  return years
    .map((year) => result.yearly.find((row) => row.year === year))
    .filter((row): row is NonNullable<typeof row> => row !== undefined)
    .map((row) => ({
      year: row.year,
      invested: formatCurrency(row.totalInvested, currency),
      corpus: formatCurrency(row.corpus, currency),
      returns: formatCurrency(row.returns, currency),
    }));
}

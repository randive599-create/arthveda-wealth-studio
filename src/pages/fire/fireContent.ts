/**
 * Content + structured-data for the /fire-calculator SEO landing page.
 *
 * All financial figures in the example table are produced by the existing
 * ArthVeda engine (buildProjection) from the FIRE_CALCULATOR_PRESET — no
 * numbers are hand-written, and no calculation logic lives here.
 */

import { buildProjection } from '../../engine';
import { FIRE_CALCULATOR_PRESET } from '../../state/defaults';
import { formatCurrency } from '../../format/currency';
import type { FaqEntry } from '../../components/faq/faqData';

/** SEO metadata for the page <head>. */
export const FIRE_META = {
  title: 'FIRE Calculator – Financial Independence & Early Retirement | ArthVeda',
  description:
    'Estimate your path to Financial Independence, Retire Early (FIRE) with ' +
    "ArthVeda's FIRE calculator. Model your FI corpus, savings, step-up, compounding " +
    'and the inflation-adjusted target.',
  canonical: 'https://arthvedawealth.in/fire-calculator',
} as const;

/** Internal links to the other ArthVeda calculators (site structure / SEO). */
export interface InternalLink {
  href: string;
  label: string;
  description: string;
}

export const FIRE_INTERNAL_LINKS: InternalLink[] = [
  {
    href: '/sip-calculator',
    label: 'SIP Calculator',
    description: 'Project the future value of a monthly SIP with an optional annual step-up.',
  },
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
];

/** Ten FIRE-focused FAQ entries (drive both the accordion and JSON-LD). */
export const FIRE_FAQ: FaqEntry[] = [
  {
    question: 'What is FIRE (Financial Independence, Retire Early)?',
    answer:
      'FIRE stands for Financial Independence, Retire Early — a strategy of saving and investing a ' +
      'high share of your income so that your corpus can eventually cover your living expenses ' +
      'indefinitely, giving you the freedom to stop working far earlier than a traditional ' +
      'retirement age.',
  },
  {
    question: 'How does this FIRE calculator work?',
    answer:
      'You model an aggressive accumulation plan — a starting amount plus a monthly investment with ' +
      'an annual step-up — that compounds at your assumed return. The engine projects how your ' +
      'corpus grows year by year toward your financial-independence target, with an optional ' +
      "inflation adjustment showing the value in today's money.",
  },
  {
    question: 'What is my FIRE number?',
    answer:
      'Your FIRE number is the corpus that can sustainably fund your annual expenses. A widely ' +
      'discussed rule of thumb is roughly 25 times your annual spending, which corresponds to a 4% ' +
      'withdrawal rate. Use this calculator to project when your corpus reaches that target.',
  },
  {
    question: 'What is the 4% rule?',
    answer:
      'The 4% rule is a guideline suggesting you can withdraw about 4% of your corpus in the first ' +
      'year of retirement, then adjust for inflation, with a reasonable chance the money lasts ' +
      'decades. It is a starting reference, not a guarantee — your safe rate depends on returns, ' +
      'inflation and how long your retirement lasts.',
  },
  {
    question: 'How does my savings rate affect early retirement?',
    answer:
      'Your savings rate — the share of income you invest — is the single biggest lever in FIRE. A ' +
      'higher savings rate both grows your corpus faster and lowers the expenses it must eventually ' +
      'cover, so it shortens the time to financial independence dramatically. Raise the monthly ' +
      'contribution above to see the effect.',
  },
  {
    question: 'How does compounding accelerate financial independence?',
    answer:
      'Compounding means your returns earn their own returns. Early, consistent investing gives ' +
      'compounding more time to work, so a large part of your FIRE corpus typically comes from ' +
      'growth rather than contributions — especially when you add an annual step-up.',
  },
  {
    question: 'What is the difference between FIRE and regular retirement?',
    answer:
      'Both aim for a corpus that funds your lifestyle without working. FIRE simply targets it much ' +
      'earlier through a high savings rate, which means a longer withdrawal horizon and a larger ' +
      'inflation-adjusted corpus. For a conventional timeline, see the ArthVeda retirement calculator.',
  },
  {
    question: 'How does inflation affect my FIRE target?',
    answer:
      'Inflation raises your future expenses, so your FIRE number grows over time in nominal terms. ' +
      'With inflation adjustment enabled, the calculator shows your projected corpus in present-day ' +
      'value, helping you set a target that reflects real purchasing power rather than a headline ' +
      'figure.',
  },
  {
    question: 'What return rate should I assume for a FIRE plan?',
    answer:
      'There is no single correct figure. FIRE plans usually assume long-term equity-like returns ' +
      'during accumulation, but it is prudent to test conservative and optimistic rates and see how ' +
      'sensitive your timeline is. You can change the rate and watch the projection update instantly.',
  },
  {
    question: 'Are these FIRE projections guaranteed?',
    answer:
      'No. The projections are deterministic illustrations based on the constant assumptions you ' +
      'enter and monthly compounding. Real markets and inflation vary year to year, so treat the ' +
      'output as a planning baseline rather than a guarantee, and consult a qualified financial ' +
      'professional for advice.',
  },
];

/** FAQPage JSON-LD for the FIRE page, built from FIRE_FAQ. */
export function buildFireFaqJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FIRE_FAQ.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  });
}

/** A single row of the illustrative FIRE-growth table. */
export interface FireExampleRow {
  year: number;
  invested: string;
  corpus: string;
  returns: string;
}

/**
 * Build the example accumulation table from the engine using the page preset
 * (₹5 lakh start + ₹50,000 monthly SIP, 10% step-up, 12% return, 20 years).
 * Reuses buildProjection so the figures are always consistent with the live
 * calculator above.
 */
export function buildFireExampleRows(years: number[] = [5, 10, 15, 20]): FireExampleRow[] {
  const result = buildProjection(FIRE_CALCULATOR_PRESET);
  const currency = FIRE_CALCULATOR_PRESET.currency;
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

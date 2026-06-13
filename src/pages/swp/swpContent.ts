/**
 * Content + structured-data for the /swp-calculator SEO landing page.
 *
 * All financial figures in the example table are produced by the existing
 * ArthVeda engine (buildProjection) from the SWP_CALCULATOR_PRESET — no numbers
 * are hand-written, and no calculation logic lives here.
 */

import { buildProjection } from '../../engine';
import { SWP_CALCULATOR_PRESET } from '../../state/defaults';
import { formatCurrency } from '../../format/currency';
import type { FaqEntry } from '../../components/faq/faqData';

/** SEO metadata for the page <head>. */
export const SWP_META = {
  title: 'SWP Calculator – Systematic Withdrawal Plan & Monthly Income | ArthVeda',
  description:
    'Calculate a Systematic Withdrawal Plan (SWP) and a sustainable monthly income from your ' +
    "corpus with ArthVeda's SWP calculator. Model withdrawals, post-retirement returns, " +
    'inflation and how long your money lasts.',
  canonical: 'https://arthvedawealth.in/swp-calculator',
} as const;

/** Internal links to the other ArthVeda calculators (site structure / SEO). */
export interface InternalLink {
  href: string;
  label: string;
  description: string;
}

export const SWP_INTERNAL_LINKS: InternalLink[] = [
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

/** Ten SWP-focused FAQ entries (drive both the accordion and JSON-LD). */
export const SWP_FAQ: FaqEntry[] = [
  {
    question: 'What is an SWP (Systematic Withdrawal Plan)?',
    answer:
      'A Systematic Withdrawal Plan lets you withdraw a fixed amount from your investment corpus ' +
      'at regular intervals — usually every month — while the remaining balance stays invested and ' +
      'continues to earn returns. It is a popular way to convert a lump-sum corpus into a steady, ' +
      'predictable income.',
  },
  {
    question: 'How does this SWP calculator work?',
    answer:
      'You enter your starting corpus, the monthly withdrawal, an expected post-withdrawal return ' +
      'and the horizon. The engine withdraws your income at the start of each month, grows the ' +
      'remaining balance at the assumed rate, and projects the corpus and cumulative withdrawals ' +
      'year by year — flagging the year the corpus would be exhausted, if any.',
  },
  {
    question: 'How is an SWP different from a SIP?',
    answer:
      'A SIP puts money in — you invest a fixed amount each month to build a corpus. An SWP takes ' +
      'money out — you withdraw a fixed amount each month from an existing corpus. SIPs are for the ' +
      'accumulation years; SWPs are typically used in retirement to draw an income.',
  },
  {
    question: 'How long will my corpus last with an SWP?',
    answer:
      'It depends on the size of the corpus, the monthly withdrawal, the return your investments ' +
      'earn and inflation. If withdrawals exceed what the corpus can sustain, it depletes; if ' +
      'returns outpace withdrawals, it can even grow. The projection shows the year-by-year balance ' +
      'and marks any depletion year.',
  },
  {
    question: 'Can an SWP provide a regular retirement income?',
    answer:
      'Yes — that is its most common use. By drawing a fixed monthly amount from your corpus, an ' +
      'SWP creates a salary-like income in retirement while the untouched balance keeps compounding. ' +
      'You can also apply an annual step-up to your withdrawals to help offset rising living costs.',
  },
  {
    question: 'What is a sustainable monthly withdrawal?',
    answer:
      'A sustainable withdrawal is one your corpus can support for the whole horizon without running ' +
      'out. It rises with a larger corpus or higher returns and falls with a longer horizon or higher ' +
      'inflation. Adjust the monthly withdrawal until the projected corpus comfortably lasts your ' +
      'planning period.',
  },
  {
    question: 'How does inflation affect my SWP income?',
    answer:
      'A fixed withdrawal loses purchasing power over time as prices rise. With inflation adjustment ' +
      'enabled, the calculator shows the real (present-day) value of both your corpus and your ' +
      'withdrawals, and you can apply a withdrawal step-up so your income grows alongside inflation.',
  },
  {
    question: 'What return rate should I assume during an SWP?',
    answer:
      'Retirees often hold a more conservative portfolio, so a lower return than during accumulation ' +
      'is common. There is no single correct figure — model a cautious and an optimistic rate and ' +
      'compare how each affects how long the corpus lasts.',
  },
  {
    question: 'Can I withdraw a step-up amount each year?',
    answer:
      'Yes. The withdrawal step-up increases your monthly income every year, either by a percentage ' +
      'or a fixed amount. This helps your income keep pace with inflation, though a higher step-up ' +
      'also draws down the corpus faster, so check that it remains sustainable.',
  },
  {
    question: 'Are SWP projections guaranteed?',
    answer:
      'No. The projections are deterministic illustrations based on the constant assumptions you ' +
      'enter and monthly compounding. Real returns and inflation vary year to year, so treat the ' +
      'output as a planning baseline, and consult a qualified financial professional before relying ' +
      'on it for retirement income.',
  },
];

/** FAQPage JSON-LD for the SWP page, built from SWP_FAQ. */
export function buildSwpFaqJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SWP_FAQ.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  });
}

/** A single row of the illustrative SWP withdrawal table. */
export interface SwpExampleRow {
  year: number;
  withdrawal: string;
  corpus: string;
  totalWithdrawn: string;
}

/**
 * Build the example withdrawal table from the engine using the page preset
 * (₹1 crore corpus, ₹50,000 monthly withdrawal, 8% return, 25 years). Reuses
 * buildProjection so the figures are always consistent with the live calculator.
 */
export function buildSwpExampleRows(years: number[] = [5, 10, 15, 25]): SwpExampleRow[] {
  const result = buildProjection(SWP_CALCULATOR_PRESET);
  const currency = SWP_CALCULATOR_PRESET.currency;
  return years
    .map((year) => result.yearly.find((row) => row.year === year))
    .filter((row): row is NonNullable<typeof row> => row !== undefined)
    .map((row) => ({
      year: row.year,
      withdrawal: formatCurrency(row.swpAnnual, currency),
      corpus: formatCurrency(row.corpus, currency),
      totalWithdrawn: formatCurrency(row.totalWithdrawn, currency),
    }));
}

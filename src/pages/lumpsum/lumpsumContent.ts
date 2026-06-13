/**
 * Content + structured-data for the /lumpsum-calculator SEO landing page.
 *
 * All financial figures in the example table are produced by the existing
 * ArthVeda engine (buildProjection) from the LUMPSUM_CALCULATOR_PRESET — no
 * numbers are hand-written, and no calculation logic lives here.
 */

import { buildProjection } from '../../engine';
import { LUMPSUM_CALCULATOR_PRESET } from '../../state/defaults';
import { formatCurrency } from '../../format/currency';
import type { FaqEntry } from '../../components/faq/faqData';

/** SEO metadata for the page <head>. */
export const LUMPSUM_META = {
  title: 'Lumpsum Calculator – One-Time Investment Growth Projection | ArthVeda',
  description:
    'Project the future value of a one-time lumpsum investment with ' +
    "ArthVeda's lumpsum calculator. Model compounding, returns, the inflation-adjusted " +
    'corpus and long-term wealth growth.',
  canonical: 'https://arthvedawealth.in/lumpsum-calculator',
} as const;

/** Internal links to the other ArthVeda calculators (site structure / SEO). */
export interface InternalLink {
  href: string;
  label: string;
  description: string;
}

export const LUMPSUM_INTERNAL_LINKS: InternalLink[] = [
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
    href: '/fire-calculator',
    label: 'FIRE Calculator',
    description: 'Estimate your path to Financial Independence and early retirement.',
  },
];

/** Ten lumpsum-focused FAQ entries (drive both the accordion and JSON-LD). */
export const LUMPSUM_FAQ: FaqEntry[] = [
  {
    question: 'What is a lumpsum investment?',
    answer:
      'A lumpsum investment is a single, one-time deployment of capital — for example investing a ' +
      'bonus, maturity proceeds or inheritance all at once — which then compounds for the full ' +
      'horizon. It contrasts with a SIP, where you invest smaller amounts at regular intervals.',
  },
  {
    question: 'How does this lumpsum calculator work?',
    answer:
      'You enter the one-time amount, an expected annual return and the duration. The engine ' +
      'compounds the lumpsum monthly at the assumed rate and projects the resulting corpus and ' +
      'returns year by year, with an optional inflation adjustment that shows the value in ' +
      "today's money.",
  },
  {
    question: 'How is lumpsum growth calculated?',
    answer:
      'The calculator applies monthly compounding: the corpus grows each month by the monthly ' +
      'equivalent of your annual return, so returns themselves start earning returns. Over long ' +
      'horizons this compounding effect typically accounts for the majority of the final value.',
  },
  {
    question: 'Is a lumpsum better than a SIP?',
    answer:
      'They suit different situations. A lumpsum puts all your capital to work immediately, which ' +
      'helps when you already have the money and markets rise. A SIP spreads entry over time and ' +
      'averages your cost. Many investors combine both — this studio lets you model a lumpsum and a ' +
      'SIP together.',
  },
  {
    question: 'When is the best time to invest a lumpsum?',
    answer:
      'Because markets are hard to time, a common approach is to invest when you have the capital ' +
      'and a long enough horizon for it to compound. The longer the money stays invested, the more ' +
      'compounding can contribute — adjust the duration above to see the effect.',
  },
  {
    question: 'How does inflation affect a lumpsum investment?',
    answer:
      'Inflation reduces the future purchasing power of money. When inflation adjustment is enabled, ' +
      'the calculator shows both the nominal corpus and its real (present-day) value, so you can see ' +
      'what your projected lumpsum is genuinely worth at the end of the horizon.',
  },
  {
    question: 'What return rate should I assume for a lumpsum?',
    answer:
      'There is no single correct figure. Many long-term investors model conservative and ' +
      'optimistic scenarios — for example 10% and 12% per annum — and compare the outcomes. You can ' +
      'change the rate freely and watch the projection recalculate instantly.',
  },
  {
    question: 'Can I combine a lumpsum with a monthly SIP?',
    answer:
      'Yes. In the full studio you can set both a one-time lumpsum and an ongoing monthly SIP, with ' +
      'an annual step-up, to model a realistic capital-formation strategy that blends an initial ' +
      'investment with regular contributions.',
  },
  {
    question: 'How much can a lumpsum grow over 20 years?',
    answer:
      'It depends on the amount and the return. At a 12% assumed return with monthly compounding, a ' +
      'lumpsum can grow to several times the original capital over 20 years. Enter your own figures ' +
      'above to see a precise, year-by-year projection.',
  },
  {
    question: 'Are these lumpsum projections guaranteed?',
    answer:
      'No. The projections are deterministic illustrations based on the constant assumptions you ' +
      'enter and monthly compounding. Real markets vary year to year, so treat the output as a ' +
      'planning baseline rather than a guarantee, and consult a qualified financial professional ' +
      'for advice.',
  },
];

/** FAQPage JSON-LD for the lumpsum page, built from LUMPSUM_FAQ. */
export function buildLumpsumFaqJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LUMPSUM_FAQ.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  });
}

/** A single row of the illustrative lumpsum-growth table. */
export interface LumpsumExampleRow {
  year: number;
  invested: string;
  corpus: string;
  returns: string;
}

/**
 * Build the example lumpsum-growth table from the engine using the page preset
 * (₹10 lakh one-time investment at 12% over 20 years). Reuses buildProjection
 * so the figures are always consistent with the live calculator above.
 */
export function buildLumpsumExampleRows(
  years: number[] = [5, 10, 15, 20],
): LumpsumExampleRow[] {
  const result = buildProjection(LUMPSUM_CALCULATOR_PRESET);
  const currency = LUMPSUM_CALCULATOR_PRESET.currency;
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

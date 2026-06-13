/**
 * Content + structured-data for the /retirement-calculator SEO landing page.
 *
 * All financial figures in the example table are produced by the existing
 * ArthVeda engine (buildProjection) from the RETIREMENT_CALCULATOR_PRESET — no
 * numbers are hand-written, and no calculation logic lives here.
 */

import { buildProjection } from '../../engine';
import { RETIREMENT_CALCULATOR_PRESET } from '../../state/defaults';
import { formatCurrency } from '../../format/currency';
import type { FaqEntry } from '../../components/faq/faqData';

/** SEO metadata for the page <head>. */
export const RETIREMENT_META = {
  title: 'Retirement Calculator India – Plan Your Retirement Corpus & Income | ArthVeda',
  description:
    'Plan your retirement corpus and a sustainable monthly retirement income with ' +
    "ArthVeda's retirement calculator. Model SIP accumulation, step-up, inflation and " +
    'a systematic withdrawal phase.',
  canonical: 'https://arthvedawealth.in/retirement-calculator',
} as const;

/** Internal links to the other ArthVeda calculators (site structure / SEO). */
export interface InternalLink {
  href: string;
  label: string;
  description: string;
}

export const RETIREMENT_INTERNAL_LINKS: InternalLink[] = [
  {
    href: '/sip-calculator',
    label: 'SIP Calculator',
    description: 'Project the future value of a monthly SIP with an optional annual step-up.',
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

/** Ten retirement-focused FAQ entries (drive both the accordion and JSON-LD). */
export const RETIREMENT_FAQ: FaqEntry[] = [
  {
    question: 'What is a retirement calculator?',
    answer:
      'A retirement calculator estimates how large a corpus you need to retire and how much ' +
      'monthly income that corpus can sustain. This studio models both stages — the accumulation ' +
      'years while you save and the withdrawal years when you draw an income — so you can plan the ' +
      'full journey in one place.',
  },
  {
    question: 'How much money do I need to retire?',
    answer:
      'It depends on your desired monthly income, the number of years in retirement, expected ' +
      'returns and inflation. A common starting point is to target a corpus that can fund your ' +
      'annual expenses through a sustainable withdrawal rate; adjust the inputs above to see the ' +
      'corpus and income your own plan produces.',
  },
  {
    question: 'How does this retirement calculator work?',
    answer:
      'You model an accumulation phase — a monthly SIP with an optional annual step-up that ' +
      'compounds at your assumed return — followed by a withdrawal phase that draws a monthly ' +
      'income at a (typically lower) post-retirement return. The engine projects your corpus and ' +
      'income year by year and flags if the corpus would run out early.',
  },
  {
    question: 'What is a safe withdrawal rate in retirement?',
    answer:
      'A withdrawal rate is the share of your corpus you draw each year. Many planners discuss ' +
      'rates in the region of 3–4% as a starting reference, but the sustainable figure depends on ' +
      'your returns, inflation and horizon. Use the withdrawal inputs to test different incomes and ' +
      'watch whether the corpus lasts the full horizon.',
  },
  {
    question: 'How does inflation affect my retirement plan?',
    answer:
      'Inflation steadily erodes purchasing power, so a fixed income buys less each year. When ' +
      'inflation adjustment is enabled, the calculator shows your corpus and income in present-day ' +
      'value, and you can apply an annual step-up to your withdrawals to help your income keep pace ' +
      'with rising costs.',
  },
  {
    question: 'When should I start saving for retirement?',
    answer:
      'The earlier the better — time is the most powerful variable in compounding. Starting a ' +
      'decade earlier can dramatically reduce the monthly amount required for the same corpus, ' +
      'because each contribution has more years to grow. Try shifting the duration to see the ' +
      'effect for yourself.',
  },
  {
    question: 'What is the difference between the accumulation and withdrawal phases?',
    answer:
      'During accumulation you contribute regularly and the corpus grows. During withdrawal you ' +
      'stop contributing and draw a monthly income while the remaining balance continues to earn a ' +
      'post-retirement return. This studio lets you set a different return rate for each phase to ' +
      'reflect a more conservative retirement allocation.',
  },
  {
    question: 'Can I retire early with this calculator?',
    answer:
      'Yes. Set a shorter accumulation period and an earlier withdrawal start year to model early ' +
      'retirement, then check whether the resulting corpus sustains your income for the longer ' +
      'retirement that follows. For a dedicated view, see the ArthVeda FIRE calculator.',
  },
  {
    question: 'What return rate should I assume before and after retirement?',
    answer:
      'There is no single correct figure. Investors often assume a higher growth rate during the ' +
      'long accumulation phase and a lower, more conservative rate once retired and drawing income. ' +
      'You can set both rates independently and compare scenarios in real time.',
  },
  {
    question: 'Are these retirement projections guaranteed?',
    answer:
      'No. The projections are deterministic illustrations based on the constant assumptions you ' +
      'enter and monthly compounding. Real markets and inflation vary year to year, so treat the ' +
      'output as a planning baseline rather than a guarantee, and consult a qualified financial ' +
      'professional for advice.',
  },
];

/** FAQPage JSON-LD for the retirement page, built from RETIREMENT_FAQ. */
export function buildRetirementFaqJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: RETIREMENT_FAQ.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  });
}

/** A single row of the illustrative retirement-growth table. */
export interface RetirementExampleRow {
  year: number;
  invested: string;
  corpus: string;
  returns: string;
}

/**
 * Build the example accumulation table from the engine using the page preset
 * (₹30,000 SIP, 10% step-up, 12% return, retiring after 30 years). Reuses
 * buildProjection so the figures are always consistent with the live calculator.
 */
export function buildRetirementExampleRows(
  years: number[] = [10, 20, 30, 40],
): RetirementExampleRow[] {
  const result = buildProjection(RETIREMENT_CALCULATOR_PRESET);
  const currency = RETIREMENT_CALCULATOR_PRESET.currency;
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

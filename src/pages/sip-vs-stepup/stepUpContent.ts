/**
 * Content + structured data for the /sip-vs-stepup-sip-calculator page:
 * SEO metadata, the FAQ (with FAQPage JSON-LD), a BreadcrumbList JSON-LD, and
 * the auto-generated "how a ₹10,000 SIP grows" table (engine-computed).
 */

import type { FaqEntry } from '../../components/faq/faqData';
import { corpusForStepUpSip } from './stepUpModel';

export const STEPUP_META = {
  title: 'SIP vs Step-Up SIP Calculator India – Compare Wealth Created | ArthVeda',
  description:
    'Compare a normal SIP against a step-up SIP (percentage or fixed-amount) and see the extra ' +
    'wealth created, years saved, the equivalent flat SIP and how much faster your wealth grows. ' +
    'Free, engine-accurate, made in India.',
  canonical: 'https://arthvedawealth.in/sip-vs-stepup-sip-calculator',
} as const;

/** Ten FAQ entries (drive both the accordion and the FAQPage JSON-LD). */
export const STEPUP_FAQ: FaqEntry[] = [
  {
    question: 'What is a Step-Up SIP?',
    answer:
      'A Step-Up SIP (also called a top-up SIP) is a Systematic Investment Plan whose monthly ' +
      'contribution rises automatically every year — either by a fixed percentage or a fixed ' +
      'amount. It lets your investing keep pace with your growing income without you having to ' +
      'remember to increase it.',
  },
  {
    question: 'How is a Step-Up SIP different from a normal SIP?',
    answer:
      'A normal SIP invests the same amount every month for the whole tenure. A step-up SIP raises ' +
      'that amount each year, so far more is invested in the later years — and because those ' +
      'contributions still compound, the final corpus is substantially larger than a flat SIP.',
  },
  {
    question: 'Is percentage step-up or fixed-amount step-up better?',
    answer:
      'A percentage step-up grows your SIP geometrically (e.g. 10% more each year), so it scales ' +
      'with income and usually creates more wealth over long horizons. A fixed-amount step-up adds ' +
      'the same rupee amount each year, which is simpler and more predictable. This calculator lets ' +
      'you compare both against a normal SIP.',
  },
  {
    question: 'How much extra wealth can a Step-Up SIP create?',
    answer:
      'It depends on your SIP amount, step-up rate, return and tenure, but over 20–30 years a ' +
      '10% annual step-up can create dramatically more wealth than a flat SIP — often a multiple of ' +
      'the difference in what you contribute. Enter your own numbers above to see the exact extra ' +
      'corpus your plan would create.',
  },
  {
    question: 'What is "Years Saved" in this calculator?',
    answer:
      'Years Saved shows how many additional years a normal flat SIP would need to reach the same ' +
      'final corpus that the step-up SIP reaches in your chosen tenure. In other words, stepping up ' +
      'lets you hit the same wealth target sooner.',
  },
  {
    question: 'What does "Equivalent SIP" mean?',
    answer:
      'Equivalent SIP is the flat monthly SIP — with no step-up — that you would need to invest to ' +
      'reach the same final corpus as your step-up plan over the same tenure. It is a quick way to ' +
      'see how much your step-up is worth as a single fixed amount.',
  },
  {
    question: 'Who should use a Step-Up SIP?',
    answer:
      'A step-up SIP suits salaried investors who expect their income to rise, anyone with a long ' +
      'horizon (retirement, a child\u2019s education, financial independence), and investors who want ' +
      'to beat inflation without manually increasing their SIP each year.',
  },
  {
    question: 'Does a Step-Up SIP guarantee higher returns?',
    answer:
      'No. A step-up SIP does not change the rate of return — it simply invests more over time, so ' +
      'more capital compounds. Returns still depend on the markets, and the figures here are ' +
      'illustrative projections, not guarantees.',
  },
  {
    question: 'Can I change the step-up rate later?',
    answer:
      'Yes. Most fund houses let you set, modify or cancel a step-up instruction. This calculator ' +
      'assumes a constant annual step-up for the whole tenure so you can compare scenarios cleanly; ' +
      'in practice you can revise it as your income changes.',
  },
  {
    question: 'Are these Step-Up SIP projections accurate?',
    answer:
      'The corpus figures use the same deterministic compounding engine that powers every ArthVeda ' +
      'calculator, with monthly compounding and the step-up applied at the start of each year. They ' +
      'are accurate for the assumptions you enter, but real returns vary, so treat the output as a ' +
      'planning estimate and consult a qualified financial professional.',
  },
];

/** FAQPage JSON-LD built from STEPUP_FAQ. */
export function buildStepUpFaqJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: STEPUP_FAQ.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  });
}

/** BreadcrumbList JSON-LD: Home -> SIP vs Step-Up SIP Calculator. */
export function buildStepUpBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://arthvedawealth.in/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'SIP vs Step-Up SIP Calculator',
        item: STEPUP_META.canonical,
      },
    ],
  });
}

export interface StepUpGrowthRow {
  years: number;
  normal: number;
  pct5: number;
  pct10: number;
  pct15: number;
}

/** Base SIP + return used by the auto-generated growth table. */
export const GROWTH_TABLE_BASE_SIP = 10_000;
export const GROWTH_TABLE_RETURN_PCT = 12;
export const GROWTH_TABLE_DURATIONS = [10, 20, 30] as const;

/**
 * Engine-generated "how a ₹10,000 SIP grows" table: final corpus for a normal
 * SIP and 5% / 10% / 15% step-up SIPs over 10, 20 and 30 years.
 */
export function buildStepUpGrowthTable(): StepUpGrowthRow[] {
  const base = GROWTH_TABLE_BASE_SIP;
  const r = GROWTH_TABLE_RETURN_PCT;
  return GROWTH_TABLE_DURATIONS.map((years) => ({
    years,
    normal: corpusForStepUpSip(base, r, years, { method: 'percentage', percentage: 0, amount: 0 }),
    pct5: corpusForStepUpSip(base, r, years, { method: 'percentage', percentage: 5, amount: 0 }),
    pct10: corpusForStepUpSip(base, r, years, { method: 'percentage', percentage: 10, amount: 0 }),
    pct15: corpusForStepUpSip(base, r, years, { method: 'percentage', percentage: 15, amount: 0 }),
  }));
}

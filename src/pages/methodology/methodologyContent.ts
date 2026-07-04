/**
 * Content + structured data for the /calculator-methodology page: SEO metadata,
 * methodology sections (each with a body and optional bullet points),
 * Breadcrumb JSON-LD, and internal links.
 */

export const METHODOLOGY_META = {
  title: 'Calculator Methodology | ArthVeda Wealth Studio',
  description:
    'Understand the financial formulas, assumptions, and methodologies behind every calculator ' +
    'on ArthVeda Wealth Studio including SIP, Retirement, SWP, FIRE, Lumpsum, and SIP vs ' +
    'Step-Up SIP.',
  canonical: 'https://arthvedawealth.in/calculator-methodology',
} as const;

export const METHODOLOGY_INTRO =
  'Every ArthVeda calculator is built using standard financial mathematics and is intended for ' +
  'planning and educational purposes. The underlying projection engine is consistent across all ' +
  'calculators — each simply exposes different inputs and outputs suited to its purpose.';

export const METHODOLOGY_WEBSITE = 'https://arthvedawealth.in';

export const METHODOLOGY_LAST_UPDATED = 'July 2026';

/** A methodology section: a title, an explanatory body, and optional bullet points. */
export interface MethodologySection {
  number: number;
  title: string;
  body: string;
  points?: string[];
}

export const METHODOLOGY_SECTIONS: MethodologySection[] = [
  {
    number: 1,
    title: 'SIP Calculator',
    body:
      'The SIP (Systematic Investment Plan) Calculator projects the future value of regular ' +
      'monthly contributions that compound over time. It uses the following inputs and concepts:',
    points: [
      'Monthly SIP — the fixed amount invested each month',
      'Expected annual return — the assumed rate of growth per year',
      'Compounding frequency — returns are compounded monthly',
      'Investment duration — the total number of years contributions are made',
      'Step-Up SIP — an optional annual increase in the monthly contribution',
      'Future value calculation — the projected corpus at the end of the horizon',
    ],
  },
  {
    number: 2,
    title: 'SIP vs Step-Up SIP',
    body:
      'This comparison tool models two contribution strategies side by side under identical ' +
      'return and duration assumptions, so you can see the impact of escalating your investment ' +
      'over time:',
    points: [
      'Constant SIP — a flat monthly contribution held steady for the full duration',
      'Increasing SIP — a contribution that grows each year',
      'Annual percentage step-up — the SIP rises by a fixed percentage every year',
      'Fixed annual amount step-up — the SIP rises by a fixed rupee amount every year',
    ],
  },
  {
    number: 3,
    title: 'Lumpsum Calculator',
    body:
      'The Lumpsum Calculator projects the growth of a single one-time investment that compounds ' +
      'over the investment horizon. There is no recurring SIP contribution in this model:',
    points: [
      'One-time investment — a single amount invested at the start',
      'Compound annual growth — the investment grows at the assumed return, compounded monthly',
      'Future value — the projected corpus at the end of the duration',
    ],
  },
  {
    number: 4,
    title: 'SWP Calculator',
    body:
      'The SWP (Systematic Withdrawal Plan) Calculator models drawing a regular income from an ' +
      'existing corpus while the remaining balance continues to grow. Sustainability depends on ' +
      'the relationship between the withdrawal rate and the investment return:',
    points: [
      'Initial investment — the starting corpus you withdraw from',
      'Withdrawal frequency — withdrawals are modelled monthly',
      'Monthly withdrawal — the fixed amount withdrawn each month',
      'Portfolio growth after withdrawals — the remaining balance compounds each month',
      'Remaining corpus — the balance left at the end of the term',
    ],
  },
  {
    number: 5,
    title: 'Retirement Calculator',
    body:
      'The Retirement Calculator estimates the corpus you need to accumulate by retirement and ' +
      'whether your planned income is sustainable. It considers both the accumulation and ' +
      'drawdown phases using the following inputs:',
    points: [
      'Current age and retirement age — the length of the accumulation phase',
      'Expected return — the assumed growth rate during accumulation and drawdown',
      'Inflation — used to express future needs in realistic terms',
      'Existing investments — any corpus you have already built',
      'Monthly investments — ongoing contributions until retirement',
      'Target retirement income — the monthly income you wish to draw in retirement',
    ],
  },
  {
    number: 6,
    title: 'FIRE Calculator',
    body:
      'The FIRE (Financial Independence, Retire Early) Calculator estimates the corpus required ' +
      'to achieve financial independence and whether you are on track to reach it. The core idea ' +
      'is the FIRE Number — the corpus at which your investments can sustainably fund your annual ' +
      'expenses:',
    points: [
      'Annual expenses — your expected yearly spending',
      'Safe Withdrawal Rate (SWR) — the percentage of the corpus withdrawn annually',
      'FIRE Number — annual expenses divided by the safe withdrawal rate',
      'Existing investments — your current accumulated corpus',
      'Monthly investments — ongoing contributions toward the FIRE Number',
      'Expected return — the assumed growth rate of your investments',
      'Inflation — used to adjust future expenses and the required corpus',
    ],
  },
  {
    number: 7,
    title: 'Inflation',
    body:
      'Inflation erodes the purchasing power of money over time — a given sum buys less in the ' +
      'future than it does today. Where enabled, our calculators express future values in ' +
      "today's purchasing power (real terms) by discounting projected amounts at the assumed " +
      'inflation rate. This helps you understand what your future corpus is genuinely worth ' +
      'rather than just its nominal figure.',
  },
  {
    number: 8,
    title: 'Expected Return',
    body:
      'The expected return is an assumption you provide, not a guarantee. Actual investment ' +
      'returns vary year to year based on market performance, asset allocation, fees and taxes. ' +
      'Many long-term investors model conservative and optimistic scenarios to understand a range ' +
      'of possible outcomes. Small changes in the assumed return can have a large effect on ' +
      'long-horizon projections due to compounding.',
  },
  {
    number: 9,
    title: 'Important Assumptions',
    body:
      'Our calculators are educational planning tools designed to illustrate how compounding, ' +
      'contributions and withdrawals interact over time. They are subject to important ' +
      'limitations:',
    points: [
      'They do not predict markets or future performance',
      'They do not guarantee returns of any kind',
      'They are educational planning tools, not investment advice',
      'Actual outcomes will differ from these illustrative projections',
    ],
  },
];

/** Internal links rendered at the bottom of the page. */
export interface MethodologyInternalLink {
  href: string;
  label: string;
  description: string;
}

export const METHODOLOGY_INTERNAL_LINKS: MethodologyInternalLink[] = [
  {
    href: '/sip-calculator',
    label: 'SIP Calculator',
    description: 'Project a monthly SIP with an optional annual step-up and inflation.',
  },
  {
    href: '/sip-vs-stepup-sip-calculator',
    label: 'SIP vs Step-Up SIP',
    description: 'Compare a normal SIP against a step-up SIP and see the extra wealth created.',
  },
  {
    href: '/retirement-calculator',
    label: 'Retirement Calculator',
    description: 'Plan the corpus you need to retire and the income it can sustain.',
  },
  {
    href: '/swp-calculator',
    label: 'SWP Calculator',
    description: 'Model a Systematic Withdrawal Plan and a steady monthly income.',
  },
  {
    href: '/fire-calculator',
    label: 'FIRE Calculator',
    description: 'Estimate your path to Financial Independence, Retire Early.',
  },
  {
    href: '/lumpsum-calculator',
    label: 'Lumpsum Calculator',
    description: 'Project the long-term growth of a one-time investment.',
  },
  {
    href: '/editorial-policy',
    label: 'Editorial Policy',
    description: 'How we research, create, review and update our content.',
  },
  {
    href: '/disclaimer',
    label: 'Disclaimer',
    description: 'Understand the limitations of our financial calculators and projections.',
  },
  {
    href: '/contact-us',
    label: 'Contact Us',
    description: 'Get in touch for feedback, support, or partnership enquiries.',
  },
];

/** BreadcrumbList JSON-LD. */
export function buildMethodologyBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: METHODOLOGY_WEBSITE,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Calculator Methodology',
        item: METHODOLOGY_META.canonical,
      },
    ],
  });
}

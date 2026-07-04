/**
 * Content + structured data for the /why-trust-our-calculators page: SEO
 * metadata, trust sections (each with a body and optional bullet points),
 * Breadcrumb JSON-LD, and internal links.
 */

export const TRUST_META = {
  title: 'Why You Can Trust Our Calculators | ArthVeda Wealth Studio',
  description:
    'Learn how ArthVeda Wealth Studio builds transparent, consistent, and reliable financial ' +
    'calculators using standard financial formulas and clearly explained assumptions.',
  canonical: 'https://arthvedawealth.in/why-trust-our-calculators',
} as const;

export const TRUST_INTRO =
  'ArthVeda Wealth Studio is committed to providing transparent financial planning tools that ' +
  'help you estimate future outcomes based on your own assumptions. This page explains the ' +
  'principles that make our calculators reliable, consistent and trustworthy.';

export const TRUST_WEBSITE = 'https://arthvedawealth.in';

export const TRUST_LAST_UPDATED = 'July 2026';

/** A trust section: a title, an explanatory body, and optional bullet points. */
export interface TrustSection {
  number: number;
  title: string;
  body: string;
  points?: string[];
}

export const TRUST_SECTIONS: TrustSection[] = [
  {
    number: 1,
    title: 'Standard Financial Formulas',
    body:
      'Our calculators are built using widely accepted financial mathematics — the same formulas ' +
      'used across the financial planning industry. Nothing is proprietary or hidden:',
    points: [
      'Compound Interest',
      'SIP Future Value',
      'SWP (Systematic Withdrawal Plan) calculations',
      'Retirement corpus estimation',
      'Inflation-adjusted purchasing power',
      'FIRE (Financial Independence) calculations',
    ],
  },
  {
    number: 2,
    title: 'Transparent Assumptions',
    body:
      'Every calculator clearly shows the assumptions that drive its results, so there are no ' +
      'black boxes. You remain in full control of every input:',
    points: [
      'Expected return',
      'Inflation',
      'Investment period',
      'Monthly contribution',
      'Withdrawal assumptions',
    ],
  },
  {
    number: 3,
    title: 'Consistent Projection Engine',
    body:
      'All ArthVeda calculators are powered by the same underlying projection engine. This ' +
      'ensures your results are consistent across tools — a SIP projection and a retirement ' +
      'projection use identical compounding logic — while each calculator exposes the specific ' +
      'inputs relevant to its financial goal.',
  },
  {
    number: 4,
    title: 'Educational Purpose',
    body:
      'Our calculators are designed to help you understand financial concepts and support your ' +
      'planning — not to predict future market performance. They illustrate how contributions, ' +
      'compounding, inflation and withdrawals interact over time, giving you a clear planning ' +
      'baseline rather than a forecast.',
  },
  {
    number: 5,
    title: 'No Hidden Manipulation',
    body:
      'Calculations are generated automatically based solely on the inputs you provide. Results ' +
      'are never influenced by advertisements, partnerships, sponsorships, or affiliate ' +
      'relationships. The number you see is the pure mathematical outcome of your assumptions — ' +
      'nothing more, nothing less.',
  },
  {
    number: 6,
    title: 'Continuous Improvement',
    body:
      'We periodically review and update our calculators to improve usability, accuracy and ' +
      'transparency. As financial regulations evolve and we receive user feedback, we refine the ' +
      'tools so they remain dependable and easy to understand.',
  },
  {
    number: 7,
    title: 'Your Responsibility',
    body:
      'While our calculators provide a helpful planning framework, investment decisions should ' +
      'always consider your personal financial circumstances, risk tolerance, and goals. We ' +
      'encourage you to seek professional advice from a qualified financial advisor where ' +
      'appropriate before acting on any projection.',
  },
];

/** Internal links rendered at the bottom of the page. */
export interface TrustInternalLink {
  href: string;
  label: string;
  description: string;
}

export const TRUST_INTERNAL_LINKS: TrustInternalLink[] = [
  {
    href: '/calculator-methodology',
    label: 'Calculator Methodology',
    description: 'The formulas and assumptions behind every ArthVeda calculator.',
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
  {
    href: '/sip-calculator',
    label: 'SIP Calculator',
    description: 'Project a monthly SIP with an optional annual step-up and inflation.',
  },
  {
    href: '/retirement-calculator',
    label: 'Retirement Calculator',
    description: 'Plan the corpus you need to retire and the income it can sustain.',
  },
  {
    href: '/fire-calculator',
    label: 'FIRE Calculator',
    description: 'Estimate your path to Financial Independence, Retire Early.',
  },
  {
    href: '/swp-calculator',
    label: 'SWP Calculator',
    description: 'Model a Systematic Withdrawal Plan and a steady monthly income.',
  },
  {
    href: '/lumpsum-calculator',
    label: 'Lumpsum Calculator',
    description: 'Project the long-term growth of a one-time investment.',
  },
  {
    href: '/sip-vs-stepup-sip-calculator',
    label: 'SIP vs Step-Up SIP Calculator',
    description: 'Compare a normal SIP against a step-up SIP and see the extra wealth created.',
  },
];

/** BreadcrumbList JSON-LD. */
export function buildTrustBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: TRUST_WEBSITE,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Why You Can Trust Our Calculators',
        item: TRUST_META.canonical,
      },
    ],
  });
}

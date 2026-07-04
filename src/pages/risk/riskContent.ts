/**
 * Content + structured data for the /risk-disclosure page: SEO metadata,
 * risk sections (each with a body and optional bullet points), Breadcrumb
 * JSON-LD, and internal links.
 */

export const RISK_META = {
  title: 'Risk Disclosure | ArthVeda Wealth Studio',
  description:
    'Understand the investment risks, assumptions, and limitations associated with using the ' +
    'financial calculators and educational content on ArthVeda Wealth Studio.',
  canonical: 'https://arthvedawealth.in/risk-disclosure',
} as const;

export const RISK_INTRO =
  'Investing always involves risk. The calculators and educational content on ArthVeda Wealth ' +
  'Studio are designed to support your financial planning — not to predict actual investment ' +
  'outcomes. This Risk Disclosure explains the key risks, assumptions and limitations you ' +
  'should keep in mind when using our tools.';

export const RISK_WEBSITE = 'https://arthvedawealth.in';

export const RISK_LAST_UPDATED = 'July 2026';

/** A risk section: a title, an explanatory body, and optional bullet points. */
export interface RiskSection {
  number: number;
  title: string;
  body: string;
  points?: string[];
}

export const RISK_SECTIONS: RiskSection[] = [
  {
    number: 1,
    title: 'Investment Risk',
    body:
      'All investments carry risk, and the value of your investments can go down as well as up. ' +
      'Before relying on any projection, it is important to understand the following:',
    points: [
      'Mutual funds are subject to market risk',
      'Equity investments can fluctuate in value',
      'Past performance does not guarantee future returns',
      'Future returns cannot be predicted with certainty',
    ],
  },
  {
    number: 2,
    title: 'Expected Returns',
    body:
      'The expected return used in every calculator is an assumption that you provide — it is not ' +
      'a forecast or a promise. Actual investment performance may be higher or lower than the ' +
      'rate you enter, and even small differences in the assumed return can significantly change ' +
      'long-horizon projections because of compounding. We encourage you to model conservative ' +
      'and optimistic scenarios to understand a realistic range of outcomes.',
  },
  {
    number: 3,
    title: 'Inflation Risk',
    body:
      'Inflation erodes the purchasing power of money over time, and it also increases your ' +
      'future expenses. A corpus that appears large in nominal terms may be worth considerably ' +
      'less in real terms once inflation is accounted for. The inflation figures used in our ' +
      'calculators are estimates — actual inflation will vary year to year and may differ ' +
      'materially from your assumptions.',
  },
  {
    number: 4,
    title: 'Sequence of Returns Risk',
    body:
      'The order in which investment returns occur can materially affect outcomes, particularly ' +
      'during the withdrawal phase. Poor returns early in retirement — while you are drawing down ' +
      'your corpus — can permanently reduce how long your money lasts, even if average returns ' +
      'over the full period are healthy. This "sequence of returns risk" is especially relevant ' +
      'to SWP and retirement planning, where our calculators assume steady returns that real ' +
      'markets rarely deliver.',
  },
  {
    number: 5,
    title: 'FIRE Planning Risk',
    body:
      'The FIRE Number produced by our calculator is based entirely on the assumptions you ' +
      'provide. Changing any single assumption changes the result — sometimes substantially:',
    points: [
      'Annual expenses',
      'Safe withdrawal rate',
      'Expected investment returns',
      'Inflation',
    ],
  },
  {
    number: 6,
    title: 'Calculator Limitations',
    body:
      'Our calculators are educational planning tools with important limitations. They:',
    points: [
      'cannot predict markets or future performance',
      'cannot replace professional financial advice',
      'cannot account for every tax or investment situation',
      'should be used only as educational planning tools',
    ],
  },
  {
    number: 7,
    title: 'User Responsibility',
    body:
      'You remain solely responsible for all of your investment decisions. Projections generated ' +
      'by our calculators are illustrative and should be considered a planning baseline rather ' +
      'than advice. We strongly encourage you to consult qualified financial professionals — such ' +
      'as a SEBI-registered investment advisor, certified financial planner, or chartered ' +
      'accountant — before acting on any projection or making financial commitments.',
  },
];

/** Internal links rendered at the bottom of the page. */
export interface RiskInternalLink {
  href: string;
  label: string;
  description: string;
}

export const RISK_INTERNAL_LINKS: RiskInternalLink[] = [
  {
    href: '/disclaimer',
    label: 'Disclaimer',
    description: 'Understand the limitations of our financial calculators and projections.',
  },
  {
    href: '/editorial-policy',
    label: 'Editorial Policy',
    description: 'How we research, create, review and update our content.',
  },
  {
    href: '/calculator-methodology',
    label: 'Calculator Methodology',
    description: 'The formulas and assumptions behind every ArthVeda calculator.',
  },
  {
    href: '/why-trust-our-calculators',
    label: 'Why You Can Trust Our Calculators',
    description: 'How we build transparent, consistent and reliable financial tools.',
  },
  {
    href: '/contact-us',
    label: 'Contact Us',
    description: 'Get in touch for feedback, support, or partnership enquiries.',
  },
];

/** BreadcrumbList JSON-LD. */
export function buildRiskBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: RISK_WEBSITE,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Risk Disclosure',
        item: RISK_META.canonical,
      },
    ],
  });
}

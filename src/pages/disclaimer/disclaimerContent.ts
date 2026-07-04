/**
 * Content + structured data for the /disclaimer page: SEO metadata,
 * disclaimer sections, WebPage JSON-LD, Breadcrumb JSON-LD, and internal links.
 */

export const DISCLAIMER_META = {
  title: 'Disclaimer | ArthVeda Wealth Studio',
  description:
    'Read the disclaimer for ArthVeda Wealth Studio. Understand the limitations of our ' +
    'financial calculators, projections and educational content.',
  canonical: 'https://arthvedawealth.in/disclaimer',
} as const;

export const DISCLAIMER_INTRO =
  'Please read this disclaimer carefully before relying on any financial projections ' +
  'provided by ArthVeda Wealth Studio.';

export const DISCLAIMER_EMAIL = 'info@arthvedawealth.in';
export const DISCLAIMER_WEBSITE = 'https://arthvedawealth.in';

export const DISCLAIMER_LAST_UPDATED = 'July 2026';

/** Structured disclaimer sections. */
export interface DisclaimerSection {
  number: number;
  title: string;
  body: string;
}

export const DISCLAIMER_SECTIONS: DisclaimerSection[] = [
  {
    number: 1,
    title: 'Educational Purpose',
    body:
      'Every calculator, projection tool and article on ArthVeda Wealth Studio is provided ' +
      'solely for educational, informational and financial planning purposes. The content is ' +
      'designed to help users understand compounding, wealth accumulation and retirement planning ' +
      'concepts. It is not intended to replace professional financial guidance.',
  },
  {
    number: 2,
    title: 'Not Financial Advice',
    body:
      'ArthVeda is NOT a SEBI-registered investment advisor, research analyst, portfolio manager ' +
      'or financial planner. Nothing on this website should be interpreted as investment advice, ' +
      'financial advice, tax advice or legal advice. Users should always consult qualified ' +
      'professionals — such as a certified financial planner, chartered accountant or SEBI-registered ' +
      'investment advisor — before making any financial or investment decisions.',
  },
  {
    number: 3,
    title: 'Projection Accuracy',
    body:
      'All calculator outputs are based entirely on user-provided inputs and mathematical ' +
      'assumptions such as a constant annual return rate and monthly compounding. Actual ' +
      'investment returns will differ due to market performance, inflation variability, taxes ' +
      'and applicable charges, investment timing, government regulations, and prevailing economic ' +
      'conditions. Projections are illustrative estimates, not predictions.',
  },
  {
    number: 4,
    title: 'No Guarantee',
    body:
      'ArthVeda makes no guarantee, warranty or representation — express or implied — regarding ' +
      'future returns, investment performance, achievement of financial goals, retirement corpus ' +
      'adequacy, FIRE date accuracy, or withdrawal sustainability. All projections are hypothetical ' +
      'illustrations that assume idealised conditions which may not reflect reality.',
  },
  {
    number: 5,
    title: 'Investment Risk',
    body:
      'All investments carry risk. Mutual funds, equities, debt instruments and other financial ' +
      'products may lose value. Past performance does not guarantee future results. The value of ' +
      'investments can go down as well as up, and investors may not receive back the full amount ' +
      'invested. Users should assess their own risk tolerance before investing.',
  },
  {
    number: 6,
    title: 'External Websites',
    body:
      'ArthVeda may provide links to third-party websites, services or resources for informational ' +
      'purposes. We do not control, endorse or assume responsibility for the content, privacy ' +
      'practices, accuracy or availability of any third-party website. Visiting external links is ' +
      'entirely at your own risk.',
  },
  {
    number: 7,
    title: 'Limitation of Liability',
    body:
      'To the fullest extent permitted by applicable law, ArthVeda and its creators shall not be ' +
      'liable for any direct, indirect, incidental, consequential, special or exemplary damages — ' +
      'including financial loss, loss of profit, or loss of opportunity — arising from or in ' +
      'connection with your use of this website, reliance on calculator outputs, or inability to ' +
      'access the service.',
  },
  {
    number: 8,
    title: 'Google AdSense',
    body:
      'This website may display advertisements served through Google AdSense or similar ' +
      'advertising networks. The presence of an advertisement does not constitute endorsement, ' +
      'recommendation or approval of the advertised product, service or company by ArthVeda. ' +
      'Users should independently evaluate any advertised product before making a purchase or ' +
      'investment decision.',
  },
  {
    number: 9,
    title: 'Changes',
    body:
      'This Disclaimer may be updated or modified periodically without prior notice. Continued ' +
      'use of the website after any changes constitutes acceptance of the revised disclaimer. ' +
      'We encourage you to review this page from time to time.',
  },
];

/** Internal links rendered at the bottom of the page. */
export interface DisclaimerInternalLink {
  href: string;
  label: string;
  description: string;
}

export const DISCLAIMER_INTERNAL_LINKS: DisclaimerInternalLink[] = [
  {
    href: '/about-us',
    label: 'About Us',
    description: 'Learn about ArthVeda and our mission to simplify wealth planning.',
  },
  {
    href: '/contact-us',
    label: 'Contact Us',
    description: 'Get in touch for feedback, support, or partnership enquiries.',
  },
  {
    href: '/privacy-policy',
    label: 'Privacy Policy',
    description: 'Understand how we collect, use and protect your information.',
  },
  {
    href: '/terms-and-conditions',
    label: 'Terms & Conditions',
    description: 'Read the terms governing the use of ArthVeda Wealth Studio.',
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
    href: '/fire-calculator',
    label: 'FIRE Calculator',
    description: 'Estimate your path to Financial Independence, Retire Early.',
  },
];

/** WebPage JSON-LD. */
export function buildDisclaimerWebPageJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Disclaimer',
    url: DISCLAIMER_META.canonical,
    description: DISCLAIMER_META.description,
    isPartOf: {
      '@type': 'WebSite',
      name: 'ArthVeda Wealth Studio',
      url: DISCLAIMER_WEBSITE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ArthVeda',
      url: DISCLAIMER_WEBSITE,
      email: DISCLAIMER_EMAIL,
    },
  });
}

/** BreadcrumbList JSON-LD. */
export function buildDisclaimerBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: DISCLAIMER_WEBSITE,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Disclaimer',
        item: DISCLAIMER_META.canonical,
      },
    ],
  });
}

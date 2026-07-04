/**
 * Content + structured data for the /terms-and-conditions page: SEO metadata,
 * terms sections, WebPage JSON-LD, Breadcrumb JSON-LD, and internal links.
 */

export const TERMS_META = {
  title: 'Terms & Conditions | ArthVeda Wealth Studio',
  description:
    'Read the Terms & Conditions governing the use of ArthVeda Wealth Studio and its ' +
    'financial planning calculators.',
  canonical: 'https://arthvedawealth.in/terms-and-conditions',
} as const;

export const TERMS_INTRO =
  'Please read these terms carefully before using ArthVeda Wealth Studio.';

export const TERMS_EMAIL = 'info@arthvedawealth.in';
export const TERMS_WEBSITE = 'https://arthvedawealth.in';

export const TERMS_LAST_UPDATED = 'July 2026';

/** Structured terms sections. */
export interface TermsSection {
  number: number;
  title: string;
  body: string;
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    number: 1,
    title: 'Acceptance of Terms',
    body:
      'By accessing or using the ArthVeda Wealth Studio website, its calculators, tools and ' +
      'content, you agree to be bound by these Terms & Conditions. If you do not agree with any ' +
      'part of these terms, you should not use the website.',
  },
  {
    number: 2,
    title: 'Educational Purpose',
    body:
      'All calculators and projection tools provided by ArthVeda are intended solely for ' +
      'educational and financial planning purposes. They produce illustrative projections based ' +
      'on the assumptions you provide. They are NOT investment advice, a recommendation, or a ' +
      'guarantee of future results.',
  },
  {
    number: 3,
    title: 'No Financial Advice',
    body:
      'ArthVeda is not a SEBI-registered investment advisor, research analyst, or portfolio ' +
      'manager. The information and tools on this website do not constitute financial, investment, ' +
      'tax, or legal advice. Users should consult qualified financial professionals before making ' +
      'any investment decisions.',
  },
  {
    number: 4,
    title: 'Calculator Accuracy',
    body:
      'Calculator results are mathematical estimates based on user-provided inputs and constant ' +
      'assumptions (such as a fixed annual return rate and monthly compounding). Actual investment ' +
      'returns will differ due to market volatility, fees, taxes, inflation variations, and other ' +
      'real-world factors. ArthVeda does not guarantee the accuracy or completeness of any ' +
      'projection.',
  },
  {
    number: 5,
    title: 'User Responsibilities',
    body:
      'Users are responsible for the accuracy of the information they enter into our calculators. ' +
      'You agree to use the website and its tools for lawful purposes only and in accordance with ' +
      'these Terms. You shall not attempt to reverse-engineer, copy, or misuse any part of the ' +
      'platform.',
  },
  {
    number: 6,
    title: 'Intellectual Property',
    body:
      'All content, branding, calculators, design, source code, and software on this website are ' +
      'the intellectual property of ArthVeda and are protected by applicable copyright and ' +
      'trademark laws. No part of this website may be copied, reproduced, distributed, or ' +
      'republished without prior written permission from ArthVeda.',
  },
  {
    number: 7,
    title: 'External Links',
    body:
      'ArthVeda may contain links to third-party websites or services that are not owned or ' +
      'controlled by us. We are not responsible for the content, privacy practices, or ' +
      'availability of any third-party websites. Accessing external links is at your own risk.',
  },
  {
    number: 8,
    title: 'Limitation of Liability',
    body:
      'To the fullest extent permitted by law, ArthVeda shall not be liable for any direct, ' +
      'indirect, incidental, consequential, or special damages, including financial loss, arising ' +
      'from or in connection with your use of the website, reliance on calculator outputs, or ' +
      'inability to access the service.',
  },
  {
    number: 9,
    title: 'Changes to Terms',
    body:
      'ArthVeda reserves the right to modify or update these Terms & Conditions at any time ' +
      'without prior notice. Continued use of the website after any changes constitutes ' +
      'acceptance of the revised terms. We encourage you to review this page periodically.',
  },
];

/** Internal links rendered at the bottom of the page. */
export interface TermsInternalLink {
  href: string;
  label: string;
  description: string;
}

export const TERMS_INTERNAL_LINKS: TermsInternalLink[] = [
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
export function buildTermsWebPageJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms & Conditions',
    url: TERMS_META.canonical,
    description: TERMS_META.description,
    isPartOf: {
      '@type': 'WebSite',
      name: 'ArthVeda Wealth Studio',
      url: TERMS_WEBSITE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ArthVeda',
      url: TERMS_WEBSITE,
      email: TERMS_EMAIL,
    },
  });
}

/** BreadcrumbList JSON-LD. */
export function buildTermsBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: TERMS_WEBSITE,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Terms & Conditions',
        item: TERMS_META.canonical,
      },
    ],
  });
}

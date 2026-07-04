/**
 * Content + structured data for the /editorial-policy page: SEO metadata,
 * policy sections, Breadcrumb JSON-LD, and internal links.
 */

export const EDITORIAL_META = {
  title: 'Editorial Policy | ArthVeda Wealth Studio',
  description:
    'Learn how ArthVeda Wealth Studio researches, creates, reviews, and updates financial ' +
    'education content and calculator methodologies.',
  canonical: 'https://arthvedawealth.in/editorial-policy',
} as const;

export const EDITORIAL_INTRO =
  'At ArthVeda Wealth Studio, we are committed to providing accurate, transparent and ' +
  'educational financial content. This Editorial Policy explains how we research, create, ' +
  'review and update our calculators and educational resources.';

export const EDITORIAL_WEBSITE = 'https://arthvedawealth.in';

export const EDITORIAL_LAST_UPDATED = 'July 2026';

/** Structured editorial policy sections. */
export interface EditorialSection {
  number: number;
  title: string;
  body: string;
}

export const EDITORIAL_SECTIONS: EditorialSection[] = [
  {
    number: 1,
    title: 'Our Mission',
    body:
      'ArthVeda Wealth Studio exists to help Indian investors make informed financial decisions ' +
      'through calculators, educational resources, and practical financial planning tools. Our ' +
      'goal is to demystify long-term wealth creation, retirement planning, and financial ' +
      'independence by making institutional-grade projection tools accessible to everyone.',
  },
  {
    number: 2,
    title: 'Content Principles',
    body:
      'All content on ArthVeda is written to be accurate, educational, practical, transparent, ' +
      'and easy to understand. We aim to present complex financial concepts in clear, jargon-free ' +
      'language while maintaining technical rigour. Our content is intended purely for educational ' +
      'purposes and should not be considered personal financial advice. Users should always ' +
      'consult qualified financial professionals before making investment decisions.',
  },
  {
    number: 3,
    title: 'Research Process',
    body:
      'Articles and calculator methodologies are prepared using information from reliable public ' +
      'sources including the Reserve Bank of India (RBI), Securities and Exchange Board of India ' +
      '(SEBI), Association of Mutual Funds in India (AMFI), Government of India publications, ' +
      'Income Tax rules and regulations, and publicly available financial data. Information is ' +
      'periodically reviewed to ensure it remains current and reflects any regulatory changes.',
  },
  {
    number: 4,
    title: 'Calculator Methodology',
    body:
      'Our calculators are based on widely accepted financial formulas including compound interest, ' +
      'SIP future value, Systematic Withdrawal Plan (SWP) calculations, inflation-adjusted ' +
      'projections, and retirement corpus estimation. All calculations use monthly compounding ' +
      'with user-provided assumptions. Results are mathematical estimates — actual investment ' +
      'returns will vary due to market conditions, fees, taxes, and other real-world factors.',
  },
  {
    number: 5,
    title: 'Content Updates',
    body:
      'Financial regulations, tax rules, and market conditions change over time. We review and ' +
      'update our content and calculator methodologies whenever important changes occur. Each page ' +
      'displays a "Last Updated" date so users can assess the currency of the information. If you ' +
      'notice outdated information, please report it via our Contact Us page.',
  },
  {
    number: 6,
    title: 'Independence',
    body:
      'Editorial decisions at ArthVeda are made independently. Our calculator results, ' +
      'educational content, and financial illustrations are never influenced by commercial ' +
      'relationships. If advertisements, affiliate links, or sponsorships are introduced in ' +
      'the future, they will never influence calculator results or educational content. Any ' +
      'sponsored or promotional content will always be clearly labelled as such.',
  },
  {
    number: 7,
    title: 'Accuracy',
    body:
      'While every effort is made to maintain the accuracy of our content and calculators, no ' +
      'guarantee can be provided regarding the completeness or correctness of any information. ' +
      'Financial markets are inherently uncertain, and projections are illustrative by nature. ' +
      'Users should always verify financial decisions with qualified professionals such as ' +
      'SEBI-registered investment advisors, certified financial planners, or chartered accountants.',
  },
  {
    number: 8,
    title: 'User Feedback',
    body:
      'We welcome feedback from our users. If you find an error in any calculation, notice ' +
      'outdated information, or have suggestions for improvement, please let us know through ' +
      'our Contact Us page. User feedback plays an important role in helping us maintain the ' +
      'quality and accuracy of our platform.',
  },
];

/** Internal links rendered at the bottom of the page. */
export interface EditorialInternalLink {
  href: string;
  label: string;
  description: string;
}

export const EDITORIAL_INTERNAL_LINKS: EditorialInternalLink[] = [
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
    href: '/disclaimer',
    label: 'Disclaimer',
    description: 'Understand the limitations of our financial calculators and projections.',
  },
  {
    href: '/cookie-policy',
    label: 'Cookie Policy',
    description: 'Learn how we use cookies and similar technologies.',
  },
];

/** BreadcrumbList JSON-LD. */
export function buildEditorialBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: EDITORIAL_WEBSITE,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Editorial Policy',
        item: EDITORIAL_META.canonical,
      },
    ],
  });
}

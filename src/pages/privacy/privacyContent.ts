/**
 * Content + structured data for the /privacy-policy page: SEO metadata,
 * policy sections, WebPage JSON-LD, Breadcrumb JSON-LD, and internal links.
 */

export const PRIVACY_META = {
  title: 'Privacy Policy | ArthVeda Wealth Studio',
  description:
    "Read ArthVeda\u2019s Privacy Policy to understand how we collect, use and protect your " +
    'information while using our financial planning calculators.',
  canonical: 'https://arthvedawealth.in/privacy-policy',
} as const;

export const PRIVACY_INTRO =
  'Your privacy matters to us. This Privacy Policy explains how ArthVeda collects, uses and ' +
  'protects information while you use our financial planning tools.';

export const PRIVACY_EMAIL = 'info@arthvedawealth.in';
export const PRIVACY_WEBSITE = 'https://arthvedawealth.in';

export const PRIVACY_LAST_UPDATED = 'July 2026';

/** Information types we may collect. */
export const INFORMATION_COLLECTED: string[] = [
  'Name',
  'Email address',
  'Calculator inputs (voluntarily entered)',
  'Feedback and suggestions',
  'Contact information provided via enquiry',
];

/** How we use collected information. */
export const INFORMATION_USES: string[] = [
  'Improve our calculators and planning tools',
  'Improve website performance and user experience',
  'Respond to enquiries and support requests',
  'Website analytics and usage patterns',
  'Security monitoring and fraud prevention',
];

/** Cookie purposes. */
export const COOKIE_PURPOSES: string[] = [
  'Google Analytics (website traffic and usage)',
  'User preferences (e.g. currency selection)',
  'Website performance monitoring',
  'Future advertising (Google AdSense)',
];

/** Third-party services. */
export interface ThirdPartyService {
  name: string;
  purpose: string;
}

export const THIRD_PARTY_SERVICES: ThirdPartyService[] = [
  { name: 'Google Analytics', purpose: 'Website traffic analysis and usage patterns' },
  { name: 'Google AdSense', purpose: 'Future advertising (not currently active)' },
  { name: 'Vercel', purpose: 'Website hosting and content delivery' },
  { name: 'GitHub', purpose: 'Source code management and deployment' },
];

/** User rights. */
export const USER_RIGHTS: string[] = [
  'Request removal of any personal data',
  'Request corrections to inaccurate information',
  'Raise privacy concerns or questions',
  'Opt out of analytics tracking',
];

/** Internal links rendered at the bottom of the page. */
export interface PrivacyInternalLink {
  href: string;
  label: string;
  description: string;
}

export const PRIVACY_INTERNAL_LINKS: PrivacyInternalLink[] = [
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
export function buildPrivacyWebPageJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy',
    url: PRIVACY_META.canonical,
    description: PRIVACY_META.description,
    isPartOf: {
      '@type': 'WebSite',
      name: 'ArthVeda Wealth Studio',
      url: PRIVACY_WEBSITE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ArthVeda Wealth Studio',
      url: PRIVACY_WEBSITE,
      email: PRIVACY_EMAIL,
    },
  });
}

/** BreadcrumbList JSON-LD. */
export function buildPrivacyBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: PRIVACY_WEBSITE,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Privacy Policy',
        item: PRIVACY_META.canonical,
      },
    ],
  });
}

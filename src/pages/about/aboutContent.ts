/**
 * Content + structured data for the /about-us page: SEO metadata, the
 * Organization JSON-LD, the lead intro, and the "What We Offer" link list.
 */

import { CALCULATORS } from '../../lib/calculators';

export const ABOUT_META = {
  title: 'About ArthVeda | Wealth Planning & Financial Projection Platform',
  description:
    'Learn about ArthVeda, a wealth planning and financial projection platform helping investors ' +
    'plan for retirement, financial independence, SIP investing, and long-term wealth creation.',
  canonical: 'https://arthvedawealth.in/about-us',
} as const;

export const ABOUT_INTRO =
  'A modern wealth planning and financial projection platform — built to help you make informed, ' +
  'long-term decisions about retirement, financial independence, and disciplined investing.';

export const ABOUT_EMAIL = 'info@arthvedawealth.in';
export const ABOUT_WEBSITE = 'https://arthvedawealth.in';

export interface AboutOffering {
  href: string;
  label: string;
  description: string;
}

/** "What We Offer" — the studio plus every calculator, each linking to its page. */
export const ABOUT_OFFERINGS: AboutOffering[] = [
  {
    href: '/',
    label: 'Wealth Studio',
    description: 'Model SIP, lumpsum and SWP together with milestones, charts and a year-by-year ledger.',
  },
  ...CALCULATORS.map((c) => ({ href: c.path, label: c.label, description: c.description })),
];

/** Things ArthVeda explicitly does not provide. */
export const ABOUT_DISCLAIMERS: string[] = [
  'Investment advice',
  'Stock recommendations',
  'Mutual fund recommendations',
  'Portfolio management',
  'Tax advice',
  'Legal advice',
];

/** Organization JSON-LD for the About page. */
export function buildAboutOrganizationJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ArthVeda Wealth Studio',
    url: ABOUT_WEBSITE,
    email: ABOUT_EMAIL,
    logo: 'https://arthvedawealth.in/favicon.svg',
    description:
      'ArthVeda is a wealth planning and financial projection platform that helps individuals ' +
      'visualize their financial future through advanced planning calculators and projection tools.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: ABOUT_EMAIL,
      contactType: 'customer support',
    },
  });
}

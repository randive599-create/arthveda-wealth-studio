/**
 * Content + structured data for the /cookie-policy page: SEO metadata,
 * policy sections, Breadcrumb JSON-LD, and internal links.
 */

export const COOKIE_META = {
  title: 'Cookie Policy | ArthVeda Wealth Studio',
  description:
    'Learn how ArthVeda Wealth Studio uses cookies and similar technologies to improve ' +
    'website functionality, analytics, and user experience.',
  canonical: 'https://arthvedawealth.in/cookie-policy',
} as const;

export const COOKIE_INTRO =
  'This Cookie Policy explains how ArthVeda Wealth Studio uses cookies and similar ' +
  'technologies when you visit our website. It describes what cookies are, the types we use, ' +
  'and how you can manage your preferences.';

export const COOKIE_EMAIL = 'info@arthvedawealth.in';
export const COOKIE_WEBSITE = 'https://arthvedawealth.in';

export const COOKIE_LAST_UPDATED = 'July 2026';

/** Structured cookie policy sections. */
export interface CookieSection {
  number: number;
  title: string;
  body: string;
}

export const COOKIE_SECTIONS: CookieSection[] = [
  {
    number: 1,
    title: 'What Are Cookies',
    body:
      'Cookies are small text files that are placed on your device (computer, tablet or mobile) ' +
      'when you visit a website. They are widely used to make websites work more efficiently, ' +
      'provide a better user experience, and supply information to website operators. Cookies can ' +
      'be "session" cookies (deleted when you close your browser) or "persistent" cookies (remain ' +
      'on your device until they expire or you delete them).',
  },
  {
    number: 2,
    title: 'Types of Cookies We Use',
    body:
      'Essential Cookies: Required for the website to function properly. They enable core ' +
      'features such as page navigation and cannot be disabled. ' +
      'Performance Cookies: Help us understand how visitors interact with the website by ' +
      'collecting anonymous information about page load times and errors. ' +
      'Analytics Cookies: Allow us to measure and analyse website traffic so we can improve ' +
      'content and user experience. These cookies collect aggregated, anonymous data. ' +
      'Functional Cookies: Remember your preferences (such as currency selection or calculator ' +
      'settings) to provide a more personalised experience on return visits.',
  },
  {
    number: 3,
    title: 'Third-Party Services',
    body:
      'We use the following third-party services that may place cookies or similar tracking ' +
      'technologies on your device according to their own privacy policies: ' +
      'Google Analytics (future) — for website traffic analysis and usage patterns. ' +
      'Google AdSense (future) — for displaying relevant advertisements. ' +
      'Vercel Analytics — for page-view tracking and performance monitoring. ' +
      'Vercel Speed Insights — for measuring Core Web Vitals (LCP, CLS, INP, TTFB, FCP). ' +
      'Each service operates under its own privacy and cookie policy. We encourage you to ' +
      'review their respective policies for details on how they use cookies and handle data.',
  },
  {
    number: 4,
    title: 'Managing Cookies',
    body:
      'You can control and manage cookies through your browser settings. Most browsers allow ' +
      'you to: view what cookies are stored and delete them individually or in bulk; block ' +
      'third-party cookies; block all cookies from specific sites; block all cookies from being ' +
      'set; and delete all cookies when you close the browser. Please note that disabling or ' +
      'blocking certain cookies may affect website functionality, and some features may not ' +
      'work as intended. Each browser handles cookie settings differently — consult your ' +
      "browser's help documentation for specific instructions.",
  },
  {
    number: 5,
    title: 'Consent',
    body:
      'By continuing to use the ArthVeda Wealth Studio website, you consent to the use of ' +
      'cookies as described in this Cookie Policy. If you do not agree with our use of cookies, ' +
      'you should adjust your browser settings accordingly or refrain from using the website. ' +
      'Where required by law, we will seek your explicit consent before placing non-essential ' +
      'cookies on your device.',
  },
  {
    number: 6,
    title: 'Updates to This Policy',
    body:
      'We may update this Cookie Policy from time to time to reflect changes in the cookies we ' +
      'use, changes in technology, or for legal, regulatory or operational reasons. Any updates ' +
      'will be posted on this page with a revised "Last Updated" date. We encourage you to ' +
      'review this page periodically to stay informed about our use of cookies.',
  },
  {
    number: 7,
    title: 'Contact',
    body:
      'If you have any questions about this Cookie Policy or how we use cookies, please ' +
      'contact us via our Contact Us page or email us directly at info@arthvedawealth.in.',
  },
];

/** Internal links rendered at the bottom of the page. */
export interface CookieInternalLink {
  href: string;
  label: string;
  description: string;
}

export const COOKIE_INTERNAL_LINKS: CookieInternalLink[] = [
  {
    href: '/privacy-policy',
    label: 'Privacy Policy',
    description: 'Understand how we collect, use and protect your information.',
  },
  {
    href: '/contact-us',
    label: 'Contact Us',
    description: 'Get in touch for feedback, support, or partnership enquiries.',
  },
  {
    href: '/terms-and-conditions',
    label: 'Terms & Conditions',
    description: 'Read the terms governing the use of ArthVeda Wealth Studio.',
  },
  {
    href: '/disclaimer',
    label: 'Disclaimer',
    description: 'Understand the limitations of our financial calculators and projections.',
  },
  {
    href: '/about-us',
    label: 'About Us',
    description: 'Learn about ArthVeda and our mission to simplify wealth planning.',
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
    href: '/fire-calculator',
    label: 'FIRE Calculator',
    description: 'Estimate your path to Financial Independence, Retire Early.',
  },
];

/** BreadcrumbList JSON-LD. */
export function buildCookieBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: COOKIE_WEBSITE,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cookie Policy',
        item: COOKIE_META.canonical,
      },
    ],
  });
}

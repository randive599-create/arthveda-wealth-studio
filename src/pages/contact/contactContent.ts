/**
 * Content + structured data for the /contact-us page: SEO metadata, FAQ entries,
 * ContactPage JSON-LD, Breadcrumb JSON-LD, and internal links.
 */

import type { FaqEntry } from '../../components/faq/faqData';

export const CONTACT_META = {
  title: 'Contact ArthVeda | Wealth Planning Support & Calculator Queries',
  description:
    'Contact ArthVeda for calculator support, feature requests, business partnerships and ' +
    'general enquiries regarding our financial planning tools.',
  canonical: 'https://arthvedawealth.in/contact-us',
} as const;

export const CONTACT_INTRO =
"We\u2019re always happy to hear from you. Whether you have feedback, feature suggestions, " +
  'partnership enquiries or questions about our calculators, feel free to get in touch.';

export const CONTACT_EMAIL = 'info@arthvedawealth.in';
export const CONTACT_WEBSITE = 'https://arthvedawealth.in';

/** Reasons a user might contact ArthVeda. */
export const CONTACT_PURPOSES: string[] = [
  'General enquiries',
  'Calculator feedback',
  'Bug reports',
  'Business partnerships',
  'Media requests',
];

/** Reasons to reach out — the "Why Contact Us?" section. */
export const CONTACT_REASONS: string[] = [
  'Suggest new calculators or planning tools',
  'Report bugs or calculation errors',
  'Request new features or enhancements',
  'Explore business collaborations',
  'Discuss educational partnerships',
  'Share feedback for improving ArthVeda',
];

/** Internal links rendered at the bottom of the page. */
export interface ContactInternalLink {
  href: string;
  label: string;
  description: string;
}

export const CONTACT_INTERNAL_LINKS: ContactInternalLink[] = [
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
  {
    href: '/about-us',
    label: 'About Us',
    description: 'Learn about ArthVeda and our mission to simplify wealth planning.',
  },
];

/** 10 FAQ entries for the Contact page. */
export const CONTACT_FAQ: FaqEntry[] = [
  {
    question: 'How quickly do you respond to enquiries?',
    answer:
      'We aim to respond to all enquiries within 24–48 business hours. Complex technical ' +
      'questions or partnership proposals may take slightly longer as we ensure a thorough reply.',
  },
  {
    question: 'Can I request a new calculator?',
    answer:
      'Absolutely. We welcome suggestions for new calculators and planning tools. Send us your ' +
      'idea with a brief description of the use case and we will evaluate it for our roadmap.',
  },
  {
    question: 'Can I report a calculation error or bug?',
    answer:
      'Yes, please do. If you notice an unexpected result or a UI issue, email us with the ' +
      'inputs you used and the output you expected. Screenshots or the shared scenario URL are ' +
      'especially helpful for reproducing the issue quickly.',
  },
  {
    question: 'Do you provide investment advice?',
    answer:
      'No. ArthVeda is an educational and financial planning platform. Our calculators produce ' +
      'illustrative projections based on the assumptions you provide. We do not recommend ' +
      'specific investments, mutual funds, stocks, or portfolio allocations. Please consult a ' +
      'qualified financial advisor for personalised guidance.',
  },
  {
    question: 'Can financial advisors or planners collaborate with ArthVeda?',
    answer:
      'We are open to collaborations with financial advisors, planners, and educators who share ' +
      'our commitment to transparent, long-term wealth planning. Reach out with details of how ' +
      'you envision working together.',
  },
  {
    question: 'Can I suggest a new feature for an existing calculator?',
    answer:
      'Of course. Feature suggestions help us improve the platform for everyone. Describe the ' +
      'feature, how you would use it, and why it matters to your planning workflow.',
  },
  {
    question: 'Is my data stored when I use the calculators?',
    answer:
      'No. All calculations run entirely in your browser. Your inputs are never sent to or ' +
      'stored on a server. Shared scenario links encode data in the URL itself — no backend ' +
      'storage is involved.',
  },
  {
    question: 'Can I use ArthVeda calculators for educational purposes?',
    answer:
      'Yes. Our tools are well-suited for financial literacy workshops, classroom demonstrations, ' +
      'and personal finance courses. If you need specific support for educational use, get in touch.',
  },
  {
    question: 'Do you offer an API or embeddable widget?',
    answer:
      'Not at present. If you have a specific integration need — such as embedding a calculator ' +
      'on your website — contact us to discuss possibilities.',
  },
  {
    question: 'How can media or press reach ArthVeda?',
    answer:
      'Media enquiries can be directed to the same email address. Please include the publication ' +
      'name, the nature of your query, and your deadline so we can respond promptly.',
  },
];

/** FAQPage JSON-LD for the Contact page, built from CONTACT_FAQ. */
export function buildContactFaqJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CONTACT_FAQ.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  });
}

/** ContactPage JSON-LD. */
export function buildContactPageJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact ArthVeda',
    url: CONTACT_META.canonical,
    description: CONTACT_META.description,
    mainEntity: {
      '@type': 'Organization',
      name: 'ArthVeda',
      url: CONTACT_WEBSITE,
      email: CONTACT_EMAIL,
      contactPoint: {
        '@type': 'ContactPoint',
        email: CONTACT_EMAIL,
        contactType: 'customer support',
        availableLanguage: ['English', 'Hindi'],
      },
    },
  });
}

/** BreadcrumbList JSON-LD. */
export function buildContactBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: CONTACT_WEBSITE,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contact Us',
        item: CONTACT_META.canonical,
      },
    ],
  });
}

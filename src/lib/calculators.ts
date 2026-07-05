/**
 * Single source of truth for the ArthVeda calculator surface.
 *
 * Used by the sitewide top navigation (CalculatorNav), the "Explore Other
 * Calculators" section (ExploreCalculators), and anywhere else that needs the
 * canonical list of calculator routes and labels. Keeping this in one place
 * keeps the navigation, internal linking, and active-state highlighting
 * consistent across the site.
 */

import { hasPublishedArticles } from '../pages/learn/learnContent';

export interface CalculatorEntry {
  /** Canonical route path (no trailing slash). */
  path: string;
  /** Full display label, e.g. "SIP Calculator". */
  label: string;
  /** Short label for compact contexts, e.g. "SIP". */
  short: string;
  /** One-line description used by the explore cards. */
  description: string;
}

export const CALCULATORS: CalculatorEntry[] = [
  {
    path: '/sip-calculator',
    label: 'SIP Calculator',
    short: 'SIP',
    description: 'Project a monthly SIP with an optional annual step-up and inflation.',
  },
  {
    path: '/retirement-calculator',
    label: 'Retirement Calculator',
    short: 'Retirement',
    description: 'Plan the corpus you need to retire and the income it can sustain.',
  },
  {
    path: '/swp-calculator',
    label: 'SWP Calculator',
    short: 'SWP',
    description: 'Model a Systematic Withdrawal Plan and a steady monthly income.',
  },
  {
    path: '/lumpsum-calculator',
    label: 'Lumpsum Calculator',
    short: 'Lumpsum',
    description: 'Project the long-term growth of a one-time investment.',
  },
  {
    path: '/fire-calculator',
    label: 'FIRE Calculator',
    short: 'FIRE',
    description: 'Estimate your path to Financial Independence, Retire Early.',
  },
  {
    path: '/sip-vs-stepup-sip-calculator',
    label: 'SIP vs Step-Up SIP',
    short: 'SIP vs Step-Up',
    description: 'Compare a normal SIP against a step-up SIP and see the extra wealth created.',
  },
];

export interface NavItem {
  path: string;
  label: string;
}

/**
 * Top-navigation items: Home, every calculator, then informational pages.
 *
 * The "Learn" link is only included once at least one article is published
 * (`hasPublishedArticles()`), so the section stays hidden from the primary
 * navigation until it has real content to point to.
 */
export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home' },
  ...CALCULATORS.map((c) => ({ path: c.path, label: c.label })),
  ...(hasPublishedArticles() ? [{ path: '/learn', label: 'Learn' }] : []),
  { path: '/about-us', label: 'About Us' },
  { path: '/contact-us', label: 'Contact Us' },
  { path: '/privacy-policy', label: 'Privacy Policy' },
  { path: '/terms-and-conditions', label: 'Terms & Conditions' },
  { path: '/disclaimer', label: 'Disclaimer' },
];

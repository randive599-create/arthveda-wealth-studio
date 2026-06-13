/**
 * Single source of truth for the ArthVeda calculator surface.
 *
 * Used by the sitewide top navigation (CalculatorNav), the "Explore Other
 * Calculators" section (ExploreCalculators), and anywhere else that needs the
 * canonical list of calculator routes and labels. Keeping this in one place
 * keeps the navigation, internal linking, and active-state highlighting
 * consistent across the site.
 */

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
];

export interface NavItem {
  path: string;
  label: string;
}

/** Top-navigation items: Home followed by every calculator. */
export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home' },
  ...CALCULATORS.map((c) => ({ path: c.path, label: c.label })),
];

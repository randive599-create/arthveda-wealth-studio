/**
 * Learn section — content model, registry, SEO metadata and structured-data
 * builders.
 *
 * This is the single source of truth for the /learn knowledge base:
 *   - Categories (used by the Learn homepage cards).
 *   - The article registry (data-only; each article's body is structured so the
 *     Table of Contents, schema, and reading view are all generated from one
 *     object — no MDX, no extra dependencies).
 *   - Helpers for published/draft filtering, lookups, and grouping.
 *   - SEO meta + JSON-LD builders (WebPage/CollectionPage, Article, Breadcrumb,
 *     optional FAQPage) shared by the client `useSeoHead` hook and the static
 *     prerender.
 *
 * PHASE 1 NOTE: No real articles are published yet. The two entries below are
 * clearly-labelled development placeholders with `status: 'draft'` — they are
 * excluded from prerendering, the sitemap, and every public listing, so they
 * never appear in production. They exist only to exercise the article template
 * and reusable components during development.
 */

import type { FaqEntry } from '../../components/faq/faqData';

export const LEARN_WEBSITE = 'https://arthvedawealth.in';

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

export type LearnCategoryId =
  | 'getting-started'
  | 'sip-mutual-funds'
  | 'retirement'
  | 'fire'
  | 'withdrawals';

export interface LearnCategory {
  id: LearnCategoryId;
  label: string;
  description: string;
}

export const LEARN_CATEGORIES: LearnCategory[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    description: 'Foundational concepts for new investors — compounding, inflation, and goals.',
  },
  {
    id: 'sip-mutual-funds',
    label: 'SIP & Mutual Funds',
    description: 'How systematic investing, step-ups, and lumpsum strategies build wealth.',
  },
  {
    id: 'retirement',
    label: 'Retirement Planning',
    description: 'Sizing the corpus you need and the income it can sustain through retirement.',
  },
  {
    id: 'fire',
    label: 'FIRE & Independence',
    description: 'Financial Independence, safe withdrawal rates, and the FIRE number.',
  },
  {
    id: 'withdrawals',
    label: 'Withdrawals & Income',
    description: 'Drawing a sustainable income from your corpus with a Systematic Withdrawal Plan.',
  },
];

/* -------------------------------------------------------------------------- */
/* Article model                                                              */
/* -------------------------------------------------------------------------- */

/** A single content block within an article section. Extensible over time. */
export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; text: string };

/** A titled article section. Its `id` is the anchor target used by the ToC. */
export interface ArticleSection {
  id: string;
  heading: string;
  blocks: ArticleBlock[];
}

/** An external (or internal) reference/source shown at the end of an article. */
export interface ArticleReference {
  label: string;
  url?: string;
}

export type ArticleStatus = 'draft' | 'published';

export interface LearnArticle {
  /** URL slug: /learn/<slug>. */
  slug: string;
  /** Only `published` articles are prerendered, listed, and added to the sitemap. */
  status: ArticleStatus;
  category: LearnCategoryId;

  /** On-page H1. */
  title: string;
  /** Full <title> for SEO (falls back to `title` if omitted at call sites). */
  seoTitle: string;
  /** Meta description / hero summary source. */
  description: string;
  /** Lead paragraph shown in the hero. */
  heroSummary: string;

  /** ISO dates (YYYY-MM-DD). */
  datePublished: string;
  dateModified: string;
  /** Estimated reading time in minutes (shown in the hero meta row). */
  readingMinutes: number;

  /** Body — drives both the reading view and the Table of Contents. */
  sections: ArticleSection[];
  /** 3–6 short, scannable takeaways. */
  keyTakeaways: string[];
  /** Optional FAQ — emits FAQPage JSON-LD when present. */
  faqs?: FaqEntry[];

  /** Calculator paths (into CALCULATORS) surfaced as "Related Calculators". */
  relatedCalculators?: string[];
  /** Slugs of other articles surfaced as "Related Articles". */
  relatedArticles?: string[];
  /** Sources / further reading. */
  references?: ArticleReference[];

  /** Optional author display name; defaults to the publisher organisation. */
  author?: string;
}

/* -------------------------------------------------------------------------- */
/* Registry (Phase 1: development placeholders only, all `draft`)             */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_NOTE =
  'This is placeholder content created during development to validate the article template. ' +
  'It will be replaced with fully-researched editorial content before this article is published.';

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    slug: 'what-is-sip',
    status: 'draft',
    category: 'sip-mutual-funds',
    title: 'What Is a SIP? A Beginner\u2019s Guide to Systematic Investing',
    seoTitle: 'What Is a SIP? Beginner\u2019s Guide to Systematic Investing | ArthVeda',
    description:
      'A plain-language introduction to Systematic Investment Plans (SIPs): how they work, ' +
      'why disciplined monthly investing matters, and how compounding builds wealth over time.',
    heroSummary:
      'A Systematic Investment Plan lets you invest a fixed amount every month so that discipline ' +
      'and compounding — not market timing — do the heavy lifting.',
    datePublished: '2026-07-01',
    dateModified: '2026-07-01',
    readingMinutes: 6,
    sections: [
      {
        id: 'what-is-a-sip',
        heading: 'What is a SIP?',
        blocks: [
          { type: 'paragraph', text: PLACEHOLDER_NOTE },
          {
            type: 'paragraph',
            text:
              'A SIP is a disciplined way to invest a fixed amount at regular intervals rather than ' +
              'a large sum at once. Placeholder body text for layout and template validation.',
          },
        ],
      },
      {
        id: 'how-compounding-works',
        heading: 'How compounding works',
        blocks: [
          { type: 'paragraph', text: 'Placeholder explanation of monthly compounding.' },
          {
            type: 'list',
            items: [
              'Placeholder point one about compounding.',
              'Placeholder point two about time in the market.',
              'Placeholder point three about consistency.',
            ],
          },
          { type: 'callout', text: 'Placeholder callout: projections are illustrative, not advice.' },
        ],
      },
    ],
    keyTakeaways: [
      'A SIP invests a fixed amount on a fixed schedule.',
      'Compounding rewards consistency over timing.',
      'Placeholder takeaway for template validation.',
    ],
    faqs: [
      {
        question: 'Is a SIP the same as a mutual fund?',
        answer: 'Placeholder answer explaining the difference between a SIP and a mutual fund.',
      },
      {
        question: 'How much should I invest in a SIP?',
        answer: 'Placeholder answer about aligning SIP amounts to goals and income.',
      },
    ],
    relatedCalculators: ['/sip-calculator', '/sip-vs-stepup-sip-calculator'],
    relatedArticles: ['sip-vs-lumpsum'],
    references: [
      { label: 'AMFI — Association of Mutual Funds in India', url: 'https://www.amfiindia.com/' },
      { label: 'SEBI — Investor education', url: 'https://investor.sebi.gov.in/' },
    ],
  },
  {
    slug: 'sip-vs-lumpsum',
    status: 'draft',
    category: 'sip-mutual-funds',
    title: 'SIP vs Lumpsum: Which Investing Strategy Is Right for You?',
    seoTitle: 'SIP vs Lumpsum: Which Strategy Is Right for You? | ArthVeda',
    description:
      'Compare systematic (SIP) investing against a one-time lumpsum investment — the trade-offs, ' +
      'when each makes sense, and how to combine both.',
    heroSummary:
      'SIP and lumpsum are not rivals — they suit different situations. This guide explains the ' +
      'trade-offs so you can choose (or blend) with confidence.',
    datePublished: '2026-07-01',
    dateModified: '2026-07-01',
    readingMinutes: 7,
    sections: [
      {
        id: 'the-core-difference',
        heading: 'The core difference',
        blocks: [
          { type: 'paragraph', text: PLACEHOLDER_NOTE },
          { type: 'paragraph', text: 'Placeholder explanation of SIP vs lumpsum mechanics.' },
        ],
      },
      {
        id: 'when-each-makes-sense',
        heading: 'When each makes sense',
        blocks: [
          {
            type: 'list',
            items: [
              'Placeholder: SIP suits investing from regular income.',
              'Placeholder: Lumpsum suits deploying capital you already hold.',
              'Placeholder: The two can be combined.',
            ],
          },
        ],
      },
    ],
    keyTakeaways: [
      'SIP averages your entry over time.',
      'Lumpsum puts capital to work immediately.',
      'Placeholder takeaway for template validation.',
    ],
    relatedCalculators: ['/sip-calculator', '/lumpsum-calculator'],
    relatedArticles: ['what-is-sip'],
    references: [{ label: 'AMFI — Association of Mutual Funds in India', url: 'https://www.amfiindia.com/' }],
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Canonical URL for an article. */
export function articleUrl(slug: string): string {
  return `${LEARN_WEBSITE}/learn/${slug}`;
}

/** Only published articles are ever exposed publicly (listings, sitemap, prerender). */
export function getPublishedArticles(): LearnArticle[] {
  return LEARN_ARTICLES.filter((a) => a.status === 'published');
}

/**
 * Resolve an article by slug. Includes drafts, so the article template is
 * viewable in local development; production only serves prerendered (published)
 * routes, so drafts are never reachable there.
 */
export function getArticleBySlug(slug: string): LearnArticle | undefined {
  return LEARN_ARTICLES.find((a) => a.slug === slug);
}

/** Published articles in a category. */
export function articlesByCategory(id: LearnCategoryId): LearnArticle[] {
  return getPublishedArticles().filter((a) => a.category === id);
}

/** Count of published articles in a category (for the category cards). */
export function categoryArticleCount(id: LearnCategoryId): number {
  return articlesByCategory(id).length;
}

/** Category lookup. */
export function getCategory(id: LearnCategoryId): LearnCategory | undefined {
  return LEARN_CATEGORIES.find((c) => c.id === id);
}

/** Featured articles (Phase 1: first few published — empty until launch). */
export function featuredArticles(limit = 3): LearnArticle[] {
  return getPublishedArticles().slice(0, limit);
}

/** Most-recently-updated published articles. */
export function recentArticles(limit = 6): LearnArticle[] {
  return [...getPublishedArticles()]
    .sort((a, b) => b.dateModified.localeCompare(a.dateModified))
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* SEO — Learn homepage                                                       */
/* -------------------------------------------------------------------------- */

export const LEARN_META = {
  title: 'Learn — Investing & Financial Planning Guides | ArthVeda Wealth Studio',
  description:
    'Plain-language guides to SIP, lumpsum, retirement, FIRE and withdrawal planning — the ' +
    'concepts behind the ArthVeda calculators, explained for everyday Indian investors.',
  canonical: `${LEARN_WEBSITE}/learn`,
} as const;

export const LEARN_INTRO =
  'Clear, jargon-free guides to investing and financial planning — the ideas behind every ' +
  'ArthVeda calculator, explained for everyday investors.';

/** CollectionPage JSON-LD for the Learn homepage. */
export function buildLearnCollectionJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ArthVeda Learn',
    url: LEARN_META.canonical,
    description: LEARN_META.description,
    isPartOf: { '@type': 'WebSite', name: 'ArthVeda Wealth Studio', url: LEARN_WEBSITE },
    publisher: { '@type': 'Organization', name: 'ArthVeda Wealth Studio', url: LEARN_WEBSITE },
  });
}

/** BreadcrumbList JSON-LD for the Learn homepage (Home › Learn). */
export function buildLearnBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: LEARN_WEBSITE },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: LEARN_META.canonical },
    ],
  });
}

/* -------------------------------------------------------------------------- */
/* SEO — Article                                                              */
/* -------------------------------------------------------------------------- */

export function articleMeta(article: LearnArticle): { title: string; description: string; canonical: string } {
  return {
    title: article.seoTitle,
    description: article.description,
    canonical: articleUrl(article.slug),
  };
}

/** Article JSON-LD (Article + author/publisher + dates). */
export function buildArticleJsonLd(article: LearnArticle): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: { '@type': 'Organization', name: article.author ?? 'ArthVeda Wealth Studio' },
    publisher: {
      '@type': 'Organization',
      name: 'ArthVeda Wealth Studio',
      url: LEARN_WEBSITE,
      logo: `${LEARN_WEBSITE}/favicon.svg`,
    },
    image: `${LEARN_WEBSITE}/og-image.png`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl(article.slug) },
    isPartOf: { '@type': 'WebSite', name: 'ArthVeda Wealth Studio', url: LEARN_WEBSITE },
  });
}

/** BreadcrumbList JSON-LD for an article (Home › Learn › Article). */
export function buildArticleBreadcrumbJsonLd(article: LearnArticle): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: LEARN_WEBSITE },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: LEARN_META.canonical },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl(article.slug) },
    ],
  });
}

/** FAQPage JSON-LD for an article, or null when it has no FAQ. */
export function buildArticleFaqJsonLd(article: LearnArticle): string | null {
  if (!article.faqs || article.faqs.length === 0) {
    return null;
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  });
}

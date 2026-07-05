/**
 * Reusable editorial template for Learn articles.
 *
 * This is the canonical starting point for every new guide. It returns a fully
 * shaped `LearnArticle` skeleton — created as a `draft` so it is invisible in
 * production until deliberately published — with placeholders for all seven
 * editorial building blocks the article view renders:
 *
 *   1. Summary            → `heroSummary` (lead) + `description` (SEO/meta)
 *   2. Table of Contents  → generated automatically from `sections[].id`
 *   3. Key Takeaways      → `keyTakeaways`
 *   4. FAQ                → `faqs` (optional; also emits FAQPage JSON-LD)
 *   5. Related Calculators→ `relatedCalculators` (paths into CALCULATORS)
 *   6. Related Articles   → `relatedArticles` (other slugs)
 *   7. References         → `references`
 *
 * Plus the mandatory editorial by-line: `author` (name/role/bio), `dateModified`
 * (last updated) and `readingMinutes` (reading time).
 *
 * Usage — create a new article by copying the returned object into
 * LEARN_ARTICLES (see the "How to add an article" note), or spread it and
 * override the fields you need:
 *
 *   const article = {
 *     ...createArticleTemplate('what-is-sip'),
 *     status: 'published',
 *     category: 'sip-mutual-funds',
 *     title: 'What Is a SIP?',
 *     // ...fill in real content...
 *   } satisfies LearnArticle;
 */

import { DEFAULT_AUTHOR, type LearnArticle } from './learnContent';

/** Today's date as an ISO `YYYY-MM-DD` string, for `datePublished`/`dateModified`. */
export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Build a blank, correctly-shaped article skeleton. Every field required by the
 * content model is present, so a new article always renders and validates. The
 * template is a `draft` and uses the default ArthVeda author unless overridden.
 */
export function createArticleTemplate(slug: string): LearnArticle {
  const today = isoToday();
  return {
    slug,
    status: 'draft',
    category: 'getting-started',

    // 1. Summary
    title: 'New article title',
    seoTitle: 'New article title | ArthVeda Wealth Studio',
    description: 'One- or two-sentence meta description (~150–160 characters) for search results.',
    heroSummary: 'A short lead paragraph that frames the article for the reader in the hero.',

    // Editorial by-line
    datePublished: today,
    dateModified: today,
    readingMinutes: 6,
    author: DEFAULT_AUTHOR,

    // 2. Table of Contents — generated from these section ids
    sections: [
      {
        id: 'section-one',
        heading: 'First section heading',
        blocks: [
          { type: 'paragraph', text: 'Opening paragraph of the first section.' },
          { type: 'list', items: ['First point.', 'Second point.', 'Third point.'] },
          { type: 'callout', text: 'An optional highlighted note or reminder.' },
        ],
      },
      {
        id: 'section-two',
        heading: 'Second section heading',
        blocks: [{ type: 'paragraph', text: 'Opening paragraph of the second section.' }],
      },
    ],

    // 3. Key Takeaways
    keyTakeaways: [
      'First scannable takeaway.',
      'Second scannable takeaway.',
      'Third scannable takeaway.',
    ],

    // 4. FAQ (optional — remove if the article has none)
    faqs: [
      { question: 'First question?', answer: 'Answer to the first question.' },
      { question: 'Second question?', answer: 'Answer to the second question.' },
    ],

    // 5. Related Calculators (paths into CALCULATORS)
    relatedCalculators: ['/sip-calculator'],

    // 6. Related Articles (slugs of other published articles)
    relatedArticles: [],

    // 7. References / further reading
    references: [
      { label: 'AMFI — Association of Mutual Funds in India', url: 'https://www.amfiindia.com/' },
    ],
  };
}

/**
 * FAQPage JSON-LD builder.
 *
 * Produces the schema.org FAQPage structured data from the shared FAQ content,
 * so the markup search engines see is always in sync with the rendered FAQ. The
 * FaqSection injects this into the document head at runtime.
 */

import { FAQ_ENTRIES } from './faqData';

export function buildFaqJsonLd(): string {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ENTRIES.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
  return JSON.stringify(payload);
}

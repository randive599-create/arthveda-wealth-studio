/**
 * Article FAQ — an accessible accordion built on native <details>/<summary>,
 * mirroring the site-wide FaqSection pattern (keyboard-operable, zero JS state).
 * The same entries drive the article's FAQPage JSON-LD, keeping copy and schema
 * aligned.
 */

import { Plus } from 'lucide-react';
import type { FaqEntry } from '../faq/faqData';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';

export interface ArticleFaqProps {
  faqs: FaqEntry[];
}

export function ArticleFaq({ faqs }: ArticleFaqProps) {
  if (faqs.length === 0) {
    return null;
  }
  return (
    <Card className="p-6" data-testid="article-faq">
      <SectionHeading eyebrow="Questions" title="Frequently Asked Questions" />
      <div className="mt-6 divide-y divide-hairline">
        {faqs.map((entry) => (
          <details key={entry.question} className="group py-1">
            <summary
              className="
                flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-left
                outline-none focus-visible:ring-2 focus-visible:ring-accent
              "
            >
              <span className="font-heading text-lg font-bold leading-snug text-ink">
                {entry.question}
              </span>
              <Plus
                size={18}
                strokeWidth={1.75}
                aria-hidden="true"
                className="shrink-0 text-ink-secondary transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <p className="pb-4 pr-8 text-sm leading-relaxed text-ink-secondary">{entry.answer}</p>
          </details>
        ))}
      </div>
    </Card>
  );
}

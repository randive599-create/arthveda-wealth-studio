/**
 * FAQ section.
 *
 * An accessible accordion of educational questions covering SIP, lumpsum, SWP,
 * inflation, retirement, currencies, and sharing/export. Built on native
 * <details>/<summary> so it is keyboard-operable and screen-reader friendly with
 * no JavaScript state, and remains fully functional if hydration is delayed.
 *
 * The same content drives the FAQPage JSON-LD in index.html, keeping the
 * on-page copy and structured data aligned for SEO.
 */

import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { TESTIDS } from '../../lib/testids';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';
import { FAQ_ENTRIES } from './faqData';
import { buildFaqJsonLd } from './faqSchema';

/** Inject the FAQPage JSON-LD into <head> once, removing it on unmount. */
function useFaqStructuredData(): void {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.arthveda = 'faq';
    script.textContent = buildFaqJsonLd();
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);
}

export function FaqSection() {
  useFaqStructuredData();

  return (
    <Card className="p-6" data-testid={TESTIDS.faqSection}>
      <SectionHeading
        eyebrow="Knowledge"
        title="Frequently Asked Questions"
        description="Understanding SIP, lumpsum, SWP, inflation, and long-term wealth planning."
      />

      <div className="mt-6 divide-y divide-hairline">
        {FAQ_ENTRIES.map((entry, index) => (
          <details key={entry.question} className="group py-1" data-testid={TESTIDS.faqItem(index)}>
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

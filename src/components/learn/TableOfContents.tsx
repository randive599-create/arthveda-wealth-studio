/**
 * Table of Contents — plain anchor links generated from an article's sections.
 * No scroll-spy / JavaScript: links jump to section `id`s, keeping the article
 * pages effectively zero-JS beyond the shared shell.
 */

import type { ArticleSection } from '../../pages/learn/learnContent';
import { Card } from '../primitives/Card';

export interface TableOfContentsProps {
  sections: ArticleSection[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  if (sections.length === 0) {
    return null;
  }
  return (
    <Card className="p-5" data-testid="article-toc">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
        On this page
      </p>
      <nav aria-label="Table of contents" className="mt-3">
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-sm text-ink-secondary underline-offset-2 transition-colors duration-150 hover:text-accent hover:underline"
              >
                {section.heading}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Card>
  );
}

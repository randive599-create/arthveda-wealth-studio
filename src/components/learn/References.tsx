/**
 * References — sources and further reading for an article, a transparency/
 * E-E-A-T signal for a YMYL financial topic. External links open safely.
 * Presentational and server-safe.
 */

import { ExternalLink } from 'lucide-react';
import type { ArticleReference } from '../../pages/learn/learnContent';
import { Card } from '../primitives/Card';

export interface ReferencesProps {
  references?: ArticleReference[];
}

export function References({ references }: ReferencesProps) {
  if (!references || references.length === 0) {
    return null;
  }
  return (
    <Card className="p-6" data-testid="article-references">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
        References &amp; further reading
      </p>
      <ul className="mt-4 space-y-2">
        {references.map((ref, index) => (
          <li key={index} className="text-sm leading-relaxed text-ink-secondary">
            {ref.url ? (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 text-ink underline-offset-2 transition-colors hover:text-accent hover:underline"
              >
                {ref.label}
                <ExternalLink size={13} strokeWidth={1.75} aria-hidden="true" />
              </a>
            ) : (
              ref.label
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

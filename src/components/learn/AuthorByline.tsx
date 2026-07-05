/**
 * Author byline — an "About the author" card surfacing the article's mandatory
 * author (full name, role, short bio). A transparency / E-E-A-T signal for a
 * YMYL financial topic. Presentational and server-safe.
 */

import { UserRound } from 'lucide-react';
import type { ArticleAuthor } from '../../pages/learn/learnContent';
import { Card } from '../primitives/Card';

export interface AuthorBylineProps {
  author: ArticleAuthor;
}

export function AuthorByline({ author }: AuthorBylineProps) {
  return (
    <Card className="p-6" data-testid="article-author-byline">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
        About the author
      </p>
      <div className="mt-4 flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist text-ink-secondary"
        >
          <UserRound size={20} strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-lg font-bold leading-snug text-ink">{author.name}</p>
          <p className="text-sm font-medium text-accent">{author.role}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{author.bio}</p>
        </div>
      </div>
    </Card>
  );
}

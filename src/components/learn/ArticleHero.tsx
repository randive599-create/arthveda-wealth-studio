/**
 * Article hero — eyebrow (category), H1 title, lead summary, and a meta row
 * (reading time + last updated). Presentational and server-safe.
 */

import { Clock } from 'lucide-react';
import type { LearnArticle } from '../../pages/learn/learnContent';
import { getCategory } from '../../pages/learn/learnContent';
import { formatLearnDate } from './LastUpdated';

export interface ArticleHeroProps {
  article: LearnArticle;
}

export function ArticleHero({ article }: ArticleHeroProps) {
  const category = getCategory(article.category);

  return (
    <header>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        {category ? category.label : 'Learn'}
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
        {article.title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
        {article.heroSummary}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
        <span className="inline-flex items-center gap-2">
          <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
          {article.readingMinutes} min read
        </span>
        <span aria-hidden="true" className="h-3 w-px bg-hairline" />
        <span>Last updated: {formatLearnDate(article.dateModified)}</span>
      </div>
    </header>
  );
}

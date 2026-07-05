/**
 * Related Articles — cross-links to other Learn articles by slug.
 *
 * Only *published* articles are linked, so the prerendered HTML never contains
 * dead links to drafts. Presentational and server-safe.
 */

import { ArrowUpRight } from 'lucide-react';
import { getArticleBySlug, getCategory } from '../../pages/learn/learnContent';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';

export interface RelatedArticlesProps {
  /** Slugs of related articles. */
  slugs?: string[];
  /** Current article slug, excluded from the list. */
  currentSlug?: string;
}

export function RelatedArticles({ slugs, currentSlug }: RelatedArticlesProps) {
  const items = (slugs ?? [])
    .filter((slug) => slug !== currentSlug)
    .map((slug) => getArticleBySlug(slug))
    .filter((a) => a && a.status === 'published')
    .map((a) => a!);

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="p-6" data-testid="article-related-articles">
      <SectionHeading eyebrow="Keep reading" title="Related Articles" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((article) => {
          const category = getCategory(article.category);
          return (
            <a
              key={article.slug}
              href={`/learn/${article.slug}`}
              className="
                group flex flex-col rounded-[var(--radius-control)] border border-hairline p-4
                transition-colors hover:border-accent
              "
            >
              {category ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-secondary">
                  {category.label}
                </span>
              ) : null}
              <span className="mt-1 flex items-center justify-between gap-2">
                <span className="font-heading text-lg font-bold leading-snug text-ink group-hover:text-accent">
                  {article.title}
                </span>
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-secondary transition-colors group-hover:text-accent"
                />
              </span>
            </a>
          );
        })}
      </div>
    </Card>
  );
}

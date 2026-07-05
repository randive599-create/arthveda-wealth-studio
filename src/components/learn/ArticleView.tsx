/**
 * ArticleView — the shared, presentational reading view for a Learn article.
 *
 * Composes every reusable article component from a single `article` object.
 * Used by BOTH the client route (LearnArticlePage) and the static prerender, so
 * the markup — and therefore the SEO — is identical in dev and production.
 *
 * Layout: a full-width hero, then a two-column grid on large screens (a sticky
 * Table of Contents beside the reading column), followed by full-width related
 * sections. No client JavaScript beyond the shared shell.
 */

import type { LearnArticle } from '../../pages/learn/learnContent';
import { ArticleBody } from './ArticleBody';
import { ArticleFaq } from './ArticleFaq';
import { ArticleHero } from './ArticleHero';
import { AuthorByline } from './AuthorByline';
import { KeyTakeaways } from './KeyTakeaways';
import { References } from './References';
import { RelatedArticles } from './RelatedArticles';
import { RelatedCalculators } from './RelatedCalculators';
import { TableOfContents } from './TableOfContents';

export interface ArticleViewProps {
  article: LearnArticle;
}

export function ArticleView({ article }: ArticleViewProps) {
  return (
    <article className="space-y-10" data-testid="article-view">
      <ArticleHero article={article} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <TableOfContents sections={article.sections} />
        </aside>
        <div className="min-w-0 space-y-10">
          <KeyTakeaways items={article.keyTakeaways} />
          <ArticleBody sections={article.sections} />
          {article.faqs ? <ArticleFaq faqs={article.faqs} /> : null}
          <AuthorByline author={article.author} />
          <References references={article.references} />
        </div>
      </div>

      <RelatedCalculators paths={article.relatedCalculators} />
      <RelatedArticles slugs={article.relatedArticles} currentSlug={article.slug} />
    </article>
  );
}

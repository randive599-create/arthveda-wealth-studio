/**
 * Learn homepage body (presentational, server-safe).
 *
 * Renders the section hero, the category cards, and the Featured / Recent
 * article sections. In Phase 1 there are no published articles, so the article
 * sections show a tasteful, professional empty state (never a link to a draft,
 * so the prerendered HTML has no dead links). As soon as an article is
 * published it flows into these lists automatically.
 *
 * Shared by the client route (LearnHomePage) and the static prerender.
 */

import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import {
  LEARN_CATEGORIES,
  LEARN_INTRO,
  categoryArticleCount,
  featuredArticles,
  getCategory,
  recentArticles,
  type LearnArticle,
} from './learnContent';

function ArticleCard({ article }: { article: LearnArticle }) {
  const category = getCategory(article.category);
  return (
    <a
      href={`/learn/${article.slug}`}
      className="
        group flex flex-col rounded-[var(--radius-control)] border border-hairline p-5
        transition-colors hover:border-accent
      "
    >
      {category ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-secondary">
          {category.label}
        </span>
      ) : null}
      <span className="mt-2 flex items-start justify-between gap-2">
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
      <span className="mt-2 block text-sm leading-relaxed text-ink-secondary">
        {article.description}
      </span>
      <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-secondary">
        {article.readingMinutes} min read
      </span>
    </a>
  );
}

/** Empty state shown while a section has no published articles yet. */
function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-dashed border-hairline p-8 text-center">
      <BookOpen size={22} strokeWidth={1.5} aria-hidden="true" className="mx-auto text-ink-secondary" />
      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        Our first {label} are being written. In the meantime, explore the calculators to put these
        ideas into practice.
      </p>
      <a
        href="/sip-calculator"
        className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent underline-offset-2 hover:underline"
      >
        Open the SIP calculator
        <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
      </a>
    </div>
  );
}

export function LearnHome() {
  const featured = featuredArticles();
  const recent = recentArticles();

  return (
    <div className="space-y-12">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Learn</p>
        <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
          Investing &amp; Financial Planning, Explained
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          {LEARN_INTRO}
        </p>
      </header>

      {/* Category cards */}
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Browse"
          title="Explore by Topic"
          description="Guides grouped by the questions investors ask most."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARN_CATEGORIES.map((category) => {
            const count = categoryArticleCount(category.id);
            return (
              <Card key={category.id} className="p-5">
                <h3 className="font-heading text-lg font-bold leading-snug text-ink">
                  {category.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                  {category.description}
                </p>
                {count > 0 ? (
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-secondary">
                    {count} guide{count === 1 ? '' : 's'}
                  </p>
                ) : null}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Featured articles */}
      <section className="space-y-6">
        <SectionHeading eyebrow="Featured" title="Featured Guides" />
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState label="featured guides" />
        )}
      </section>

      {/* Recent articles */}
      <section className="space-y-6">
        <SectionHeading eyebrow="Latest" title="Recent Guides" />
        {recent.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState label="guides" />
        )}
      </section>
    </div>
  );
}

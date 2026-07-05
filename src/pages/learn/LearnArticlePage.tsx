/**
 * /learn/<slug> — a single Learn article (client route).
 *
 * Resolves the slug from the current path and renders the shared ArticleView —
 * the same component the prerender uses, so client and static markup match.
 * Injects the full SEO head (title, description, canonical, OG/Twitter) plus
 * Article, BreadcrumbList and (optional) FAQPage JSON-LD.
 *
 * In production only *published* articles are prerendered, so drafts/unknown
 * slugs are never reachable there. This client fallback exists for local
 * development and defensive rendering: if a slug does not resolve, a graceful
 * "not found" is shown with a link back to /learn.
 */

import { AppShell } from '../../components/layout/AppShell';
import { ArticleView } from '../../components/learn/ArticleView';
import { getCurrentPath } from '../../lib/path';
import { useSeoHead } from '../shared/useSeoHead';
import {
  LEARN_META,
  articleMeta,
  buildArticleBreadcrumbJsonLd,
  buildArticleFaqJsonLd,
  buildArticleJsonLd,
  getArticleBySlug,
} from './learnContent';

function slugFromPath(): string {
  return getCurrentPath().replace(/^\/learn\//, '').replace(/\/+$/, '');
}

export function LearnArticlePage() {
  const article = getArticleBySlug(slugFromPath());

  const meta = article
    ? articleMeta(article)
    : {
        title: 'Article not found | ArthVeda Wealth Studio',
        description: 'The requested Learn article could not be found.',
        canonical: LEARN_META.canonical,
      };

  const extraJsonLd = article
    ? [
        { key: 'article', build: () => buildArticleJsonLd(article) },
        { key: 'article-breadcrumb', build: () => buildArticleBreadcrumbJsonLd(article) },
        ...(buildArticleFaqJsonLd(article)
          ? [{ key: 'article-faq', build: () => buildArticleFaqJsonLd(article) as string }]
          : []),
      ]
    : [];

  useSeoHead({ meta, extraJsonLd });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={
        article ? (
          <ArticleView article={article} />
        ) : (
          <div className="mx-auto max-w-xl py-16 text-center" data-testid="article-not-found">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
              404
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink">
              Article not found
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              The guide you are looking for is not available. Browse all guides in the Learn section.
            </p>
            <a
              href="/learn"
              className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent underline-offset-2 hover:underline"
            >
              Back to Learn
            </a>
          </div>
        )
      }
    />
  );
}

/**
 * Inject a calculator landing page's SEO <head> tags at runtime.
 *
 * Shared by the retirement, SWP, lumpsum and FIRE landing pages (the SIP page
 * keeps its own dedicated hook). Sets the document title, meta description,
 * canonical URL, and the Open Graph / Twitter equivalents, and injects the
 * page's FAQPage JSON-LD. Existing tags from the (prerendered) HTML are updated
 * in place — never duplicated — and a structured-data script created by this
 * hook is removed on unmount.
 */

import { useEffect } from 'react';

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
}

/** An extra structured-data (JSON-LD) block to inject, e.g. a BreadcrumbList. */
export interface ExtraJsonLd {
  /** Stable `data-arthveda` key for the script tag. */
  key: string;
  /** Build the JSON-LD string. */
  build: () => string;
}

export interface SeoHeadOptions {
  meta: SeoMeta;
  /** Optional FAQ JSON-LD key (e.g. "retirement-faq"). Provide with buildFaqJsonLd. */
  faqKey?: string;
  /** Optional FAQPage JSON-LD builder. */
  buildFaqJsonLd?: () => string;
  /** Optional additional JSON-LD blocks (e.g. a breadcrumb or organization). */
  extraJsonLd?: ExtraJsonLd[];
}

function upsert<T extends HTMLElement>(selector: string, create: () => T): T {
  const existing = document.head.querySelector<T>(selector);
  if (existing) {
    return existing;
  }
  const el = create();
  document.head.appendChild(el);
  return el;
}

function metaByProperty(property: string): HTMLMetaElement {
  return upsert(`meta[property="${property}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute('property', property);
    return el;
  });
}

function metaByName(name: string): HTMLMetaElement {
  return upsert(`meta[name="${name}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute('name', name);
    return el;
  });
}

export function useSeoHead({ meta, faqKey, buildFaqJsonLd, extraJsonLd }: SeoHeadOptions): void {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.title = meta.title;

    metaByName('description').setAttribute('content', meta.description);

    upsert('link[rel="canonical"]', () => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      return el;
    }).setAttribute('href', meta.canonical);

    metaByProperty('og:title').setAttribute('content', meta.title);
    metaByProperty('og:description').setAttribute('content', meta.description);
    metaByProperty('og:url').setAttribute('content', meta.canonical);
    metaByName('twitter:title').setAttribute('content', meta.title);
    metaByName('twitter:description').setAttribute('content', meta.description);

    // Inject each JSON-LD block (FAQ + any extras). Reuse the prerendered
    // <script> if present (so we never duplicate); track the ones we create so
    // they can be removed on unmount.
    const blocks: { key: string; build: () => string }[] = [
      ...(faqKey && buildFaqJsonLd ? [{ key: faqKey, build: buildFaqJsonLd }] : []),
      ...(extraJsonLd ?? []),
    ];
    const created: HTMLScriptElement[] = [];
    for (const block of blocks) {
      const selector = `script[data-arthveda="${block.key}"]`;
      const existing = document.head.querySelector<HTMLScriptElement>(selector);
      const jsonLd = existing ?? document.createElement('script');
      jsonLd.type = 'application/ld+json';
      jsonLd.dataset.arthveda = block.key;
      jsonLd.textContent = block.build();
      if (!existing) {
        document.head.appendChild(jsonLd);
        created.push(jsonLd);
      }
    }

    return () => {
      for (const el of created) {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
    };
  }, [meta, faqKey, buildFaqJsonLd, extraJsonLd]);
}

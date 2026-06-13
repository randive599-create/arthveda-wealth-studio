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

export interface SeoHeadOptions {
  meta: SeoMeta;
  /** Stable `data-arthveda` key for the FAQ JSON-LD script, e.g. "retirement-faq". */
  faqKey: string;
  /** Build the FAQPage JSON-LD string for this page. */
  buildFaqJsonLd: () => string;
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

export function useSeoHead({ meta, faqKey, buildFaqJsonLd }: SeoHeadOptions): void {
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

    // FAQPage JSON-LD: reuse the prerendered <script> if it exists (so we never
    // emit a duplicate), otherwise create one and remove it on unmount.
    const selector = `script[data-arthveda="${faqKey}"]`;
    const existing = document.head.querySelector<HTMLScriptElement>(selector);
    const jsonLd = existing ?? document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.dataset.arthveda = faqKey;
    jsonLd.textContent = buildFaqJsonLd();
    if (!existing) {
      document.head.appendChild(jsonLd);
    }

    return () => {
      if (!existing && jsonLd.parentNode) {
        jsonLd.parentNode.removeChild(jsonLd);
      }
    };
  }, [meta, faqKey, buildFaqJsonLd]);
}

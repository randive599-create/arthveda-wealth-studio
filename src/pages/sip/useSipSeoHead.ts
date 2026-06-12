/**
 * Inject the SIP landing page's SEO <head> tags at runtime.
 *
 * Sets the document title, meta description, canonical URL, and Open Graph /
 * Twitter equivalents, and injects the FAQPage JSON-LD. Existing tags from the
 * (prerendered) HTML are updated in place — never duplicated — and the
 * structured-data script created by this hook is removed on unmount.
 */

import { useEffect } from 'react';
import { SIP_META, buildSipFaqJsonLd } from './sipContent';

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

export function useSipSeoHead(): void {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.title = SIP_META.title;

    metaByName('description').setAttribute('content', SIP_META.description);

    upsert('link[rel="canonical"]', () => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      return el;
    }).setAttribute('href', SIP_META.canonical);

    metaByProperty('og:title').setAttribute('content', SIP_META.title);
    metaByProperty('og:description').setAttribute('content', SIP_META.description);
    metaByProperty('og:url').setAttribute('content', SIP_META.canonical);
    metaByName('twitter:title').setAttribute('content', SIP_META.title);
    metaByName('twitter:description').setAttribute('content', SIP_META.description);

    // FAQPage JSON-LD: reuse the prerendered <script> if it exists (so we never
    // emit a duplicate), otherwise create one and remove it on unmount.
    const existing = document.head.querySelector<HTMLScriptElement>(
      'script[data-arthveda="sip-faq"]',
    );
    const jsonLd = existing ?? document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.dataset.arthveda = 'sip-faq';
    jsonLd.textContent = buildSipFaqJsonLd();
    if (!existing) {
      document.head.appendChild(jsonLd);
    }

    return () => {
      if (!existing && jsonLd.parentNode) {
        jsonLd.parentNode.removeChild(jsonLd);
      }
    };
  }, []);
}

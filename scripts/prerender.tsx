/**
 * Post-build static prerender for SEO.
 *
 * `vite build` emits a single empty-shell index.html for an SPA, so crawlers
 * that do not execute JavaScript see no real content on /sip-calculator. This
 * step renders each route's real, server-safe content (headings, intro,
 * benefits, engine-computed example table, FAQ, internal links) plus the
 * route-specific <head> (title, description, canonical, OG/Twitter, FAQPage
 * JSON-LD) into static HTML files inside dist/:
 *
 *   /               -> dist/index.html           (home hero injected)
 *   /sip-calculator -> dist/sip-calculator.html  (full SIP SEO content)
 *
 * Both files keep the exact hashed <script>/<link> tags, so the interactive
 * React app still boots and replaces the prerendered markup on load. No browser
 * or SSR framework is required — only react-dom/server and the pure engine.
 *
 * Run via: vite-node scripts/prerender.tsx (chained after `vite build`).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SipSeoContent } from '../src/pages/sip/SipSeoContent';
import { SIP_META, SIP_INTERNAL_LINKS, buildSipFaqJsonLd } from '../src/pages/sip/sipContent';

const DIST = resolve(process.cwd(), 'dist');
const template = readFileSync(resolve(DIST, 'index.html'), 'utf8');

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function replaceFirst(html: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(html)) {
    throw new Error(`prerender: pattern not found: ${pattern}`);
  }
  return html.replace(pattern, () => replacement);
}

interface HeadOptions {
  title: string;
  description: string;
  canonical: string;
}

/** Rewrite the route-specific head tags in the shell template. */
function setHead(html: string, opts: HeadOptions): string {
  const title = escapeAttr(opts.title);
  let out = html;
  out = replaceFirst(out, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  out = replaceFirst(
    out,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${escapeAttr(opts.description)}" />`,
  );
  out = replaceFirst(
    out,
    /<link rel="canonical"[^>]*\/>/,
    `<link rel="canonical" href="${escapeAttr(opts.canonical)}" />`,
  );
  out = replaceFirst(
    out,
    /<meta\s+property="og:title"[\s\S]*?\/>/,
    `<meta property="og:title" content="${title}" />`,
  );
  out = replaceFirst(
    out,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${escapeAttr(opts.description)}" />`,
  );
  out = replaceFirst(
    out,
    /<meta\s+property="og:url"[\s\S]*?\/>/,
    `<meta property="og:url" content="${escapeAttr(opts.canonical)}" />`,
  );
  out = replaceFirst(
    out,
    /<meta\s+name="twitter:title"[\s\S]*?\/>/,
    `<meta name="twitter:title" content="${title}" />`,
  );
  out = replaceFirst(
    out,
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${escapeAttr(opts.description)}" />`,
  );
  return out;
}

function injectIntoRoot(html: string, bodyHtml: string): string {
  return replaceFirst(html, /<div id="root"><\/div>/, `<div id="root">${bodyHtml}</div>`);
}

function injectBeforeHeadClose(html: string, snippet: string): string {
  return replaceFirst(html, /<\/head>/, `    ${snippet}\n  </head>`);
}

// --- /sip-calculator ---------------------------------------------------------

const sipBody = renderToStaticMarkup(
  <div className="mx-auto w-full max-w-[1400px] space-y-8 px-5 py-10 sm:px-8">
    <header>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
        SIP Calculator
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
        SIP Calculator India — Calculate SIP Returns &amp; Future Wealth
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
        Estimate the future value of your Systematic Investment Plan, model step-up SIP growth, and
        see your inflation-adjusted wealth — powered by the ArthVeda projection engine.
      </p>
    </header>
    <SipSeoContent />
  </div>,
);

let sipHtml = setHead(template, {
  title: SIP_META.title,
  description: SIP_META.description,
  canonical: SIP_META.canonical,
});
sipHtml = injectBeforeHeadClose(
  sipHtml,
  `<script type="application/ld+json" data-arthveda="sip-faq">${buildSipFaqJsonLd()}</script>`,
);
sipHtml = injectIntoRoot(sipHtml, sipBody);
writeFileSync(resolve(DIST, 'sip-calculator.html'), sipHtml);

// --- / (home) ----------------------------------------------------------------

const homeBody = renderToStaticMarkup(
  <div className="mx-auto w-full max-w-[1400px] space-y-6 px-5 py-10 sm:px-8">
    <header>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
        ArthVeda · Private Office
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
        Wealth Projection Studio — SIP, Lumpsum &amp; SWP Calculator
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
        Model SIP, lumpsum and SWP investments with annual step-up, inflation adjustment and
        retirement income. Visualize compounding, wealth milestones and a year-by-year projection
        ledger in one institutional-grade studio.
      </p>
    </header>
    <nav aria-label="Calculators">
      <ul className="flex flex-wrap gap-3">
        <li>
          <a href="/sip-calculator" className="text-accent underline-offset-2 hover:underline">
            SIP Calculator
          </a>
        </li>
        {SIP_INTERNAL_LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="text-accent underline-offset-2 hover:underline">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </div>,
);

const homeHtml = injectIntoRoot(template, homeBody);
writeFileSync(resolve(DIST, 'index.html'), homeHtml);

// eslint-disable-next-line no-console
console.log('prerender: wrote dist/index.html and dist/sip-calculator.html');

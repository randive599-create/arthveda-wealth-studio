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
import { RetirementSeoContent } from '../src/pages/retirement/RetirementSeoContent';
import { RETIREMENT_META, buildRetirementFaqJsonLd } from '../src/pages/retirement/retirementContent';
import { SwpSeoContent } from '../src/pages/swp/SwpSeoContent';
import { SWP_META, buildSwpFaqJsonLd } from '../src/pages/swp/swpContent';
import { LumpsumSeoContent } from '../src/pages/lumpsum/LumpsumSeoContent';
import { LUMPSUM_META, buildLumpsumFaqJsonLd } from '../src/pages/lumpsum/lumpsumContent';
import { FireSeoContent } from '../src/pages/fire/FireSeoContent';
import { FIRE_META, buildFireFaqJsonLd } from '../src/pages/fire/fireContent';

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

// --- shared helpers for the additional calculator landing pages -------------

/** Render a landing page's static SEO body (header + long-form content). */
function renderLandingBody(
  eyebrow: string,
  title: string,
  intro: string,
  content: React.ReactElement,
): string {
  return renderToStaticMarkup(
    <div className="mx-auto w-full max-w-[1400px] space-y-8 px-5 py-10 sm:px-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          {intro}
        </p>
      </header>
      {content}
    </div>,
  );
}

/** Write a fully prerendered route HTML file: head + FAQ JSON-LD + body. */
function writeRoute(
  outFile: string,
  meta: { title: string; description: string; canonical: string },
  faqKey: string,
  faqJsonLd: string,
  bodyHtml: string,
): void {
  let html = setHead(template, {
    title: meta.title,
    description: meta.description,
    canonical: meta.canonical,
  });
  html = injectBeforeHeadClose(
    html,
    `<script type="application/ld+json" data-arthveda="${faqKey}">${faqJsonLd}</script>`,
  );
  html = injectIntoRoot(html, bodyHtml);
  writeFileSync(resolve(DIST, outFile), html);
}

// --- /retirement-calculator --------------------------------------------------

writeRoute(
  'retirement-calculator.html',
  RETIREMENT_META,
  'retirement-faq',
  buildRetirementFaqJsonLd(),
  renderLandingBody(
    'Retirement Calculator',
    'Retirement Calculator India — Plan Your Corpus & Retirement Income',
    'Estimate the corpus you need to retire and the monthly income it can sustain. Model your accumulation years, a post-retirement withdrawal phase, and inflation — powered by the ArthVeda projection engine.',
    <RetirementSeoContent />,
  ),
);

// --- /swp-calculator ---------------------------------------------------------

writeRoute(
  'swp-calculator.html',
  SWP_META,
  'swp-faq',
  buildSwpFaqJsonLd(),
  renderLandingBody(
    'SWP Calculator',
    'SWP Calculator — Systematic Withdrawal Plan & Monthly Income',
    'Model a Systematic Withdrawal Plan: draw a monthly income from your corpus, watch the remaining balance keep compounding, and see how long it lasts — powered by the ArthVeda projection engine.',
    <SwpSeoContent />,
  ),
);

// --- /lumpsum-calculator -----------------------------------------------------

writeRoute(
  'lumpsum-calculator.html',
  LUMPSUM_META,
  'lumpsum-faq',
  buildLumpsumFaqJsonLd(),
  renderLandingBody(
    'Lumpsum Calculator',
    'Lumpsum Calculator — One-Time Investment Growth Projection',
    'Project the future value of a one-time lumpsum investment with monthly compounding, and see your inflation-adjusted wealth — powered by the ArthVeda projection engine.',
    <LumpsumSeoContent />,
  ),
);

// --- /fire-calculator --------------------------------------------------------

writeRoute(
  'fire-calculator.html',
  FIRE_META,
  'fire-faq',
  buildFireFaqJsonLd(),
  renderLandingBody(
    'FIRE Calculator',
    'FIRE Calculator — Financial Independence & Early Retirement',
    'Estimate your path to Financial Independence, Retire Early. Model an aggressive savings plan, project your FI corpus, and see your inflation-adjusted target — powered by the ArthVeda projection engine.',
    <FireSeoContent />,
  ),
);

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
console.log(
  'prerender: wrote dist/index.html, dist/sip-calculator.html, dist/retirement-calculator.html, ' +
    'dist/swp-calculator.html, dist/lumpsum-calculator.html and dist/fire-calculator.html',
);

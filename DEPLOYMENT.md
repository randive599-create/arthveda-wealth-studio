# ArthVeda · Wealth Projection Studio — Deployment Guide

A fully client-side React + Vite single-page application. No backend, no
database, no environment variables, no API keys.

## Production build checklist

- [x] `npm run typecheck` — strict TypeScript, zero errors
- [x] `npm run lint` — ESLint, zero errors/warnings
- [x] `npm test` — 175 unit tests passing
- [x] `npm run build` — clean production build to `dist/`
- [x] Initial (index) chunk ~40 kB gzip; heavy libs (Recharts, jsPDF,
      html2canvas-pro) code-split and loaded on demand
- [x] SEO: title, meta description, canonical, robots, Open Graph, Twitter
      cards, and JSON-LD (WebApplication, Organization, FAQPage) present
- [x] `robots.txt` and `sitemap.xml` in `public/`
- [x] Top-level error boundary wraps the app
- [x] `<noscript>` fallback content for crawlers/no-JS

## Vercel deployment checklist

1. Import the repository into Vercel.
2. Framework preset: **Vite** (auto-detected; `vercel.json` is included).
3. Build command: `npm run build` · Output directory: `dist`.
4. No environment variables are required.
5. `vercel.json` provides the SPA rewrite (all routes → `/index.html`) and
   immutable caching for hashed assets and fonts.
6. The production domain is **https://arthvedawealth.in**. Absolute URLs in
   `index.html` (`canonical`, `og:url`, `og:image`, `twitter:image`, JSON-LD)
   and in `public/robots.txt` / `public/sitemap.xml` already point to it. Add an
   `og-image.png` (1200×630) to `public/` before launch.

## Domain configuration

**Primary (canonical) domain:** `https://arthvedawealth.in`

### DNS records required

| Type  | Name | Value                     | Notes                                  |
| ----- | ---- | ------------------------- | -------------------------------------- |
| A     | `@`  | `76.76.21.21`             | Vercel apex A record (or use ALIAS)    |
| CNAME | `www`| `cname.vercel-dns.com`    | Points the www host at Vercel          |

> If your DNS provider supports ALIAS/ANAME at the apex, point `@` to
> `cname.vercel-dns.com` instead of the A record. Use the exact target shown in
> the Vercel dashboard for this project.

### WWW redirect recommendation

Add both `arthvedawealth.in` and `www.arthvedawealth.in` as domains in Vercel,
set **`arthvedawealth.in` as the primary/canonical**, and configure
`www.arthvedawealth.in` to **301-redirect to `https://arthvedawealth.in`**.
This consolidates SEO signals on the canonical apex domain.

### HTTPS requirements

- HTTPS is mandatory. Vercel auto-provisions and renews TLS certificates for
  both the apex and www hosts.
- All application-generated links (share URLs, structured data, sitemap) use
  `https://`. The clipboard/`navigator.clipboard` share flow also requires a
  secure (HTTPS) context, which production satisfies.
- Enable "Automatically redirect HTTP to HTTPS" (Vercel default).

### Preferred canonical

`https://arthvedawealth.in` (apex, no `www`). The `<link rel="canonical">` tag,
Open Graph URL, Organization/WebApplication schema, and sitemap all reference
this exact origin.

## Environment requirements

- Node.js >= 20 (build only).
- Modern evergreen browser at runtime (ES2021). No server runtime.

## Dependency audit

Runtime: `react`, `react-dom`, `recharts`, `zustand`, `zod`, `lz-string`,
`lucide-react`, `jspdf`, `html2canvas-pro`. All are widely used, actively
maintained libraries. No native modules, no network calls at runtime.

## Final file structure

```
src/
├── engine/        Pure calculation engine (framework-free, fully tested)
├── state/         Zustand store, validation schema, defaults, selectors
├── share/         lz-string scenario codec + URL sync
├── format/        Currency/number formatting (Intl)
├── report/        PDF report model, layout, renderer, orchestration
├── components/    UI (layout, parameters, dashboard, charts, timeline,
│                  milestones, insights, table, report, faq, primitives)
├── lib/           Central data-testid registry
├── App.tsx        Composition root
└── main.tsx       Entry point (wrapped in ErrorBoundary)
public/            favicon, robots.txt, sitemap.xml
```

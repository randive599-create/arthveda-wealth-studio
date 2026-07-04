# ArthVeda Wealth Studio — Project Documentation

> **Version:** 1.0.0  
> **Domain:** https://arthvedawealth.in  
> **Last Updated:** July 2026  
> **Stack:** React 18 · TypeScript 5.6 · Vite 5 · Tailwind 4 · Zustand 5

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Pages & Calculators](#2-pages--calculators)
3. [Engine Architecture](#3-engine-architecture)
4. [State Management](#4-state-management)
5. [PDF Report Generation](#5-pdf-report-generation)
6. [Deployment](#6-deployment)
7. [SEO Architecture](#7-seo-architecture)
8. [Analytics Architecture](#8-analytics-architecture)
9. [Testing Strategy](#9-testing-strategy)
10. [Future Roadmap](#10-future-roadmap)

---


## 1. Folder Structure

```
arthveda-wealth-studio/
├── .env.example                  # Optional GA4 config (no required env vars)
├── .gitignore
├── .prettierrc                   # semi, singleQuote, trailingComma: all, 100 cols
├── DEPLOYMENT.md                 # Production deployment guide
├── PROJECT_DOCUMENTATION.md      # This file
├── eslint.config.js              # ESLint 9 flat config (ts-eslint)
├── index.html                    # SPA shell with full SEO head, JSON-LD schemas
├── package.json                  # Node >=20, scripts: dev/build/test/lint
├── package-lock.json
├── postcss.config.js             # @tailwindcss/postcss + autoprefixer
├── tsconfig.json                 # Strict TS, path alias @/ -> src/
├── tsconfig.node.json            # Vite config compilation
├── vercel.json                   # Rewrites, caching headers, framework: vite
├── vite.config.ts                # React plugin, recharts manual chunk, vitest config
│
├── public/
│   ├── favicon.svg               # Emerald "A" monogram (inline SVG)
│   ├── fonts/                    # Self-hosted woff2 (3 families, latin + latin-ext)
│   │   ├── cormorant-garamond-{600,700}-{latin,latin-ext}.woff2
│   │   ├── ibm-plex-mono-{500,600}-{latin,latin-ext}.woff2
│   │   └── work-sans-{400,500,600}-{latin,latin-ext}.woff2
│   ├── og-image.png              # 1200x630 Open Graph card
│   ├── og-image.svg              # Source vector for the OG image
│   ├── robots.txt                # Allow all, sitemap reference
│   └── sitemap.xml               # All 8 routes with priorities
│
├── scripts/
│   ├── fetch-fonts.mjs           # Downloads Google Fonts as self-hosted woff2
│   ├── prerender.tsx             # Post-build SSR for SEO (vite-node)
│   └── regenerate-report-fonts.py # Converts TTF -> base64 for PDF embedding
│
└── src/
    ├── main.tsx                  # Entry: StrictMode + ErrorBoundary + initAnalytics
    ├── App.tsx                   # Path-based router, lazy page loading
    ├── index.css                 # Tailwind 4 @theme tokens + global resets
    ├── vite-env.d.ts             # Vite client types
    │
    ├── analytics/
    │   ├── ga4.ts                # GA4 integration (Consent Mode v2, DNT-aware)
    │   └── __tests__/ga4.test.ts
    │
    ├── components/
    │   ├── charts/               # Recharts visualizations
    │   │   ├── ChartFrame.tsx    #   Reusable container (eyebrow/title/legend)
    │   │   ├── ChartSkeleton.tsx #   Loading placeholder
    │   │   ├── WealthDonut.tsx   #   Invested vs Returns pie chart
    │   │   ├── WealthMountain.tsx#   Hero area chart (phase bands)
    │   │   ├── WealthMountainTooltip.tsx
    │   │   └── chartTheme.ts     #   Shared hex colors, fonts, axis tick config
    │   ├── dashboard/
    │   │   ├── DashboardGrid.tsx #   4 metric cards + MetricsStrip
    │   │   ├── FinalCorpusCard.tsx#  Hero emerald card
    │   │   ├── MetricCard.tsx    #   Standard metric card
    │   │   └── MetricsStrip.tsx  #   Secondary metrics row
    │   ├── faq/
    │   │   ├── FaqSection.tsx    #   Accordion (native details/summary)
    │   │   ├── faqData.ts        #   18 FAQ entries (home page)
    │   │   ├── faqSchema.ts      #   FAQPage JSON-LD builder
    │   │   └── __tests__/faqSchema.test.ts
    │   ├── insights/
    │   │   ├── AIWealthInsights.tsx  # Insights section
    │   │   └── InsightCard.tsx       # Single insight card
    │   ├── layout/
    │   │   ├── AppShell.tsx      #   Two-variant responsive shell
    │   │   ├── BrandMark.tsx     #   SVG monogram
    │   │   ├── CalculatorNav.tsx #   Sitewide navigation
    │   │   ├── ErrorBoundary.tsx #   Top-level crash handler
    │   │   ├── StickySummaryBar.tsx # Sticky corpus/investment bar
    │   │   ├── StudioHeader.tsx  #   Brand hero section
    │   │   ├── TrustFooter.tsx   #   Disclaimer footer
    │   │   └── __tests__/
    │   ├── milestones/
    │   │   ├── MilestoneCountdown.tsx
    │   │   └── MilestoneRow.tsx
    │   ├── navigation/
    │   │   ├── ExploreCalculators.tsx  # Cross-link section
    │   │   └── __tests__/
    │   ├── parameters/
    │   │   └── ParametersPanel.tsx    # Home page input controls
    │   ├── primitives/
    │   │   ├── Card.tsx          #   Base card component
    │   │   ├── SectionHeading.tsx#   Eyebrow + title + description
    │   │   ├── SliderInput.tsx   #   Label + slider + number input
    │   │   ├── Switch.tsx        #   Toggle switch
    │   │   └── ToggleGroup.tsx   #   Segmented button group
    │   ├── report/
    │   │   ├── DownloadReportButton.tsx  # Progress-tracked PDF export
    │   │   └── ShareScenarioButton.tsx   # Clipboard share URL
    │   ├── table/
    │   │   ├── ProjectionTable.tsx       # Year-by-year ledger table
    │   │   └── projectionRows.ts         # Row builder for table + PDF
    │   └── timeline/
    │       └── WealthJourneyTimeline.tsx  # Lifecycle milestone nodes
    │
    ├── engine/                   # Pure calculation engine (no React, no DOM)
    │   ├── index.ts              #   buildProjection + public re-exports
    │   ├── types.ts              #   All domain types
    │   ├── constants.ts          #   Bounds, limits, defaults
    │   ├── rates.ts              #   Annual → monthly rate conversion
    │   ├── phases.ts             #   Phase resolution (accumulation/growth/withdrawal)
    │   ├── stepUp.ts             #   Annual step-up (% or fixed)
    │   ├── ledger.ts             #   Month-by-month simulation
    │   ├── aggregate.ts          #   Monthly → yearly snapshots
    │   ├── summary.ts            #   Dashboard headline metrics
    │   ├── composition.ts        #   Invested vs returns split
    │   ├── milestones.ts         #   Currency-aware milestone detection
    │   ├── timeline.ts           #   Lifecycle journey nodes
    │   ├── inflation.ts          #   Present-value deflation
    │   ├── insights.ts           #   Deterministic rules engine (15 rules)
    │   ├── insightFormat.ts      #   Insight-specific currency formatter
    │   └── __tests__/            #   Engine unit tests
    │
    ├── format/
    │   └── currency.ts           # Intl.NumberFormat wrappers (full, compact, %, x)
    │
    ├── lib/
    │   ├── calculators.ts        # Canonical calculator list (routes, labels)
    │   ├── path.ts               # getCurrentPath, isActivePath
    │   └── testids.ts            # Centralized data-testid registry
    │
    ├── pages/
    │   ├── about/                # /about-us
    │   ├── fire/                 # /fire-calculator
    │   ├── lumpsum/              # /lumpsum-calculator
    │   ├── retirement/           # /retirement-calculator
    │   ├── shared/               # useSeoHead (shared SEO hook)
    │   ├── sip/                  # /sip-calculator
    │   ├── sip-vs-stepup/        # /sip-vs-stepup-sip-calculator
    │   └── swp/                  # /swp-calculator
    │
    ├── report/                   # PDF generation infrastructure
    │   ├── generateReport.ts     #   Orchestrator (dynamic import, progress)
    │   ├── reportModel.ts        #   Pure model (ProjectionResult → ReportModel)
    │   ├── pdfRenderer.ts        #   jsPDF drawing commands
    │   ├── pageLayout.ts         #   A4 geometry, pagination math
    │   ├── captureChart.ts       #   html2canvas-pro wrapper
    │   ├── registerFonts.ts      #   VFS font registration
    │   └── fonts/
    │       └── reportFonts.ts    #   Base64-encoded IBM Plex Mono + Serif TTF
    │
    ├── share/                    # URL scenario sharing
    │   ├── codec.ts              #   Encode/decode (lz-string + short keys)
    │   ├── urlSync.ts            #   Read/write/build share URL
    │   └── version.ts            #   Payload version + migration
    │
    ├── state/                    # Application state
    │   ├── useStudioStore.ts     #   Zustand store (inputs → result)
    │   ├── schema.ts             #   Zod validation + clampInputs
    │   ├── defaults.ts           #   Default scenario + page presets
    │   ├── selectors.ts          #   Scoped state selectors
    │   └── __tests__/
    │
    └── styles/
        └── fonts.css             # @font-face declarations (self-hosted woff2)
```



---

## 2. Pages & Calculators

### 2.1 Home Page — Wealth Projection Studio (`/`)

The flagship experience. A full-featured, three-phase wealth projection studio.

**Layout:** AppShell `'studio'` variant — sticky 4/12 parameters column (left) + 8/12 studio column (right) with StickySummaryBar.

**State:** Reads/writes the global Zustand store (`useStudioStore`). Changes are debounced (120ms), then `buildProjection` runs and the URL is synced.

**Sections (in order):**
1. Share Scenario + Download Report buttons
2. DashboardGrid (4 metric cards + MetricsStrip)
3. WealthMountain chart (lazy)
4. WealthDonut chart (lazy)
5. WealthJourneyTimeline
6. MilestoneCountdown
7. AIWealthInsights
8. ProjectionTable (year-by-year ledger)
9. FaqSection (lazy)
10. ExploreCalculators

**Inputs:** Lumpsum, Monthly SIP, SIP Step-Up (% or fixed), Annual Return, Duration, SIP Stop Year, Withdrawal Start Year, Withdrawal Return, Monthly SWP, SWP Step-Up, Inflation toggle + rate, Currency, Mode.

---

### 2.2 SIP Calculator (`/sip-calculator`)

**Purpose:** Dedicated SIP projection with Basic/Advanced modes.

**Layout:** AppShell `'full'` variant. Internal 4/8 grid (sticky controls + results).

**State:** Own `useState<SipInputs>` — does NOT touch the global store.

**Model:** `sipModel.ts` → `computeSip(inputs)` → `SipResult`  
Calls `buildProjection` in accumulation mode, then derives:
- Maturity Value, Total Invested, Wealth Created, Total Gain %, Wealth Multiplier
- Inflation-Adjusted Corpus, Real Multiplier, Step-Up Benefit, XIRR/CAGR
- Year-by-year series for charts

**Unique features:**
- Quick-preset buttons (SIP amounts, durations)
- Monthly SIP comparison table (`SipComparison`)
- "How much SIP for ₹X Crore?" reverse calculation (`requiredMonthlySip`)
- Dedicated SIP PDF report (`sipReport.ts`)

---

### 2.3 Retirement Calculator (`/retirement-calculator`)

**Purpose:** Two-phase retirement planner (accumulation + drawdown).

**Model:** `retirementModel.ts` → `computeRetirement(inputs)` → `RetirementResult`

**Phases:**
1. **Accumulation** (current age → retirement age): corpus + SIP + step-up
2. **Drawdown** (retirement age → life expectancy 85): inflation-linked income withdrawal

**Key outputs:**
- Projected Corpus at Retirement
- Corpus Required (via linear interpolation of two reference drawdowns)
- Wealth Gap (shortfall/surplus)
- Income Sustainability (sustainable to age X)
- Inflation-Adjusted Monthly Need

---

### 2.4 SWP Calculator (`/swp-calculator`)

**Purpose:** Systematic Withdrawal Plan — how long does your money last?

**Model:** `swpModel.ts` → `computeSwp(inputs)` → `SwpResult`

**Key outputs:**
- Corpus Longevity (months)
- Total Withdrawals
- Remaining Corpus
- Inflation-Adjusted Income
- **Monte Carlo Survival Probability** (600 seeded paths, reproducible)

**Unique:** Uses a seeded PRNG (`mulberry32`) for deterministic Monte Carlo.

---

### 2.5 Lumpsum Calculator (`/lumpsum-calculator`)

**Purpose:** One-time investment growth projection.

**Model:** `lumpsumModel.ts` → `computeLumpsum(inputs)` → `LumpsumResult`

**Key outputs:**
- Final Corpus, Total Gain, CAGR, Wealth Multiplier
- Inflation-Adjusted Corpus
- Year-by-year growth series

---

### 2.6 FIRE Calculator (`/fire-calculator`)

**Purpose:** Financial Independence, Retire Early — are you on track?

**Model:** `fireModel.ts` → `computeFire(inputs)` → `FireResult`

**Key outputs:**
- FIRE Number Required (today's money: expenses / SWR)
- Inflation-Adjusted FIRE Number (at target age)
- Projected Corpus at FIRE Age
- Wealth Gap / Surplus
- On-Track indicator
- Year-by-year Corpus vs FIRE Number series

---

### 2.7 SIP vs Step-Up SIP (`/sip-vs-stepup-sip-calculator`)

**Purpose:** Compare flat SIP vs. stepped SIP to quantify the step-up benefit.

**Model:** `stepUpModel.ts` → `computeStepUp(inputs)` → `StepUpResult`

**Step-up methods:** Percentage OR fixed amount (togglable).

**Key outputs (unique ArthVeda insights):**
- Years Saved (how many extra years a flat SIP needs to match)
- Equivalent SIP (what flat SIP equals the stepped result)
- Wealth Acceleration % (step-up corpus / normal corpus - 1)
- Extra Wealth Created (difference in corpus)
- Year-by-year comparison series + table

---

### 2.8 About Page (`/about-us`)

Static informational page about ArthVeda Private Office. Organization JSON-LD.

---

### Page Architecture Pattern

Every calculator page follows the same pattern:

```
pages/{calculator}/
├── {Calculator}Page.tsx        # Route component (SEO shell, AppShell wrapper)
├── {Calculator}.tsx            # Calculator logic (local state, layout)
├── {Calculator}Controls.tsx    # Input panel (sliders, presets)
├── {calculator}Model.ts        # Pure model (no React — calls buildProjection)
├── {Calculator}Summary.tsx     # Output metric cards
├── {Calculator}Charts.tsx      # Recharts visualizations
├── {calculator}Report.ts       # Page-specific PDF generator
├── {calculator}Content.ts      # SEO metadata, FAQ entries, JSON-LD builders
├── {Calculator}SeoContent.tsx  # Long-form SEO body (prerendered)
├── {Calculator}ReportButton.tsx
└── __tests__/                  # Unit tests
```



---

## 3. Engine Architecture

The engine (`src/engine/`) is the mathematical core. It is **pure** (no React, no DOM, no I/O), **deterministic**, and **fully tested**. Every calculator on the site calls `buildProjection` — there is no duplicate math anywhere.

### 3.1 Entry Point

```typescript
function buildProjection(inputs: ProjectionInputs): ProjectionResult
```

### 3.2 Pipeline

```
inputs
  │
  ▼
runLedger(inputs)
  │  Month-by-month simulation (lumpsum → phase flow → compound)
  │  Returns: MonthRow[] + depletion flags
  ▼
aggregateYearly(monthly)
  │  Collapse 12 months → 1 year-end snapshot
  │  Returns: YearRow[]
  ▼
computeSummary(inputs, monthly, yearly)
  │  Headline metrics: totalInvestment, finalCorpus, multiplier, firstCroreYear
  │  Inflation-adjusted variants when enabled
  ▼
computeComposition(totalInvestment, totalReturns)
  │  Invested capital vs returns split (for donut chart)
  ▼
detectMilestones(monthly, currency)
  │  Currency-aware tier detection (INR: ₹10L→₹100Cr, USD: $100K→$25M)
  ▼
buildTimeline(inputs, yearly)
  │  Lifecycle journey nodes: start, SIP stop, withdrawal start, final
  ▼
buildInflationSeries(yearly, rate)  [if enabled]
  │  Per-year nominal vs real corpus
  ▼
generateInsights(result)
  │  15 deterministic rules, scored, top 5 returned
  │  Categories: opportunity, observation, risk
  ▼
ProjectionResult (the canonical output)
```

### 3.3 Ledger Simulation (`ledger.ts`)

For each month (1 to `durationYears * 12`):

1. **Month 1 only:** inject lumpsum
2. **Phase flow:**
   - `accumulation`: add stepped SIP → compound
   - `growth`: compound only
   - `withdrawal`: subtract stepped SWP (capped at balance) → compound
3. **Numerical safety:** corpus floored at 0, non-finite guarded

### 3.4 Phase Resolution (`phases.ts`)

```
Year <= sipStopYear                      → accumulation
sipStopYear < Year < withdrawalStartYear → growth
Year >= withdrawalStartYear              → withdrawal (income mode only)
```

Withdrawal always takes precedence at boundary overlaps.

### 3.5 Rate Conversion (`rates.ts`)

```
monthlyRate = (1 + annualRate/100)^(1/12) - 1
```

Exact monthly equivalent — twelve months of compounding reproduces the annual rate.

### 3.6 Step-Up (`stepUp.ts`)

```
percentage: amount = base * (1 + pct/100) ^ stepIndex
fixed:      amount = base + fixedAmount * stepIndex
```

Applied at the start of each year. `stepIndex = year - 1` for SIP, `year - withdrawalStartYear` for SWP.

### 3.7 Insights Engine (`insights.ts`)

A **deterministic rules engine** — not an LLM. Given a `ProjectionResult`, it:
1. Evaluates 15 independent rules → candidate insights with scores (0-100)
2. Sorts by score descending (tie-break: rule ID alphabetical)
3. Returns top 5 (minimum 3 guaranteed via baseline rules)

**Rule categories:**
- **Observations:** compounding share, contribution share, outcome summary, late growth, wealth multiplier, baseline horizon, methodology
- **Opportunities:** step-up opportunity, horizon extension, reduce withdrawals
- **Risks:** inflation erosion, corpus depletion, aggressive withdrawal rate, short accumulation

### 3.8 Types (`types.ts`)

Key domain types:
- `ProjectionInputs` — the 15+ validated parameters
- `ProjectionResult` — canonical output (monthly, yearly, summary, composition, milestones, timeline, inflation, insights, flags)
- `MonthRow` / `YearRow` — ledger snapshots
- `Phase` — `'accumulation' | 'growth' | 'withdrawal'`
- `Currency` — `'INR' | 'USD' | 'EUR'`
- `ProjectionMode` — `'accumulation' | 'income'`
- `Insight` — category, headline, explanation, score



---

## 4. State Management

### 4.1 Architecture

The home page uses a single **Zustand 5** store. Dedicated calculator pages manage their own local `useState`.

```
┌─────────────────────────────────────────────────────┐
│  useStudioStore (Zustand)                           │
│                                                     │
│  inputs: ProjectionInputs  ←── patchInputs(patch)   │
│      │                                              │
│      ▼ clampInputs(merged, defaults)                │
│      │                                              │
│      ▼ debounce(120ms)                              │
│      │                                              │
│      ├──▶ buildProjection(inputs)                   │
│      │       ▼                                      │
│      │   result: ProjectionResult                   │
│      │                                              │
│      └──▶ writeScenarioToUrl(inputs)                │
│           (history.replaceState)                    │
└─────────────────────────────────────────────────────┘
```

### 4.2 Store Actions

| Action | Description |
|--------|-------------|
| `patchInputs(patch)` | Merge partial, clamp, schedule recompute |
| `setInput(key, value)` | Set single field |
| `setCurrency(currency)` | Switch INR/USD/EUR |
| `setMode(mode)` | Toggle accumulation/income |
| `setSipStepUp(patch)` | Update SIP step-up config |
| `setSwpStepUp(patch)` | Update SWP step-up config |
| `setInflation(patch)` | Update inflation config |
| `loadScenario(raw)` | Replace all inputs (from shared URL) |
| `reset()` | Return to default scenario |
| `getShareableUrl()` | Build lz-string compressed URL |
| `flushRecompute()` | Force pending recompute immediately |

### 4.3 Validation (`schema.ts`)

Two entry points:
- **`validateInputs(raw)`** — strict Zod parse, throws on invalid (for tests)
- **`clampInputs(raw, base)`** — lenient coercion, never throws (for untrusted sources)

Cross-field rules enforced:
- `1 <= sipStopYear <= durationYears`
- In income mode: `sipStopYear <= withdrawalStartYear <= durationYears`

### 4.4 URL Sync (`share/`)

**Encoding:** `ProjectionInputs` → short-key JSON → lz-string URI component → `?s=` param

**Decoding:** `?s=` → decompress → parse JSON → `migrateEncoded` (version check) → partial object → `clampInputs` → safe `ProjectionInputs`

The version field (`v: 1`) enables forward-compatible URL schema evolution.

### 4.5 Route Presets (`defaults.ts`)

Each calculator route opens with a tailored preset:
- `/` → `DEFAULT_INPUTS` (3-phase, ₹25K SIP, 30y, inflation on)
- `/sip-calculator` → `SIP_CALCULATOR_PRESET` (₹10K, 10% step-up, 20y, no withdrawal)
- `/retirement-calculator` → `RETIREMENT_CALCULATOR_PRESET` (₹30K SIP, 40y, SWP)
- `/swp-calculator` → `SWP_CALCULATOR_PRESET` (₹1Cr corpus, ₹50K/mo withdrawal)
- `/lumpsum-calculator` → `LUMPSUM_CALCULATOR_PRESET` (₹10L, 12%, 20y)
- `/fire-calculator` → `FIRE_CALCULATOR_PRESET` (₹50K SIP, aggressive)

### 4.6 Selectors (`selectors.ts`)

Scoped selectors prevent unnecessary re-renders:
```typescript
selectInputs, selectResult, selectSummary, selectYearly, selectMonthly,
selectComposition, selectMilestones, selectTimeline, selectInsights,
selectInflationSeries, selectFlags, selectCurrency, selectMode
```



---

## 5. PDF Report Generation

### 5.1 Architecture

```
User clicks "Download Report"
    │
    ▼
DownloadReportButton.tsx
    │  Dynamic import (keeps jsPDF out of initial bundle)
    ▼
generateReport.ts (orchestrator)
    │
    ├──▶ buildReportModel(result, now)
    │       Pure transform: ProjectionResult → ReportModel
    │       (cover, summary, assumptions, timeline, milestones,
    │        insight groups, ledger rows — all pre-formatted)
    │
    ├──▶ captureChart(mountainEl)  +  captureChart(donutEl)
    │       html2canvas-pro at 2x resolution → PNG data URLs
    │       Best-effort: missing charts don't fail the report
    │
    ├──▶ factory() → jsPDF document
    │       A4 portrait, points unit, embedded Unicode fonts
    │
    ├──▶ renderReport(model, charts, factory)
    │       pdfRenderer.ts — draws all pages with native vector API
    │
    └──▶ doc.save(filename)
         File: ArthVeda-Wealth-Projection-YYYY-MM-DD.pdf
```

### 5.2 Report Sections (8 pages+)

1. **Cover** — Brand lockup, report title, generation date, currency
2. **Section 1: Projection Summary** — Key metrics table
3. **Section 2: Planning Assumptions** — All input parameters
4. **Section 3: Wealth Mountain** — Captured chart image
5. **Section 4: Wealth Composition** — Captured donut + compounding sentence
6. **Section 5: Wealth Journey Timeline** — Lifecycle nodes table
7. **Section 6: Milestone Achievement** — Currency-aware milestones
8. **Section 7: AI Wealth Insights** — Grouped by category (opportunities, observations, risks)
9. **Section 8: Projection Ledger** — Year-by-year table (paginated, repeating headers)

### 5.3 Page Layout (`pageLayout.ts`)

- A4: 595.28 x 841.89 points
- Margins: top/bottom 56pt, left/right 48pt
- Footer zone: 28pt (disclaimer + page number + brand line)
- Ledger row height: 18pt, header: 26pt
- Pagination is deterministic and unit-testable without jsPDF

### 5.4 Font Embedding (`registerFonts.ts`)

jsPDF's built-in fonts are WinAnsi and **cannot render ₹ (U+20B9)**. Solution:
- IBM Plex Mono TTF + IBM Plex Serif TTF are converted to base64
- Registered in jsPDF's Virtual File System at document creation
- Both `'normal'` and `'bold'` styles map to the same TTF (single-weight subsets)
- This enables jsPDF's UTF-8 text path for correct ₹ and digit spacing

### 5.5 Chart Capture (`captureChart.ts`)

- Uses `html2canvas-pro` (supports modern CSS color functions from Tailwind v4)
- Scale: 2x for crisp PDF output
- Background: white (#ffffff)
- Located by `data-testid` attribute on the chart wrapper DOM node
- Returns `{ dataUrl, width, height }` for aspect-ratio-preserved embedding

### 5.6 Page-Specific Reports

Each dedicated calculator also generates its own simpler PDF:
- `sipReport.ts` → "SIP Projection Report"
- `retirementReport.ts` → "Retirement Planning Report"
- `swpReport.ts` → "SWP Projection Report"
- `lumpsumReport.ts` → "Lumpsum Projection Report"
- `fireReport.ts` → "FIRE Projection Report"
- `stepUpReport.ts` → "SIP vs Step-Up Report"

These reuse the shared page layout, font registration, and formatting utilities.

### 5.7 Testing

The renderer accepts an injected `PdfFactory` interface, so tests provide a lightweight recording fake instead of bundling jsPDF into the test environment.



---

## 6. Deployment

### 6.1 Platform

**Vercel** — auto-deployed on push to main. No backend, no database, no API keys.

### 6.2 Build Pipeline

```bash
npm run build
# Internally runs:
#   1. tsc -b              (TypeScript project references)
#   2. vite build          (Rollup bundle → dist/)
#   3. npm run prerender   (vite-node scripts/prerender.tsx → static HTML)
```

**Output:** `dist/` directory with:
- `index.html` (prerendered home)
- `sip-calculator.html`, `retirement-calculator.html`, etc. (prerendered routes)
- `assets/` (hashed JS/CSS chunks)
- Static files from `public/`

### 6.3 Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/sip-calculator", "destination": "/sip-calculator.html" },
    { "source": "/retirement-calculator", "destination": "/retirement-calculator.html" },
    { "source": "/swp-calculator", "destination": "/swp-calculator.html" },
    { "source": "/lumpsum-calculator", "destination": "/lumpsum-calculator.html" },
    { "source": "/fire-calculator", "destination": "/fire-calculator.html" },
    { "source": "/sip-vs-stepup-sip-calculator", "destination": "/sip-vs-stepup-sip-calculator.html" },
    { "source": "/about-us", "destination": "/about-us.html" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    { "source": "/fonts/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

**Key points:**
- Explicit rewrites serve prerendered HTML for SEO routes (before SPA fallback)
- Fonts and hashed assets get immutable caching (1 year)
- The SPA fallback (`/(.*) → /index.html`) handles any unmatched route

### 6.4 Domain Configuration

| Record | Name | Value | Purpose |
|--------|------|-------|---------|
| A | `@` | `76.76.21.21` | Vercel apex |
| CNAME | `www` | `cname.vercel-dns.com` | www subdomain |

- **Canonical:** `https://arthvedawealth.in` (apex, no www)
- **www** → 301 redirect to apex
- HTTPS: auto-provisioned by Vercel (Let's Encrypt)

### 6.5 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_GA4_MEASUREMENT_ID` | No | (empty) | GA4 Measurement ID (`G-XXXXXXXXXX`) |
| `VITE_GA4_DEFAULT_CONSENT` | No | `denied` | Default analytics consent state |

No env vars are required for the application to function. GA4 is entirely optional.

### 6.6 Bundle Analysis

| Chunk | Size (gzip) | Load Strategy |
|-------|-------------|---------------|
| Initial (shell + engine + state) | ~40 kB | Immediate |
| Recharts | ~45 kB | Lazy (on chart visibility) |
| jsPDF + html2canvas-pro | ~120 kB | Dynamic import (on report click) |
| Calculator page (each) | ~5-15 kB | Lazy (on route navigation) |

### 6.7 Pre-Deployment Checklist

- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero errors/warnings
- [ ] `npm test` — all tests passing
- [ ] `npm run build` — clean production build
- [ ] Verify prerendered HTML files exist in `dist/`
- [ ] Test shared URL decoding (paste a `?s=` URL, confirm it hydrates)



---

## 7. SEO Architecture

### 7.1 Multi-Layer Strategy

ArthVeda implements SEO at four layers, ensuring visibility to both JavaScript-executing and non-executing crawlers:

```
Layer 1: Static HTML Shell (index.html)
    │  Full <head> with meta, OG, Twitter, JSON-LD (WebApplication + Organization)
    │  Font preloads, <noscript> fallback
    │
Layer 2: Post-Build Prerender (scripts/prerender.tsx)
    │  Generates route-specific .html files with:
    │  - Route-specific <title>, description, canonical, OG
    │  - FAQPage JSON-LD baked into <head>
    │  - Full SEO body content (headings, copy, tables, FAQ accordion)
    │  - Engine-computed example data (not hand-written)
    │
Layer 3: Client-Side Hydration (useSeoHead)
    │  Updates meta tags when React hydrates (ensures SPA navigation works)
    │
Layer 4: Per-Page Content Modules ({page}Content.ts)
       FAQ entries, meta objects, JSON-LD builders, example tables
```

### 7.2 Prerender Script (`scripts/prerender.tsx`)

Runs as the final build step via `vite-node`. For each route:
1. Reads the SPA shell (`dist/index.html`) as a template
2. Replaces `<title>`, meta description, canonical, OG, Twitter tags
3. Injects FAQPage JSON-LD into `<head>`
4. Renders a React component (`SipSeoContent`, etc.) with `renderToStaticMarkup`
5. Injects the rendered HTML into `<div id="root">`
6. Writes the route-specific `.html` file (e.g., `dist/sip-calculator.html`)

The interactive React app still boots and replaces the prerendered content on load.

### 7.3 Structured Data (JSON-LD)

| Route | Schema Types |
|-------|-------------|
| All (index.html) | WebApplication, Organization |
| `/sip-calculator` | FAQPage (10 entries) |
| `/retirement-calculator` | FAQPage (10 entries) |
| `/swp-calculator` | FAQPage (10 entries) |
| `/lumpsum-calculator` | FAQPage (10 entries) |
| `/fire-calculator` | FAQPage (10 entries) |
| `/sip-vs-stepup-sip-calculator` | FAQPage + BreadcrumbList |
| `/about-us` | Organization |
| `/` (home FAQ) | FAQPage (18 entries, client-injected) |

### 7.4 Sitemap & Robots

**`public/sitemap.xml`** — lists all 8 routes with priorities (1.0 home, 0.9 calculators, 0.6 about).

**`public/robots.txt`** — `Allow: /` for all user agents, sitemap reference.

### 7.5 Technical SEO Details

- **Canonical URLs:** explicitly set on every page, all point to `https://arthvedawealth.in/...`
- **Self-hosted fonts:** eliminates render-blocking Google Fonts request (major FCP/LCP win)
- **Font preloads:** only the 2 above-the-fold fonts (Cormorant 700, Work Sans 400)
- **`<noscript>` fallback:** provides content description when JS is disabled
- **`font-display: swap`:** text paints immediately with system fallback
- **Immutable asset caching:** hashed filenames → 1 year cache (zero re-downloads)



---

## 8. Analytics Architecture

### 8.1 Design Philosophy

- **Privacy-first:** no tracking by default
- **Environment-driven:** GA4 only activates when `VITE_GA4_MEASUREMENT_ID` is set
- **GDPR-compliant:** Consent Mode v2, all storage denied by default
- **DNT/GPC-aware:** respects browser Do-Not-Track and Global Privacy Control
- **No cookies:** runs in cookieless mode until explicit consent

### 8.2 Implementation (`src/analytics/ga4.ts`)

```typescript
// Initialization (main.tsx)
initAnalytics(); // No-op unless env var is set

// Consent management (future banner)
getAnalytics()?.setConsent(true);  // Upgrades to full tracking

// Custom events
getAnalytics()?.trackEvent('download_report', { format: 'pdf' });

// Page views (SPA navigation)
getAnalytics()?.trackPageView('/sip-calculator');
```

### 8.3 Consent Configuration

| Storage Type | Default | After Consent |
|-------------|---------|---------------|
| `analytics_storage` | denied | granted |
| `ad_storage` | denied | denied |
| `ad_user_data` | denied | granted |
| `ad_personalization` | denied | denied |
| `functionality_storage` | denied | denied |
| `personalization_storage` | denied | denied |
| `security_storage` | granted | granted |

### 8.4 Safety Mechanisms

- **No valid ID?** → `DISABLED` controller returned (all methods are no-ops)
- **No DOM (SSR)?** → `DISABLED` controller
- **DNT/GPC active?** → `DISABLED` controller
- **Double init?** → singleton pattern prevents duplicate script injection
- **`wait_for_update: 500`** — gives a consent banner 500ms to fire before events

### 8.5 Measurement ID Validation

Must match pattern: `/^G-[A-Z0-9]{4,}$/i`

### 8.6 Testing

The GA4 module accepts injectable `window` and `document` objects, enabling unit tests without a real browser or Google endpoint. See `src/analytics/__tests__/ga4.test.ts`.



---

## 9. Testing Strategy

### 9.1 Framework & Configuration

- **Runner:** Vitest 2.x
- **Environment:** Node (not jsdom — most tests are pure logic)
- **Setup:** `vitest.setup.ts`
- **Globals:** enabled (`describe`, `it`, `expect` without imports)
- **Coverage:** V8 provider, focused on `src/engine/**` and `src/state/**`

### 9.2 Test Scope

| Domain | What's Tested | Strategy |
|--------|---------------|----------|
| Engine (`src/engine/`) | All calculations | Pure function tests — given inputs, assert outputs |
| State (`src/state/`) | Store behavior, schema validation, clamping | Create isolated store instances (sync recompute, no URL sync) |
| Analytics | GA4 init, consent, DNT, event tracking | Injectable window/document mocks |
| Components | Navigation, FAQ schema, AppShell rendering | @testing-library/react |
| Reports | Report model generation | Pure function tests (no real jsPDF) |

### 9.3 Running Tests

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

### 9.4 Test Conventions

1. **Location:** `__tests__/` directories colocated with source
2. **Naming:** `{module}.test.ts` or `{component}.test.tsx`
3. **Isolation:** Engine tests never import React; component tests use Testing Library
4. **Determinism:** The engine is fully deterministic — same inputs always yield same outputs
5. **Store tests:** Use `createStudioStore({ debounceMs: 0, enableUrlSync: false })` for synchronous, isolated instances
6. **Report tests:** Use an injected `PdfFactory` fake — no real PDF rendering in test

### 9.5 Coverage Targets

The coverage configuration explicitly includes:
- `src/engine/**` — the mathematical core (highest priority)
- `src/state/**` — store logic and validation

UI components are tested for structural correctness but not exhaustive visual regression.

### 9.6 CI Integration

Tests run as part of the pre-deployment checklist:
```bash
npm run typecheck && npm run lint && npm test && npm run build
```

All must pass before deployment proceeds.



---

## 10. Future Roadmap

### 10.1 Near-Term Enhancements

| Feature | Complexity | Notes |
|---------|-----------|-------|
| **Cookie consent banner** | Low | Call `getAnalytics()?.setConsent(true)` on accept |
| **Dark mode** | Medium | CSS custom properties already in `@theme`; add toggle + prefers-color-scheme |
| **Goal-based planning** | Medium | "I want ₹5 Cr in 20 years" → reverse-solve the SIP required |
| **Tax calculator** | Medium | LTCG/STCG for equity MFs (rules change; keep updateable) |
| **Multi-scenario comparison** | Medium | Side-by-side two projections on one chart |
| **Mobile app (PWA)** | Low | Add manifest.json, service worker for offline |
| **Accessibility audit** | Low | Semantic HTML is in place; add ARIA landmarks review |

### 10.2 Medium-Term Features

| Feature | Complexity | Notes |
|---------|-----------|-------|
| **Monte Carlo simulation** | Medium | Already implemented for SWP; extend to all calculators |
| **Historical backtesting** | High | Requires return data; show "what if you started in year X" |
| **Asset allocation modeling** | High | Multiple asset classes with rebalancing |
| **EMI / Loan calculator** | Medium | Same engine pattern (new page + model) |
| **Expense planner** | Medium | Track spending categories against projected income |
| **Multi-language (i18n)** | High | Extract all strings; add Hindi, Marathi support |

### 10.3 Technical Debt & Improvements

| Item | Priority | Notes |
|------|----------|-------|
| **Client-side router** | Low | Currently full page loads; React Router would enable transitions |
| **E2E tests (Playwright)** | Medium | Critical paths: input → output, PDF download, URL share |
| **Storybook** | Low | Document primitives and chart components visually |
| **Bundle size monitoring** | Low | Track regressions with `bundlesize` or similar |
| **URL schema v2** | Low | When inputs expand, bump `SCENARIO_VERSION` and add migration |
| **Server-side rendering** | Low | Prerender covers SEO; true SSR only needed for dynamic OG images |
| **Report caching** | Low | Store last-generated PDF blob to avoid re-rendering on re-download |

### 10.4 Adding a New Calculator (Step-by-Step)

1. **Create the page directory:** `src/pages/{name}/`
2. **Create the model:** `{name}Model.ts` — pure function calling `buildProjection`
3. **Create the page components:** `{Name}Page.tsx`, `{Name}Calculator.tsx`, `{Name}Controls.tsx`, `{Name}Summary.tsx`, `{Name}Charts.tsx`
4. **Create SEO content:** `{name}Content.ts` (meta, FAQ, JSON-LD), `{Name}SeoContent.tsx`
5. **Create the report:** `{name}Report.ts` (reuse shared page layout + fonts)
6. **Register the route:**
   - Add lazy import in `App.tsx` → `ROUTES` map
   - Add entry in `src/lib/calculators.ts` → `CALCULATORS` + `NAV_ITEMS`
   - Add rewrite in `vercel.json`
   - Add URL in `public/sitemap.xml`
   - Add prerender call in `scripts/prerender.tsx`
7. **Add preset (optional):** `src/state/defaults.ts` → `ROUTE_PRESETS` in store
8. **Write tests:** engine model tests + any component tests
9. **Verify:** `npm run build` → check `dist/{name}.html` exists with full SEO content

---

## Appendix A: Design System Tokens

Defined in `src/index.css` via Tailwind 4 `@theme`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-canvas` | `#ffffff` | Page background |
| `--color-ink` | `#111827` | Primary text |
| `--color-ink-secondary` | `#4b5563` | Secondary text |
| `--color-accent` | `#064e3b` | Brand emerald |
| `--color-accent-hover` | `#047857` | Interactive hover |
| `--color-accent-wash` | `#ecfdf5` | Faint emerald fill |
| `--color-returns` | `#10b981` | Returns data series |
| `--color-invested` | `#9ca3af` | Invested capital series |
| `--color-risk` | `#d97706` | Risk accent (amber) |
| `--color-hairline` | `#e5e7eb` | Borders |
| `--color-mist` | `#f9fafb` | Subtle fills |
| `--font-heading` | Cormorant Garamond, Georgia, serif | Headlines |
| `--font-body` | Work Sans, system-ui, sans-serif | Body text |
| `--font-mono` | IBM Plex Mono, ui-monospace, monospace | Data, labels |
| `--radius-card` | 8px | Card corners |
| `--radius-control` | 6px | Button/input corners |

---

## Appendix B: Key Commands Reference

```bash
# Development
npm run dev              # Vite dev server (hot reload)
npm run preview          # Preview production build locally

# Build
npm run build            # Full production build (typecheck + vite + prerender)
npm run prerender        # Only the prerender step (requires dist/ from vite build)

# Quality
npm run typecheck        # TypeScript strict check (no emit)
npm run lint             # ESLint
npm run format           # Prettier (write mode)

# Testing
npm test                 # Vitest single run
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Vitest with V8 coverage

# Utilities
npx vite-node scripts/prerender.tsx           # Run prerender manually
npx vite-node scripts/fetch-fonts.mjs         # Re-download self-hosted fonts
python scripts/regenerate-report-fonts.py     # Regenerate base64 TTF for PDF
```

---

## Appendix C: Dependency Inventory

### Runtime Dependencies

| Package | Purpose | Loaded |
|---------|---------|--------|
| `react` / `react-dom` | UI framework | Immediate |
| `zustand` | State management (home page store) | Immediate |
| `zod` | Input validation + schema | Immediate |
| `lz-string` | URL scenario compression | Immediate |
| `lucide-react` | Icon library (tree-shaken) | Immediate |
| `recharts` | Chart visualizations | Lazy (own chunk) |
| `jspdf` | PDF generation | Dynamic import (on demand) |
| `html2canvas-pro` | Chart rasterization for PDF | Dynamic import (on demand) |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| `vite` + `@vitejs/plugin-react` | Build tooling |
| `typescript` | Type checking |
| `tailwindcss` + `@tailwindcss/postcss` + `autoprefixer` | Styling |
| `vitest` + `@vitest/coverage-v8` | Testing |
| `@testing-library/react` + `@testing-library/jest-dom` | Component testing |
| `jsdom` | DOM environment for component tests |
| `eslint` + `typescript-eslint` | Linting |
| `prettier` | Code formatting |
| `vite-node` | Script runner (prerender) |

---

*End of documentation. For questions, contact info@arthvedawealth.in.*

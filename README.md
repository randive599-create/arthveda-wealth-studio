# ArthVeda Wealth Studio

Institutional-grade wealth projection studio for long-term investors. Model
accumulation, growth, preservation, and income in a single deterministic engine.

> Illustrative wealth projections for long-term planning. Not investment advice.

---

## Status

This repository currently contains the **foundation layer** (Phase 1):

- Complete project configuration (Vite + React + TypeScript + Tailwind v4).
- Pure, framework-free **calculation engine** (`src/engine`).
- **Validation rules** for all inputs (`src/state/schema.ts`).
- A full **Vitest unit-test suite** for the engine and validation.

UI, charts, dashboard, PDF export, URL sharing, and AI insights are **not yet
built** — the calculation engine is intentionally implemented and verified first.

---

## Architecture (foundation)

```
src/
├── engine/        Pure calculation engine (no React, no DOM, no I/O)
│   ├── types.ts          Domain types (inputs, ledger rows, results)
│   ├── constants.ts      Hard limits and defaults
│   ├── rates.ts          Monthly compounding rate conversion
│   ├── phases.ts         Accumulation / growth / withdrawal phase resolution
│   ├── stepUp.ts         Start-of-year SIP & SWP step-up logic
│   ├── ledger.ts         Month-by-month simulation (the single source of truth)
│   ├── aggregate.ts      Monthly ledger -> year-end snapshots
│   ├── inflation.ts      Present-value (Year 0) deflation
│   ├── milestones.ts     Currency-aware wealth milestone detection
│   ├── composition.ts    Invested-vs-returns split
│   ├── summary.ts        Dashboard aggregate metrics
│   └── index.ts          buildProjection(inputs) orchestrator
└── state/
    ├── schema.ts         Zod validation + safe clamping of raw inputs
    └── defaults.ts       Default institutional scenario
```

### Calculation model (locked decisions)

- **Monthly compounding:** `monthlyRate = (1 + annualRate/100)^(1/12) - 1`.
- **Three phases**, resolved per calendar year:
  - Accumulation (`year <= sipStopYear`): lumpsum (month 1) + monthly SIP, then growth.
  - Growth (`sipStopYear < year < withdrawalStartYear`): compounding only.
  - Withdrawal (`year >= withdrawalStartYear`): monthly SWP, then growth at the
    withdrawal-phase rate. Withdrawal takes precedence when ranges meet.
- **Start-of-year step-up:** the increased SIP/SWP amount applies from the first
  contribution/withdrawal of the new year (e.g. Yr1 25,000 -> Yr2 27,500 at 10%).
- **Order of operations:** contribute/withdraw at the start of the month, then
  apply that month's growth (annuity-due convention).
- **Corpus is floored at zero.** If a withdrawal cannot be fully met, only the
  remaining balance is paid out and the projection is flagged as depleted.
- **Inflation** is reported as present value relative to Year 0:
  `realValue = futureValue / (1 + inflationRate/100)^years`.
- **Milestones** are currency-aware: INR uses Lakh/Crore tiers ("Crorepati
  Countdown"); USD/EUR use 100K/250K/500K/1M/5M tiers ("Milestone Countdown").

---

## Getting started

Requires Node.js >= 20.

```bash
npm install
```

### Run the test suite

```bash
npm test            # single run (CI mode)
npm run test:watch  # watch mode
npm run test:coverage
```

### Type-check

```bash
npm run typecheck
```

---

## Deployment

The application is a static SPA and deploys to Vercel with zero configuration
beyond `vercel.json` (already included). No backend or environment variables are
required.

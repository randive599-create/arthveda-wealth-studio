/**
 * Learn section — content model, registry, SEO metadata and structured-data
 * builders.
 *
 * This is the single source of truth for the /learn knowledge base:
 *   - Categories (used by the Learn homepage cards).
 *   - The article registry (data-only; each article's body is structured so the
 *     Table of Contents, schema, and reading view are all generated from one
 *     object — no MDX, no extra dependencies).
 *   - Helpers for published/draft filtering, lookups, and grouping.
 *   - SEO meta + JSON-LD builders (WebPage/CollectionPage, Article, Breadcrumb,
 *     optional FAQPage) shared by the client `useSeoHead` hook and the static
 *     prerender.
 *
 * PUBLISHING STATUS: `what-is-sip` is a fully-written, published article. Any
 * entry still marked `status: 'draft'` (e.g. `sip-vs-lumpsum`) is a work in
 * progress — drafts are excluded from prerendering, the sitemap, and every
 * public listing, so they never appear in production until published.
 */

import type { FaqEntry } from '../../components/faq/faqData';

export const LEARN_WEBSITE = 'https://arthvedawealth.in';

/* -------------------------------------------------------------------------- */
/* Author (mandatory — E-E-A-T for a YMYL financial site)                     */
/* -------------------------------------------------------------------------- */

/**
 * Every article MUST attribute a named author. This is a Google E-E-A-T
 * requirement for Your-Money-or-Your-Life (financial) content and feeds both
 * the on-page byline and the Article JSON-LD `author` (as a schema.org Person).
 */
export interface ArticleAuthor {
  /** Full display name, e.g. "Suyog Randive". */
  name: string;
  /** Role / title, e.g. "Founder, ArthVeda Wealth Studio". */
  role: string;
  /** Short bio (1–2 sentences) shown in the "About the author" byline. */
  bio: string;
}

/**
 * Default author for ArthVeda editorial content. New articles can reuse this or
 * supply their own author. Deliberately avoids advisory credentials (no
 * "Financial Advisor" / "SEBI Registered" claims) — see the About page tone.
 */
export const DEFAULT_AUTHOR: ArticleAuthor = {
  name: 'Suyog Randive',
  role: 'Founder, ArthVeda Wealth Studio',
  bio:
    'Independent creator of ArthVeda Wealth Studio. Passionate about financial planning and ' +
    'building practical, transparent tools that help Indian investors make better decisions.',
};

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

export type LearnCategoryId =
  | 'getting-started'
  | 'sip-mutual-funds'
  | 'retirement'
  | 'fire'
  | 'withdrawals';

export interface LearnCategory {
  id: LearnCategoryId;
  label: string;
  description: string;
}

export const LEARN_CATEGORIES: LearnCategory[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    description: 'Foundational concepts for new investors — compounding, inflation, and goals.',
  },
  {
    id: 'sip-mutual-funds',
    label: 'SIP & Mutual Funds',
    description: 'How systematic investing, step-ups, and lumpsum strategies build wealth.',
  },
  {
    id: 'retirement',
    label: 'Retirement Planning',
    description: 'Sizing the corpus you need and the income it can sustain through retirement.',
  },
  {
    id: 'fire',
    label: 'FIRE & Independence',
    description: 'Financial Independence, safe withdrawal rates, and the FIRE number.',
  },
  {
    id: 'withdrawals',
    label: 'Withdrawals & Income',
    description: 'Drawing a sustainable income from your corpus with a Systematic Withdrawal Plan.',
  },
];

/* -------------------------------------------------------------------------- */
/* Article model                                                              */
/* -------------------------------------------------------------------------- */

/**
 * A single content block within an article section. Extensible over time.
 *
 * - `paragraph` / `list` / `callout` — plain prose blocks.
 * - `table`    — a simple data table (header row + rows), rendered responsively.
 * - `cta`      — a contextual call-to-action linking to an ArthVeda calculator.
 *                `calculatorPath` is resolved against the shared CALCULATORS
 *                registry, so routing, labels and styling stay consistent with
 *                the rest of the site (a real internal <a href>, crawlable for
 *                SEO — never a raw Markdown link inside prose).
 * - `illustration` — a named, lightweight inline SVG (see the illustrations
 *                registry). Data stays serializable (just a `name`); the SVG
 *                component is resolved at render time.
 */
export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  /** An H3 subheading within a section (preserves H2 › H3 hierarchy). */
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'callout'; text: string }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }
  | {
      type: 'cta';
      text: string;
      /** Calculator route — its label/path are resolved from the CALCULATORS registry. */
      calculatorPath?: string;
      /** Any other internal ArthVeda path (e.g. /calculator-methodology). Requires `label`. */
      href?: string;
      /** Link label. Optional for `calculatorPath` (defaults to the calculator name); required for `href`. */
      label?: string;
    }
  | { type: 'illustration'; name: LearnIllustrationName; caption?: string };

/** Names of the inline SVG illustrations available to articles. */
export type LearnIllustrationName = 'sip-flow' | 'compounding-timeline' | 'rupee-cost-averaging';

/** A titled article section. Its `id` is the anchor target used by the ToC. */
export interface ArticleSection {
  id: string;
  heading: string;
  blocks: ArticleBlock[];
}

/** An external (or internal) reference/source shown at the end of an article. */
export interface ArticleReference {
  label: string;
  url?: string;
}

export type ArticleStatus = 'draft' | 'published';

export interface LearnArticle {
  /** URL slug: /learn/<slug>. */
  slug: string;
  /** Only `published` articles are prerendered, listed, and added to the sitemap. */
  status: ArticleStatus;
  category: LearnCategoryId;

  /** On-page H1. */
  title: string;
  /** Full <title> for SEO (falls back to `title` if omitted at call sites). */
  seoTitle: string;
  /** Meta description / hero summary source. */
  description: string;
  /** Lead paragraph shown in the hero. */
  heroSummary: string;

  /** ISO dates (YYYY-MM-DD). */
  datePublished: string;
  dateModified: string;
  /** Estimated reading time in minutes (shown in the hero meta row). */
  readingMinutes: number;

  /** Body — drives both the reading view and the Table of Contents. */
  sections: ArticleSection[];
  /** 3–6 short, scannable takeaways. */
  keyTakeaways: string[];
  /** Optional FAQ — emits FAQPage JSON-LD when present. */
  faqs?: FaqEntry[];

  /** Calculator paths (into CALCULATORS) surfaced as "Related Calculators". */
  relatedCalculators?: string[];
  /** Slugs of other articles surfaced as "Related Articles". */
  relatedArticles?: string[];
  /** Sources / further reading. */
  references?: ArticleReference[];

  /**
   * Article author (MANDATORY). Full name, role and a short bio are required so
   * every guide is transparently attributed. `dateModified` (last updated) and
   * `readingMinutes` (reading time) above complete the editorial by-line.
   */
  author: ArticleAuthor;
}

/* -------------------------------------------------------------------------- */
/* Registry (`what-is-sip` published; `sip-vs-lumpsum` still a draft)          */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_NOTE =
  'This is placeholder content created during development to validate the article template. ' +
  'It will be replaced with fully-researched editorial content before this article is published.';

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    slug: 'what-is-sip',
    status: 'published',
    category: 'sip-mutual-funds',
    title: 'What Is SIP? A Beginner\u2019s Guide to Systematic Investment Plans in India',
    seoTitle: 'What Is SIP? A Beginner\u2019s Guide to SIP Investing in India | ArthVeda Wealth Studio',
    description:
      'New to investing? Learn what a SIP (Systematic Investment Plan) is, how it works, and why ' +
      'it suits beginners in India — explained simply, with easy rupee examples.',
    heroSummary:
      'A SIP lets you invest a small, fixed amount in a mutual fund at regular intervals instead ' +
      'of one large sum. This beginner-friendly guide explains what a SIP really is, how it works, ' +
      'and what to keep in mind before you start — in plain English, with simple rupee examples.',
    datePublished: '2026-07-04',
    dateModified: '2026-07-04',
    readingMinutes: 13,
    sections: [
      {
        id: 'what-is-sip',
        heading: 'What Is SIP?',
        blocks: [
          {
            type: 'callout',
            text: `Why trust this guide? This guide is prepared using publicly available information from authoritative sources such as SEBI, AMFI, and Government of India publications. It is educational only — ArthVeda Wealth Studio is independent and does not recommend any specific mutual fund, AMC, or product. Nothing here is personalized investment advice, so please weigh your own goals and situation before investing.`,
          },
          {
            type: 'cta',
            href: '/why-trust-our-calculators',
            label: 'Why Trust Our Calculators',
            text: `We believe good decisions start with transparent tools. Here is how we keep our calculators honest and assumption-driven.`,
          },
          {
            type: 'callout',
            text: `Quick answer: A Systematic Investment Plan (SIP) is a way to invest a fixed sum in a mutual fund automatically at regular intervals, usually monthly. It lets you start small, stay consistent, and build wealth gradually — with returns linked to the market rather than fixed.`,
          },
          {
            type: 'paragraph',
            text: `If you have ever felt that investing is only for people with lakhs of rupees to spare, a SIP is where that idea quietly falls apart. You can begin with the sort of money you might spend on a single weekend outing, and let time do most of the heavy lifting. For a lot of first-time investors in India, a SIP is simply the least intimidating place to start.`,
          },
          {
            type: 'paragraph',
            text: `A SIP, or Systematic Investment Plan, is a way to invest a fixed amount of money into a mutual fund at regular intervals — usually once a month. Instead of putting in one large sum, you invest small amounts steadily over time, a bit like a monthly saving habit that quietly builds up in the background.`,
          },
          {
            type: 'paragraph',
            text: `The idea is refreshingly ordinary. You decide how much you can comfortably set aside — say ₹2,000 or ₹5,000 a month — pick a date, and that amount gets invested automatically. You do not have to remember to do it, and you do not need a big bank balance to begin.`,
          },
          { type: 'subheading', text: `SIP is a method, not a product` },
          {
            type: 'paragraph',
            text: `This is the single most common mix-up for beginners, so it is worth clearing up early: you do not actually "buy a SIP." A SIP is only the method of investing. The real investment is the mutual fund your money goes into.`,
          },
          {
            type: 'paragraph',
            text: `A simple way to picture it: the SIP is like a standing instruction on your bank account, while the mutual fund is the thing you are actually buying with each instalment. The SIP decides how and when you invest; the mutual fund decides what you invest in.`,
          },
          {
            type: 'paragraph',
            text: `Because your money ultimately goes into a mutual fund, your returns depend on how the market performs. That is an important point we will come back to: a SIP is a disciplined way to invest, but it does not guarantee returns, and the value of your investment can rise or fall.`,
          },
          { type: 'subheading', text: `What "Systematic Investment Plan" really means` },
          { type: 'paragraph', text: `Break the full form down and it explains itself:` },
          {
            type: 'list',
            items: [
              `Systematic — regular and disciplined, on a fixed schedule.`,
              `Investment — your money is being put to work, not just parked.`,
              `Plan — a repeatable routine you set once and largely leave alone.`,
            ],
          },
          {
            type: 'paragraph',
            text: `Put together, a SIP is really just a plan to invest a little, regularly, without trying to time the market. Here is a SIP at a glance:`,
          },
          {
            type: 'table',
            headers: ['Feature', 'Detail'],
            rows: [
              ['Full form', 'Systematic Investment Plan'],
              ['What it is', 'A method to invest a fixed amount in a mutual fund at regular intervals'],
              ['Common frequency', 'Monthly (weekly and quarterly are also possible)'],
              ['Starting amount', 'Often as low as ₹100–₹500 per month, depending on the fund'],
              ['Nature of returns', 'Market-linked — not fixed or guaranteed'],
              ['Best suited for', 'Long-term, goal-based investing'],
            ],
          },
          {
            type: 'callout',
            text: `A SIP is a way of investing, not an investment in itself. The returns come from the mutual fund you choose, so they move with the market rather than staying fixed.`,
          },
        ],
      },
      {
        id: 'how-sip-works',
        heading: 'How Does SIP Work?',
        blocks: [
          {
            type: 'paragraph',
            text: `Once you set up a SIP, most of the work happens automatically. Here is the full cycle in four simple steps:`,
          },
          {
            type: 'list',
            ordered: true,
            items: [
              `You choose a mutual fund and decide the details — how much to invest, how often (usually monthly), and on which date.`,
              `You set up an auto-debit — a one-time instruction that lets your bank transfer the fixed amount to the fund on your chosen date.`,
              `Your money buys units — on each date, that amount is used to buy units of the fund at that day's price.`,
              `Your investment grows over time — month after month your units add up, and their total value rises or falls with the market.`,
            ],
          },
          {
            type: 'illustration',
            name: 'sip-flow',
            caption: `How your money flows through a SIP — from your bank account to long-term wealth.`,
          },
          {
            type: 'paragraph',
            text: `The quiet advantage here is consistency. Because the process is automatic, you keep investing through good months and nervous months alike — which is exactly when many people would otherwise hesitate.`,
          },
          {
            type: 'paragraph',
            text: `And once it is running, a SIP quietly turns investing into a habit rather than a monthly decision — which, for most beginners, is half the battle won.`,
          },
          { type: 'subheading', text: `What are NAV and units?` },
          {
            type: 'paragraph',
            text: `To understand a SIP, you only need two small ideas: NAV and units.`,
          },
          {
            type: 'list',
            items: [
              `NAV (Net Asset Value) is the price of one unit of a mutual fund on a given day.`,
              `Units are simply how much of the fund you own.`,
            ],
          },
          {
            type: 'paragraph',
            text: `Each time you invest, the number of units you get is your investment amount divided by that day's NAV — that is, units bought = amount invested ÷ NAV.`,
          },
          {
            type: 'paragraph',
            text: `For example, if you invest ₹5,000 when the NAV is ₹50, you receive 100 units. If the NAV had been ₹100 that day, the same ₹5,000 would have bought only 50 units. So when prices are lower, your money buys more units; when prices are higher, it buys fewer.`,
          },
          { type: 'subheading', text: `Rupee-cost averaging in action` },
          {
            type: 'paragraph',
            text: `Because the NAV keeps changing, your fixed monthly amount naturally buys more units when the market is down and fewer when it is up. Over time, this evens out your average purchase price — an effect known as rupee-cost averaging.`,
          },
          { type: 'paragraph', text: `Here is a simplified illustration of investing ₹1,000 every month:` },
          {
            type: 'table',
            headers: ['Month', 'Amount invested', 'NAV (₹)', 'Units bought'],
            rows: [
              ['Month 1', '₹1,000', '20', '50.0'],
              ['Month 2', '₹1,000', '25', '40.0'],
              ['Month 3', '₹1,000', '10', '100.0'],
              ['Month 4', '₹1,000', '25', '40.0'],
              ['Total', '₹4,000', '—', '230.0'],
            ],
          },
          {
            type: 'illustration',
            name: 'rupee-cost-averaging',
            caption: `A fixed ₹1,000 buys the most units in month three, when the price is lowest.`,
          },
          {
            type: 'paragraph',
            text: `Across these four months, you invested ₹4,000 and received 230 units. That works out to an average cost of about ₹17.39 per unit, even though the average of the four NAVs was ₹20. Notice what happened in Month 3: when the price fell to ₹10, your steady ₹1,000 quietly picked up far more units — and that is the whole point.`,
          },
          {
            type: 'paragraph',
            text: `It is worth being honest about what a SIP can and cannot do. A SIP reduces timing risk — the danger of putting all your money in at a single bad moment — by spreading your investment across many days and prices. But it does not remove market risk: because your money sits in a mutual fund, its value can still fall, sometimes sharply. And a SIP never guarantees a profit. Averaging is about steadiness and discipline, not about beating the market or shielding you from losses.`,
          },
          {
            type: 'paragraph',
            text: `Understanding this rupee-cost math is the real reason SIPs feel so manageable for beginners: you stop worrying about whether today is a "good day" to invest, because your plan handles the ups and downs for you.`,
          },
        ],
      },
      {
        id: 'power-of-compounding',
        heading: 'The Power of Compounding in a SIP',
        blocks: [
          {
            type: 'callout',
            text: `In short: Compounding means your returns start earning returns of their own, so the longer you stay invested through a SIP, the faster your money can grow.`,
          },
          {
            type: 'paragraph',
            text: `Compounding is the quiet engine that makes a SIP worthwhile. In year one, your money grows a little. In year two, that growth also begins to grow. Left alone for long enough, this snowball becomes far larger than the sum you actually put in.`,
          },
          {
            type: 'illustration',
            name: 'compounding-timeline',
            caption: `The gap between what you invest and what it grows into widens the longer you stay invested.`,
          },
          {
            type: 'paragraph',
            text: `Here is the part beginners often miss: with compounding, time usually matters more than the amount you invest. A modest SIP started early can quietly overtake a much larger SIP started late, simply because it had more years to snowball.`,
          },
          {
            type: 'paragraph',
            text: `Consider two friends, Riya and Karan. Both invest ₹5,000 a month. Riya begins at 25 and invests for just 10 years, then stops and leaves the money untouched. Karan begins at 35 and keeps investing all the way to 60. We compare where they stand at age 60.`,
          },
          {
            type: 'table',
            headers: ['', 'Riya', 'Karan'],
            rows: [
              ['Starts investing at age', '25', '35'],
              ['Monthly SIP', '₹5,000', '₹5,000'],
              ['Years of investing', '10 (stops at 35)', '25 (until 60)'],
              ['Total amount invested', '₹6,00,000', '₹15,00,000'],
              ['Approx. value at age 60', '~₹2.3 crore', '~₹94 lakh'],
            ],
            caption: `Illustrative only. These figures assume a fixed ~12% annual return purely to demonstrate the principle of compounding — they are not a projection or a promise. Real returns vary year to year and are never guaranteed.`,
          },
          {
            type: 'paragraph',
            text: `Look closely: Riya put in far less money and stopped decades earlier — yet her head start let compounding do the heavy lifting. That is the whole lesson. Starting sooner, even with a small amount, is often more powerful than starting later with more.`,
          },
          {
            type: 'cta',
            href: '/calculator-methodology',
            label: 'Read our Calculator Methodology',
            text: `Wondering how a projection like this is actually worked out? We explain every formula and assumption our tools use, in plain language.`,
          },
          {
            type: 'cta',
            calculatorPath: '/sip-calculator',
            text: `The figures above rest on one fixed assumption, and your situation is your own. Enter your age, monthly amount, and time horizon to see how starting earlier — or staying invested a few years longer — changes the picture for you.`,
          },
        ],
      },
      {
        id: 'benefits',
        heading: 'Key Benefits of SIP',
        blocks: [
          {
            type: 'paragraph',
            text: `A SIP is not magic, but it does bundle together several habits that beginners genuinely struggle to build alone. Here are the five that matter most — and the real behaviour behind each.`,
          },
          {
            type: 'list',
            items: [
              `Discipline — the auto-debit quietly defeats the "I'll start next month" habit, because the money leaves your account before you can talk yourself out of it.`,
              `Affordability — you do not have to wait until you "have enough." You start with an amount that feels painless today and raise it as your income grows.`,
              `Compounding — it rewards the boring act of staying invested, which, as we saw above, is exactly what turns small sums into serious wealth.`,
              `Rupee-cost averaging — it frees you from guessing the "right" time to invest, a game even professionals rarely win consistently.`,
              `Flexibility — there is no lock-in on most SIPs, so starting feels low-risk: you can pause, change, or stop whenever life demands it.`,
            ],
          },
          {
            type: 'table',
            headers: ['Benefit', 'What it means for you'],
            rows: [
              ['Discipline', 'Automated investing removes guesswork and emotion'],
              ['Affordability', 'Start small, step up as income grows'],
              ['Compounding', 'Long horizons turn steady investing into real wealth'],
              ['Rupee-cost averaging', 'More units when prices dip, fewer when they rise'],
              ['Flexibility', 'Pause, increase, stop, or redeem as your needs shift'],
            ],
          },
        ],
      },
      {
        id: 'risks',
        heading: 'Risks and Limitations of SIP',
        blocks: [
          {
            type: 'paragraph',
            text: `This is the section most websites rush through, so let us be genuinely honest — because understanding the downsides is what makes you a better investor.`,
          },
          {
            type: 'paragraph',
            text: `Your money carries market risk. A SIP invests in mutual funds, and fund values move with the market. In a bad stretch, your investment can fall in value, sometimes sharply, and it may sit below what you put in for months or even a couple of years. A SIP softens the timing of that risk; it does not remove the risk itself.`,
          },
          {
            type: 'paragraph',
            text: `Returns are never guaranteed. The ~12% figure used earlier is only an assumption for illustration. Actual returns swing from year to year, and past performance is not a promise of future results. Treat any projected number — including from our calculators — as a rough guide, not a certainty.`,
          },
          {
            type: 'paragraph',
            text: `A lumpsum sometimes wins. If markets rise steadily after you invest, deploying a windfall all at once can beat a SIP, because your full amount was working from day one. A SIP tends to shine in choppy or falling markets, where averaging helps. Neither is "always better" — they simply suit different situations.`,
          },
          {
            type: 'paragraph',
            text: `Behaviour is the real danger. The most common mistakes are not about the product; they are about us. Investors stop their SIP during a market dip — the worst moment to quit — or chase whatever fund topped last year's charts, or check their balance so often that short-term dips scare them into acting.`,
          },
          {
            type: 'paragraph',
            text: `Many people stop far too early. SIP discontinuation (stoppage) data published by AMFI has repeatedly shown that a large share of SIPs are cancelled well before they have had time to work. Every early exit breaks the compounding chain that needed years to build — often the single biggest reason a SIP disappoints.`,
          },
          {
            type: 'paragraph',
            text: `A SIP does not fit every goal. For money you will need within the next one to three years, or for your emergency fund, market-linked investing is usually the wrong tool — a short dip could arrive exactly when you need the cash. Safer, more predictable options suit near-term and essential money better.`,
          },
        ],
      },
      {
        id: 'types-of-sip',
        heading: 'Types of SIP',
        blocks: [
          {
            type: 'paragraph',
            text: `Not every SIP looks the same. Once you understand the basic idea, it helps to know the main variations, because one of them may fit your life better than a plain monthly plan.`,
          },
          {
            type: 'list',
            items: [
              `Regular SIP — the default: a fixed amount on a fixed date. Simple, predictable, and ideal for most beginners.`,
              `Step-Up (Top-Up) SIP — your instalment rises automatically at set intervals, say 10% every year. It is built for salaried people whose income grows over time.`,
              `Flexible SIP — you can adjust the amount up or down from month to month, which suits people with irregular or seasonal income.`,
              `Perpetual SIP — there is no fixed end date; it simply runs until you decide to stop. Useful for open-ended, long-term goals.`,
              `Trigger SIP — invests only when a chosen condition is met, such as a date or a market level. This needs some experience and is not something beginners should reach for.`,
            ],
          },
          {
            type: 'table',
            headers: ['Type of SIP', 'How it works', 'Who it tends to suit'],
            rows: [
              ['Regular SIP', 'Fixed amount, fixed date', 'Most beginners'],
              ['Step-Up (Top-Up) SIP', 'Amount increases automatically each year', 'Salaried investors expecting raises'],
              ['Flexible SIP', 'You vary the amount as needed', 'Irregular or variable income'],
              ['Perpetual SIP', 'Runs with no fixed end date', 'Long-term, goal-based investors'],
              ['Trigger SIP', 'Invests on a preset condition', 'Experienced investors only'],
            ],
          },
          {
            type: 'paragraph',
            text: `Of these, the step-up SIP is the one beginners most often overlook. Raising your investment a little each year — roughly in step with your salary — can make a surprisingly large difference over a couple of decades, and it also helps your investing keep pace with inflation.`,
          },
          {
            type: 'cta',
            calculatorPath: '/sip-vs-stepup-sip-calculator',
            text: `Wondering whether increasing your SIP each year is really worth it? Compare a flat monthly amount against a step-up SIP and watch how a small annual increase changes your final corpus.`,
          },
        ],
      },
      {
        id: 'sip-vs-lumpsum',
        heading: 'SIP vs Lumpsum',
        blocks: [
          {
            type: 'callout',
            text: `In short: For most salaried beginners a SIP is the simpler, lower-pressure choice, while a lumpsum suits a one-time amount you already hold — neither wins every time.`,
          },
          {
            type: 'paragraph',
            text: `A SIP spreads your investment across many months, which lowers the risk of putting everything in at the wrong moment. A lumpsum puts your full amount to work immediately, which is powerful when markets rise afterward — but painful if they fall soon after you invest.`,
          },
          {
            type: 'table',
            headers: ['Factor', 'SIP', 'Lumpsum'],
            rows: [
              ['How you invest', 'Small amounts, regularly', 'One large amount, at once'],
              ['Best suited to', 'Money from a regular salary', 'A windfall or bonus you already hold'],
              ['Timing risk', 'Spread out, so lower', 'High — depends on your entry point'],
              ['Tends to work best when', 'Markets are choppy or uncertain', 'Markets rise steadily after you invest'],
              ['Ease for beginners', 'Gentle and low-pressure', 'Needs a stronger stomach'],
            ],
          },
          {
            type: 'paragraph',
            text: `A simple rule of thumb: if the money arrives every month, a SIP is the natural fit. If a large sum lands in your lap — a bonus, a maturity payout, a gift — then a lumpsum decision comes into play, and some people even split the difference by staggering that sum over a few months.`,
          },
          {
            type: 'cta',
            calculatorPath: '/lumpsum-calculator',
            text: `Received a bonus or a one-time amount and curious how it might grow if invested today? Try different amounts and time periods to see the possible outcome.`,
          },
        ],
      },
      {
        id: 'sip-vs-rd',
        heading: 'SIP vs Recurring Deposit (RD)',
        blocks: [
          {
            type: 'callout',
            text: `In short: An RD gives you a fixed, guaranteed return with very low risk, while a SIP offers higher long-term growth potential in exchange for market ups and downs.`,
          },
          {
            type: 'paragraph',
            text: `Beginners often compare a mutual fund SIP with a bank recurring deposit, since both take a fixed amount from you every month. The habit is similar; what you get in return is not. An RD's return is known in advance. A SIP has no such guarantee — it can deliver more than an RD over the long run, but it can also fall in the short run.`,
          },
          {
            type: 'table',
            headers: ['Factor', 'SIP (mutual fund)', 'Recurring Deposit (RD)'],
            rows: [
              ['Returns', 'Market-linked, not fixed', 'Fixed and guaranteed'],
              ['Risk', 'Value can rise or fall', 'Very low'],
              ['Best time horizon', 'Medium to long term', 'Short to medium term'],
              ['Access to money', 'Redeem anytime (tax/exit load may apply)', 'Penalty for early withdrawal'],
              ['Taxation', 'Capital-gains rules (see below)', 'Interest taxed at your slab'],
              ['Best for', 'Long-term growth', 'Safety and certainty'],
            ],
          },
          {
            type: 'paragraph',
            text: `Neither is "better" in the abstract. An RD is a fine home for money you cannot afford to see fall. A SIP is generally the stronger choice for long-term goals, where its growth potential has time to outweigh the short-term ups and downs.`,
          },
        ],
      },
      {
        id: 'sip-taxation',
        heading: 'SIP Taxation in India',
        blocks: [
          {
            type: 'callout',
            text: `In short: A SIP itself is not taxed — tax applies only when you redeem your units, and how much depends on the type of fund and how long you held it.`,
          },
          {
            type: 'paragraph',
            text: `There is one detail unique to SIPs worth knowing: each monthly instalment is treated as a separate investment with its own holding period. So when you redeem, your earliest instalments may qualify as long-term while your recent ones are still short-term.`,
          },
          {
            type: 'paragraph',
            text: `In short: the longer you stay invested, the more favourable the tax treatment generally becomes. Here is how SIP taxation broadly works under the rules currently in force (after the changes effective 23 July 2024):`,
          },
          {
            type: 'table',
            headers: ['Fund type', 'Holding period', 'Tax treatment (educational summary)'],
            rows: [
              ['Equity funds', 'Up to 12 months (short-term)', '20% on the gains'],
              ['Equity funds', 'More than 12 months (long-term)', '12.5% on gains above ₹1.25 lakh in a financial year'],
              ['Debt funds (bought on/after 1 Apr 2023)', 'Any period', 'Taxed at your income-tax slab rate'],
              ['ELSS (tax-saving)', '3-year lock-in, then long-term', '12.5% on gains above ₹1.25 lakh; investment up to ₹1.5 lakh deductible under Section 80C (old tax regime)'],
            ],
            caption: `This is an educational summary, not tax advice. Tax rules change over time and depend on your personal circumstances. Always confirm the current rules or speak to a qualified tax professional before acting.`,
          },
          {
            type: 'paragraph',
            text: `For a beginner, the practical takeaway is simple: long-term equity investing is taxed more gently than short-term, and there is an annual exemption on long-term equity gains. If you are investing specifically to save tax under Section 80C, an ELSS fund is the SIP category designed for that — just remember the three-year lock-in applies to each instalment.`,
          },
        ],
      },
      {
        id: 'how-to-start',
        heading: 'How to Start a SIP',
        blocks: [
          {
            type: 'callout',
            text: `Financial Foundation First: Before you begin an equity SIP, it is wise to set up two safety nets — an emergency fund covering a few months of expenses, and adequate health insurance. These prevent you from having to sell your investments in a crisis, which means your SIP can stay invested long enough to actually work.`,
          },
          {
            type: 'paragraph',
            text: `Starting is easier than most beginners expect. Here is the whole process, start to finish:`,
          },
          {
            type: 'list',
            ordered: true,
            items: [
              `Set a clear goal and time horizon. Decide why you are investing — a house, a child's education, retirement — and roughly when you will need the money. The goal shapes everything that follows.`,
              `Complete your KYC. This is a one-time verification using your PAN and Aadhaar, done online in minutes on most platforms.`,
              `Choose a fund that matches your goal and risk comfort. Match the fund's nature to your horizon; longer goals can usually take more ups and downs than near-term ones.`,
              `Decide the amount, date, and frequency. Pick a figure you can sustain in good months and tight months alike.`,
              `Set up the auto-debit mandate. This one-time bank instruction is what makes your SIP run on its own.`,
              `Review once or twice a year — not daily. Checking constantly only feeds anxiety; a periodic review is enough.`,
            ],
          },
          {
            type: 'paragraph',
            text: `Step one deserves the most thought. A goal like retirement, for instance, is decades away and needs a target figure to aim at.`,
          },
          {
            type: 'cta',
            calculatorPath: '/retirement-calculator',
            text: `Planning for retirement? Estimate the corpus you will need and the monthly SIP that could get you there, so your goal becomes a concrete number instead of a vague hope.`,
          },
        ],
      },
      {
        id: 'costs-and-plans',
        heading: 'SIP Costs and Plan Types You Should Know',
        blocks: [
          {
            type: 'paragraph',
            text: `Costs rarely make headlines, but over decades they quietly shape your returns. Two beginners in the very same fund can end up with different amounts simply because of the plan they chose and the fees they paid. Here is what to understand — presented neutrally, with no "right" answer.`,
          },
          {
            type: 'list',
            items: [
              `Direct vs Regular plans. Every mutual fund offers two versions of the same underlying portfolio. A Regular plan is bought through a distributor or advisor, whose commission is built into the fund's ongoing cost. A Direct plan is bought straight from the fund house, with no distributor commission, so its ongoing cost is lower. The trade-off is simple: a Direct plan is cheaper but leaves the decisions to you; a Regular plan costs a little more but comes with someone guiding you. Neither is universally better — it depends on how much help you want.`,
              `Expense ratio. This is the annual fee a fund charges to manage your money, shown as a small percentage of your investment. It is deducted automatically, so you never "pay a bill" — but it does gently reduce your returns every year, which adds up over long horizons.`,
              `Exit load. Some funds charge a small fee if you redeem within a short period (often within a year). It exists to discourage very early withdrawals. Always check whether an exit load applies before you sell.`,
            ],
          },
          {
            type: 'table',
            headers: ['Term', 'What it is', 'Why it matters'],
            rows: [
              ['Direct plan', 'Bought straight from the fund house', 'Lower ongoing cost; you make your own choices'],
              ['Regular plan', 'Bought via a distributor or advisor', 'Includes their guidance; slightly higher cost'],
              ['Expense ratio', 'Annual fund-management fee (% of assets)', 'Quietly reduces returns over time'],
              ['Exit load', 'Fee for redeeming too soon', 'Can cost you if you withdraw early'],
            ],
          },
          {
            type: 'paragraph',
            text: `None of this should scare you off — costs are a normal part of investing. The point is simply to know they exist, so you can make an informed choice rather than an accidental one.`,
          },
        ],
      },
      {
        id: 'myths',
        heading: 'Common SIP Myths vs Reality',
        blocks: [
          {
            type: 'paragraph',
            text: `A few stubborn myths hold beginners back. Clearing them up is one of the most useful things this guide can do.`,
          },
          {
            type: 'table',
            headers: ['Myth', 'Reality'],
            rows: [
              ['"I need a lot of money to start a SIP."', 'You can begin with as little as ₹100–₹500 a month.'],
              ['"A SIP guarantees returns."', 'Returns are market-linked and can rise or fall.'],
              ['"A SIP and a mutual fund are the same thing."', 'A SIP is a method; the mutual fund is the actual investment.'],
              ['"Stopping my SIP means I lose my money."', 'Stopping only halts future instalments — your existing units stay invested.'],
              ['"A higher NAV means a costlier or worse fund."', 'NAV alone tells you nothing about how good or expensive a fund is.'],
              ['"A SIP always beats a lumpsum."', 'Each fits different situations; neither wins every time.'],
            ],
          },
        ],
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes Beginners Make',
        blocks: [
          {
            type: 'paragraph',
            text: `Most SIP disappointments have nothing to do with the market and everything to do with avoidable habits. Watch out for these:`,
          },
          {
            type: 'list',
            items: [
              `Stopping the SIP when markets fall. This is the costliest mistake of all. A falling market is precisely when your fixed amount buys the most units — quitting then locks in the pain and throws away the recovery.`,
              `Chasing last year's top-performing fund. Yesterday's winner is not reliably tomorrow's. Constantly switching to whatever topped the charts usually hurts more than it helps.`,
              `Checking returns every day. Daily swings are noise. Watching them closely only breeds anxiety and tempts you into rash decisions in what is really a multi-year game.`,
              `Investing without a goal. With no clear "why," it becomes far too easy to stop the moment the money feels inconvenient.`,
              `Ignoring costs. Expense ratios and exit loads seem tiny month to month, but they quietly compound against you over the years.`,
              `Expecting guaranteed returns. Treating market-linked returns as certain sets you up to panic the first time your balance dips.`,
            ],
          },
          {
            type: 'paragraph',
            text: `Avoiding these six is, honestly, half the battle. The investor who simply keeps a modest SIP running through the ups and downs often outperforms the one who is forever tinkering.`,
          },
        ],
      },
      {
        id: 'is-sip-right-for-you',
        heading: 'Is SIP Right for You?',
        blocks: [
          {
            type: 'paragraph',
            text: `By now the honest answer should feel clear: a SIP is an excellent default for most beginners, but it is not a fit for every rupee or every goal.`,
          },
          { type: 'paragraph', text: `A SIP tends to be a good fit if you:` },
          {
            type: 'list',
            items: [
              `earn a regular income and want to invest a little each month,`,
              `are investing for a goal that is several years away,`,
              `prefer not to worry about timing the market, and`,
              `can stay calm and stay invested when markets dip.`,
            ],
          },
          { type: 'paragraph', text: `A SIP is probably the wrong tool if you:` },
          {
            type: 'list',
            items: [
              `will need the money within the next one to three years,`,
              `are building an emergency fund that must stay safe, or`,
              `cannot tolerate seeing your investment fall, even temporarily.`,
            ],
          },
          {
            type: 'paragraph',
            text: `For those chasing early financial independence, a SIP is the everyday engine that builds the corpus over time.`,
          },
          {
            type: 'cta',
            calculatorPath: '/fire-calculator',
            text: `Dreaming of retiring early? Work out your FIRE number and see whether your current investing pace is on track for financial independence.`,
          },
          {
            type: 'callout',
            text: `Next Step After Building Wealth: A SIP is about building a corpus. One day the goal flips — from growing your money to drawing a steady income from it. That is the withdrawal phase, and it has its own planning.`,
          },
          {
            type: 'cta',
            calculatorPath: '/swp-calculator',
            text: `Already built a corpus and want a regular monthly income from it? A Systematic Withdrawal Plan (SWP) does the reverse of a SIP — see how long your money could last.`,
          },
        ],
      },
    ],
    keyTakeaways: [
      'A SIP is a method of investing a fixed amount in a mutual fund at regular intervals — not an investment product in itself.',
      'Its real power is compounding, which rewards time in the market far more than the size of each instalment.',
      'The main benefits are discipline, affordability, rupee-cost averaging, flexibility, and long-term growth.',
      'Returns are market-linked and never guaranteed; a SIP lowers timing risk but does not remove market risk.',
      'A step-up SIP helps your investing keep pace with your rising income and with inflation.',
      'Costs matter: expense ratios and exit loads quietly affect returns, and Direct plans cost less than Regular plans.',
      'The SIP is not taxed — tax applies only when you redeem, based on the fund type and holding period.',
      'A SIP suits long-term goals; money you will need soon belongs in safer options.',
    ],
    faqs: [
      {
        question: 'What is the full form of SIP?',
        answer:
          'SIP stands for Systematic Investment Plan. It is a way to invest a fixed amount into a ' +
          'mutual fund at regular intervals, most commonly once a month.',
      },
      {
        question: 'Is a SIP the same as a mutual fund?',
        answer:
          'No. A SIP is only the method of investing. The mutual fund is what you are actually ' +
          'investing in. You use a SIP to invest in a mutual fund gradually.',
      },
      {
        question: 'What is the minimum amount to start a SIP in India?',
        answer:
          'It varies by fund, but many allow you to start with as little as ₹100 to ₹500 per month, ' +
          'which makes SIP investment accessible to almost anyone.',
      },
      {
        question: 'Is a SIP safe? Can I lose money?',
        answer:
          'A SIP invests in market-linked mutual funds, so its value can fall, especially in the ' +
          'short term. It reduces timing risk but does not remove market risk or guarantee profits.',
      },
      {
        question: 'Can I stop, pause, or change my SIP anytime?',
        answer:
          'Yes. SIPs are flexible — you can pause, stop, increase, or reduce them. Stopping only ends ' +
          'future instalments; the units you have already bought remain invested.',
      },
      {
        question: 'What happens if I miss a SIP instalment?',
        answer:
          'Usually nothing serious. The instalment is simply skipped if your bank balance is low. ' +
          'Your SIP continues from the next date, though repeated bank failures can attract minor charges.',
      },
      {
        question: 'How is a SIP taxed in India?',
        answer:
          'The SIP is not taxed; tax applies when you redeem. For equity funds, gains are taxed at ' +
          '20% short-term, and 12.5% long-term above ₹1.25 lakh a year. This is educational, not tax advice.',
      },
      {
        question: 'Which is better for beginners — SIP or lumpsum?',
        answer:
          'For most beginners with a regular salary, a SIP is the gentler, lower-pressure choice. A ' +
          'lumpsum suits a one-time amount you already have. Neither is always better.',
      },
      {
        question: 'How much return can I expect from a SIP?',
        answer:
          'There is no fixed answer — returns depend on the fund and market conditions and are never ' +
          'guaranteed. Use a calculator with your own assumptions to explore possibilities, not promises.',
      },
      {
        question: 'Is a SIP good for long-term goals like retirement?',
        answer:
          'Yes. Long horizons give compounding time to work, which is exactly what a SIP is built for. ' +
          'It is well suited to retirement and other goals that are many years away.',
      },
    ],
    relatedCalculators: [
      '/sip-calculator',
      '/sip-vs-stepup-sip-calculator',
      '/lumpsum-calculator',
      '/retirement-calculator',
      '/fire-calculator',
      '/swp-calculator',
    ],
    relatedArticles: ['sip-vs-lumpsum'],
    references: [
      {
        label: 'SEBI — Investor Education (Securities and Exchange Board of India)',
        url: 'https://investor.sebi.gov.in/',
      },
      { label: 'AMFI — Association of Mutual Funds in India', url: 'https://www.amfiindia.com/' },
      {
        label: 'Income Tax Department, Government of India — capital gains',
        url: 'https://www.incometaxindia.gov.in/',
      },
    ],
    author: DEFAULT_AUTHOR,
  },
  {
    slug: 'sip-vs-lumpsum',
    status: 'draft',
    category: 'sip-mutual-funds',
    title: 'SIP vs Lumpsum: Which Investing Strategy Is Right for You?',
    seoTitle: 'SIP vs Lumpsum: Which Strategy Is Right for You? | ArthVeda',
    description:
      'Compare systematic (SIP) investing against a one-time lumpsum investment — the trade-offs, ' +
      'when each makes sense, and how to combine both.',
    heroSummary:
      'SIP and lumpsum are not rivals — they suit different situations. This guide explains the ' +
      'trade-offs so you can choose (or blend) with confidence.',
    datePublished: '2026-07-01',
    dateModified: '2026-07-01',
    readingMinutes: 7,
    sections: [
      {
        id: 'the-core-difference',
        heading: 'The core difference',
        blocks: [
          { type: 'paragraph', text: PLACEHOLDER_NOTE },
          { type: 'paragraph', text: 'Placeholder explanation of SIP vs lumpsum mechanics.' },
        ],
      },
      {
        id: 'when-each-makes-sense',
        heading: 'When each makes sense',
        blocks: [
          {
            type: 'list',
            items: [
              'Placeholder: SIP suits investing from regular income.',
              'Placeholder: Lumpsum suits deploying capital you already hold.',
              'Placeholder: The two can be combined.',
            ],
          },
        ],
      },
    ],
    keyTakeaways: [
      'SIP averages your entry over time.',
      'Lumpsum puts capital to work immediately.',
      'Placeholder takeaway for template validation.',
    ],
    relatedCalculators: ['/sip-calculator', '/lumpsum-calculator'],
    relatedArticles: ['what-is-sip'],
    references: [{ label: 'AMFI — Association of Mutual Funds in India', url: 'https://www.amfiindia.com/' }],
    author: DEFAULT_AUTHOR,
  },
  {
    slug: 'what-is-a-mutual-fund',
    status: 'published',
    category: 'sip-mutual-funds',
    title: 'What Is a Mutual Fund? A Beginner\u2019s Guide for Indian Investors',
    seoTitle: 'What Is a Mutual Fund? Beginner\u2019s Guide (India) | ArthVeda Wealth Studio',
    description:
      'New to investing? Learn what a mutual fund is, how it works, whether it is safe, the types, ' +
      'costs, taxation and how to start — in plain English, with simple rupee examples for Indian beginners.',
    heroSummary:
      'A mutual fund lets many people pool their money so a professional manager can invest it for them ' +
      'across dozens of companies or bonds at once. This beginner-friendly guide explains what a mutual ' +
      'fund really is, how your money flows, whether it is safe, how to choose one, and where it fits in ' +
      'your financial life — in plain English, with simple rupee examples.',
    datePublished: '2026-07-04',
    dateModified: '2026-07-04',
    readingMinutes: 21,
    sections: [
      {
        id: 'what-is-a-mutual-fund',
        heading: 'What Is a Mutual Fund?',
        blocks: [
          {
            type: 'callout',
            text: `Why trust this guide? This guide is prepared using publicly available information from authoritative sources such as SEBI, AMFI, the Income Tax Department, and RBI. It is educational only — ArthVeda Wealth Studio is independent and does not recommend any specific mutual fund, AMC, or product. Nothing here is personalised investment advice, so please weigh your own goals and situation before investing.`,
          },
          {
            type: 'cta',
            href: '/why-trust-our-calculators',
            label: 'Why Trust Our Calculators',
            text: `We believe good decisions start with transparent tools. Here is how we keep our calculators honest and assumption-driven.`,
          },
          {
            type: 'callout',
            text: `Quick answer: A mutual fund is a pool of money collected from many investors and managed by professionals who invest it in a mix of assets — like shares and bonds — on everyone's behalf. You own "units" of the fund in proportion to what you put in, and your returns move with the value of what the fund holds. It is regulated in India by SEBI.`,
          },
          {
            type: 'paragraph',
            text: `Imagine ten neighbours who each want to invest but none of them has the time, money, or knowledge to research and buy shares individually. So they pool their money into one common basket and hire an expert to invest it for all of them. Each neighbour owns a share of that basket equal to what they contributed. That, in one sentence, is a mutual fund.`,
          },
          {
            type: 'paragraph',
            text: `More formally, a mutual fund collects money from thousands (often lakhs) of investors, and a qualified fund manager invests that combined pool according to a stated objective — for example, "invest mainly in large Indian companies" or "invest in safe short-term bonds." Because your small amount is combined with everyone else's, even a few hundred rupees can be spread across dozens of companies you could never afford to buy one by one.`,
          },
          {
            type: 'paragraph',
            text: `It also helps to know what a mutual fund is not. It is not a single company's share, not a bank deposit with a fixed return, and not a product you "own" outright — it is a shared, professionally managed basket whose value simply reflects what is inside it.`,
          },
          { type: 'subheading', text: `The simplest way to think about it` },
          {
            type: 'paragraph',
            text: `Think of a mutual fund as a shared investing vehicle, not a single product you "buy" like a phone. You are really buying a small slice of a professionally managed portfolio. When the things inside that portfolio rise in value, your slice rises too; when they fall, your slice falls. Nobody promises you a fixed return, because the fund simply reflects what it owns.`,
          },
          { type: 'subheading', text: `A mutual fund at a glance` },
          {
            type: 'table',
            headers: ['Feature', 'Detail'],
            rows: [
              ['What it is', 'A pool of money from many investors, professionally managed'],
              ['Who manages it', 'A qualified fund manager at an Asset Management Company (AMC)'],
              ['What you own', 'Units of the fund, in proportion to your investment'],
              ['Where your money goes', 'A portfolio of assets (shares, bonds, etc.) based on its stated objective'],
              ['Nature of returns', 'Market-linked — not fixed or guaranteed'],
              ['Regulator in India', 'SEBI (Securities and Exchange Board of India)'],
              ['Minimum to start', 'Often 500 rupees; some allow as little as 100–250 rupees per month'],
              ['Best suited for', 'Goal-based investing over the medium to long term'],
            ],
          },
        ],
      },
      {
        id: 'how-a-mutual-fund-works',
        heading: 'How Does a Mutual Fund Work?',
        blocks: [
          { type: 'paragraph', text: `Once you understand the flow of money, everything else becomes easy.` },
          { type: 'subheading', text: `Pooling money and the fund manager` },
          {
            type: 'paragraph',
            text: `You and many others hand your money to a mutual fund scheme. The fund manager combines it into one large pool and buys a portfolio — a collection of investments chosen to meet the fund's stated goal. You do not pick the individual shares; the manager and their research team do, within the rules set for that fund.`,
          },
          { type: 'subheading', text: `How a mutual fund works, step by step` },
          {
            type: 'list',
            ordered: true,
            items: [
              `You invest a fixed amount — once as a lumpsum, or every month through a SIP.`,
              `Your money joins a common pool run by the Asset Management Company (AMC).`,
              `The fund manager buys a portfolio of assets in line with the fund's stated objective.`,
              `Each business day, the value of that portfolio sets the NAV — the price of one unit.`,
              `You hold units, and your investment is worth your number of units multiplied by the current NAV.`,
            ],
          },
          { type: 'subheading', text: `How your money actually flows` },
          {
            type: 'table',
            headers: ['Stage', 'What happens'],
            rows: [
              ['1. Investor (you)', 'You invest a fixed amount, once or through a monthly SIP'],
              ['2. AMC', 'The Asset Management Company operates the scheme and employs the fund manager'],
              ['3. Mutual fund scheme', 'Your money joins the common pool of that scheme'],
              ['4. Portfolio', 'The manager invests the pool in shares, bonds, or other assets'],
              ['5. NAV', 'Each day, the portfolio value is divided by all units to give the price of one unit'],
              ['6. Units', 'You are allotted units equal to your investment divided by that day\u2019s NAV'],
              ['7. Your holding\u2019s value', 'Your units multiplied by the current NAV'],
            ],
          },
          { type: 'subheading', text: `What is NAV (Net Asset Value)?` },
          {
            type: 'paragraph',
            text: `NAV is simply the price of one unit of a mutual fund on a given day. It is calculated by taking the total value of everything the fund owns, subtracting its expenses, and dividing by the total number of units held by all investors. Most funds publish their NAV once every business day after markets close.`,
          },
          {
            type: 'paragraph',
            text: `A common myth is that a "low NAV" fund is cheaper or better than a "high NAV" one. It is not. NAV only reflects per-unit value; it tells you nothing about how good or expensive the fund is.`,
          },
          { type: 'subheading', text: `What are units?` },
          {
            type: 'paragraph',
            text: `Units are simply how much of the fund you own. Each time you invest, the number of units you receive is your amount divided by that day's NAV. For example, if you invest 6,000 rupees when the NAV is 30 rupees, you receive 200 units. If that NAV later rises to 36 rupees, your 200 units are worth 7,200 rupees. (These figures are illustrative, only to show the math — they are not a projection or a promise.) You can also own fractional units (often to three decimal places), so your exact amount is always fully invested — a 500-rupee SIP might buy 16.667 units, not a rounded number.`,
          },
          { type: 'subheading', text: `How you make — or lose — money` },
          {
            type: 'paragraph',
            text: `Your investment grows when the value of the fund's portfolio rises, which pushes up the NAV, so your units are worth more. It falls when the portfolio's value drops. You realise a profit or loss only when you redeem (sell) your units. Some funds also offer an IDCW option (Income Distribution cum Capital Withdrawal — what used to be called a "dividend"), which pays out some money periodically; a Growth option instead keeps everything invested so it can compound. For most beginners, growth in NAV under the Growth option is the main way wealth builds. Crucially, because returns depend on the market, they can be positive in some years and negative in others.`,
          },
          { type: 'subheading', text: `How do you get your money back from a mutual fund?` },
          {
            type: 'paragraph',
            text: `When you want your money back, you place a redemption request — for some or all of your units. Your units are then redeemed at the applicable NAV, as determined by SEBI's rules, and the proceeds are credited directly to your registered bank account. For most open-ended funds, the money reaches you within a few working days, though the exact timeline varies by fund category. Two things are worth checking before you redeem: some funds charge an exit load if you withdraw within a specified short period, and a few — such as ELSS — have a lock-in during which units cannot be redeemed.`,
          },
        ],
      },
      {
        id: 'who-runs-and-safety',
        heading: 'Who Runs a Mutual Fund, and Is My Money Safe?',
        blocks: [
          {
            type: 'paragraph',
            text: `"Is it safe?" is the biggest worry for beginners, so it deserves an honest answer. There are two very different questions hidden here: (1) can the fund company run away with my money, and (2) can my investment fall in value? The structure protects you strongly on the first; nothing protects you from the second.`,
          },
          { type: 'subheading', text: `The AMC (Asset Management Company)` },
          {
            type: 'paragraph',
            text: `The AMC is the company that runs the fund and employs the fund manager — for instance, the "XYZ Mutual Fund" brand you see is operated by an AMC. Importantly, your money is not held by the AMC itself. The AMC only manages the investment decisions.`,
          },
          { type: 'subheading', text: `Trustees, custodian and RTA — why your money isn't "with" the AMC` },
          {
            type: 'paragraph',
            text: `Indian mutual funds are built as a trust, with several parties deliberately kept separate so no single one can misuse your money. Trustees oversee the AMC and are legally bound to act in investors' interest. The custodian — a separate institution — actually holds the fund's securities and assets. The Registrar and Transfer Agent (RTA), such as CAMS or KFintech, maintains investor records, units, and transactions. Because the money and assets sit with a custodian and are watched by trustees, even if an AMC faces trouble, your investments are ring-fenced and belong to investors.`,
          },
          {
            type: 'paragraph',
            text: `This is also why, if an AMC changes ownership or a scheme is merged into another, your money isn't lost: you are formally notified, your units carry over, and SEBI rules give you a window to exit without an exit load if you disagree.`,
          },
          { type: 'subheading', text: `SEBI and AMFI — who regulates and protects you` },
          {
            type: 'paragraph',
            text: `SEBI (the Securities and Exchange Board of India) is the market regulator that authorises and supervises every mutual fund, sets disclosure rules, and enforces investor protection. AMFI (the Association of Mutual Funds in India) is the industry body that promotes standards and investor awareness. This oversight is a genuine strength of the system.`,
          },
          {
            type: 'callout',
            text: `In short: The trust structure and SEBI regulation make it very hard for anyone to steal your money — but they do not guarantee returns. Your investment can still rise or fall with the market.`,
          },
          {
            type: 'paragraph',
            text: `There is one important distinction to understand, though. Unlike a bank fixed deposit — which is insured up to 5 lakh rupees by the DICGC — a mutual fund is not deposit-insured, and it does not promise guaranteed returns. Your protection is of a different kind: it comes from SEBI regulation and the trust structure, which keep your money honestly managed and ring-fenced — not from any guarantee on its value. The market value of your investment can still rise or fall, and that market risk always remains yours.`,
          },
          {
            type: 'paragraph',
            text: `And if you ever have a complaint that your AMC or intermediary does not resolve, SEBI provides an official grievance-redressal platform called SCORES where you can escalate it.`,
          },
          {
            type: 'paragraph',
            text: `To show the scale of this regulated industry: as of 31 May 2026, the Indian mutual fund industry managed about 81.58 lakh crore rupees in assets, according to AMFI. (Figures like this change every month; check AMFI for the latest.)`,
          },
        ],
      },
      {
        id: 'where-mutual-funds-fit',
        heading: 'Where Do Mutual Funds Fit in Your Financial Life?',
        blocks: [
          {
            type: 'paragraph',
            text: `One of the most useful things this guide can do is show you when to invest, not just how. Mutual funds are powerful, but they belong at a specific stage in your financial life — not the very first one.`,
          },
          { type: 'subheading', text: `The beginner money order` },
          {
            type: 'table',
            headers: ['Step', 'What to do first', 'Why it comes before mutual funds'],
            rows: [
              ['1. Income', 'Earn and budget; know what you can spare', 'You can only invest what you do not need for essentials'],
              ['2. Emergency fund', 'Set aside 3–6 months of expenses in a safe, liquid place', 'Prevents you from selling investments in a crisis'],
              ['3. Insurance', 'Get adequate term (life) and health cover', 'One hospital bill should not wipe out your savings'],
              ['4. Clear high-interest debt', 'Pay off credit cards and costly loans', 'A 36% card interest costs far more than most funds earn'],
              ['5. Mutual funds', 'Invest surplus for medium and long-term goals', 'This is where wealth-building begins'],
              ['6. Long-term wealth', 'Stay invested and let compounding work', 'The payoff for doing steps 1–5 first'],
            ],
          },
          { type: 'subheading', text: `Why the steps before mutual funds matter` },
          {
            type: 'paragraph',
            text: `If you skip the emergency fund and the market dips exactly when your car breaks down, you may be forced to sell at a loss. If you invest while carrying a credit-card balance charging you far more than a fund is likely to return, you are effectively going backwards. Building the base first is what lets your mutual fund investment stay invested long enough to actually work.`,
          },
        ],
      },
      {
        id: 'why-invest',
        heading: 'Why Do People Invest in Mutual Funds?',
        blocks: [
          {
            type: 'paragraph',
            text: `Mutual funds bundle together several advantages that are hard for a beginner to get alone:`,
          },
          {
            type: 'list',
            items: [
              `Professional management — a qualified team researches and manages the portfolio, so you do not have to pick individual shares.`,
              `Diversification — even a small amount is spread across many companies or bonds, reducing the damage if any single one does badly.`,
              `Affordability — you can start with as little as 500 rupees, or even 100–250 rupees in some cases.`,
              `Liquidity — most funds let you redeem your money in a few working days (some categories have exit loads or lock-ins).`,
              `Regulation and transparency — SEBI oversight, published NAVs, and regular disclosures mean you can see what you own.`,
              `Convenience — automatic SIPs turn investing into a background habit.`,
            ],
          },
        ],
      },
      {
        id: 'disadvantages',
        heading: 'The Disadvantages and Limitations',
        blocks: [
          { type: 'paragraph', text: `An honest guide must also state the drawbacks:` },
          {
            type: 'list',
            items: [
              `No guaranteed returns — your value can fall, sometimes for months or a couple of years.`,
              `Market risk — equity funds especially can be volatile in the short term.`,
              `Costs — every fund charges an annual fee (the expense ratio) that quietly reduces returns.`,
              `No direct control — you cannot dictate which shares the manager buys.`,
              `Too much choice — thousands of schemes can overwhelm a beginner.`,
              `Behavioural traps — the ease of stopping or switching tempts people into poorly timed decisions.`,
            ],
          },
        ],
      },
      {
        id: 'types-of-mutual-funds',
        heading: 'Types of Mutual Funds in India',
        blocks: [
          {
            type: 'paragraph',
            text: `This is a large topic in its own right, so here we stay high level; a dedicated guide will cover each category in depth. SEBI groups mutual fund schemes so investors can compare like with like.`,
          },
          { type: 'subheading', text: `By structure — open-ended vs close-ended` },
          {
            type: 'list',
            items: [
              `Open-ended funds let you invest or redeem any business day. Most funds beginners meet are open-ended.`,
              `Close-ended funds are open only for a fixed period and have a set maturity.`,
            ],
          },
          {
            type: 'paragraph',
            text: `You may also see an NFO (New Fund Offer) — a scheme's initial launch, usually at a 10-rupee NAV. A low launch NAV does not make it cheap or better; an NFO has no track record, so beginners rarely need to rush into one.`,
          },
          { type: 'subheading', text: `By asset class — equity, debt, hybrid` },
          {
            type: 'table',
            headers: ['Type', 'Invests mainly in', 'Risk', 'Typical horizon', 'Tends to suit'],
            rows: [
              ['Equity funds', 'Company shares', 'Higher', 'Long term (5+ years)', 'Long-term growth'],
              ['Debt funds', 'Bonds and fixed-income', 'Lower to moderate', 'Short to medium term', 'Stability, parking money'],
              ['Hybrid funds', 'A mix of equity and debt', 'Moderate', 'Medium term', 'Balanced beginners'],
            ],
          },
          { type: 'subheading', text: `SEBI's current broad categories` },
          {
            type: 'table',
            headers: ['Broad category', 'What it broadly contains'],
            rows: [
              ['Equity', 'Funds investing mainly in shares (large-cap, mid-cap, ELSS tax-saving, and more)'],
              ['Debt', 'Funds investing in bonds and fixed-income instruments'],
              ['Hybrid', 'Funds blending equity and debt'],
              ['Life Cycle', 'A newer SEBI category, still emerging in the Indian market — goal-based funds with a target date whose mix turns more conservative as that date nears'],
              ['Others', 'Index funds, ETFs, and fund-of-funds'],
            ],
          },
          {
            type: 'paragraph',
            text: `(SEBI has revised this framework — the older "solution-oriented" grouping has been discontinued and Life Cycle Funds introduced. Always check the latest SEBI or AMFI classification, as categories evolve.)`,
          },
          { type: 'subheading', text: `By management style — active vs index funds and ETFs` },
          {
            type: 'list',
            items: [
              `Active funds employ a manager who tries to beat the market by choosing investments; they charge more.`,
              `Index funds and ETFs simply track an index (like the Nifty 50) at a low cost, without trying to beat it.`,
            ],
          },
          { type: 'subheading', text: `A special case — ELSS (tax-saving funds)` },
          {
            type: 'paragraph',
            text: `ELSS is an equity category that offers a tax deduction under Section 80C (up to 1.5 lakh rupees, in the old tax regime), with a three-year lock-in on each investment. It is the mutual fund category designed specifically for tax saving.`,
          },
        ],
      },
      {
        id: 'how-to-choose',
        heading: 'How to Choose the Right Fund — A Beginner\u2019s Framework',
        blocks: [
          { type: 'paragraph', text: `Rather than memorising categories, decide by answering five simple questions about yourself.` },
          { type: 'subheading', text: `The five questions` },
          {
            type: 'list',
            ordered: true,
            items: [
              `Goal — what is the money for (a car, a house, a child's education, retirement)?`,
              `Time horizon — when will you need it? Sooner means safer; later allows more equity.`,
              `Risk tolerance — can you stay calm if your investment falls 20% for a while?`,
              `Age — younger investors usually have more time to recover from dips.`,
              `Liquidity needs — might you need the money at short notice?`,
            ],
          },
          { type: 'subheading', text: `Match your goal to a fund type` },
          {
            type: 'table',
            caption: `This is a general educational framework, not a recommendation of any specific scheme.`,
            headers: ['Your goal / horizon', 'Fund type often considered', 'Why'],
            rows: [
              ['Money needed in under 1 year', 'Not mutual funds — keep it safe', 'A short dip could hit exactly when you need cash'],
              ['1–3 years', 'Debt-oriented funds', 'Lower volatility for near-term goals'],
              ['3–5 years', 'Hybrid funds', 'A middle path between growth and stability'],
              ['5+ years (retirement, wealth)', 'Equity funds', 'Time lets growth outweigh short-term swings'],
            ],
          },
          {
            type: 'paragraph',
            text: `The core principle to carry into the next section: higher potential return always comes with higher risk. Anyone who offers you high returns and zero risk is not telling the truth.`,
          },
        ],
      },
      {
        id: 'sip-vs-lumpsum',
        heading: 'Two Ways to Invest — SIP vs Lumpsum',
        blocks: [
          { type: 'paragraph', text: `You can invest in a mutual fund in two ways: gradually, or all at once.` },
          {
            type: 'table',
            headers: ['Factor', 'SIP (regular)', 'Lumpsum (one-time)'],
            rows: [
              ['How you invest', 'Fixed amount every month', 'One large amount at once'],
              ['Best suited to', 'Money from a regular salary', 'A windfall or bonus you already hold'],
              ['Timing risk', 'Spread out, so lower', 'Higher — depends on your entry point'],
              ['Ease for beginners', 'Gentle and low-pressure', 'Needs a stronger stomach'],
            ],
          },
          {
            type: 'paragraph',
            text: `A SIP (Systematic Investment Plan) is usually the gentler starting point for salaried beginners. If you already hold a large sum, a lumpsum decision comes into play. Over long periods, the quiet engine behind either approach is compounding — your returns begin earning returns of their own.`,
          },
          {
            type: 'cta',
            calculatorPath: '/sip-calculator',
            text: `Curious how a monthly investment could grow? Model a SIP with your own amount, return assumption and time horizon.`,
          },
          {
            type: 'cta',
            calculatorPath: '/lumpsum-calculator',
            text: `Received a one-time amount? Project how a lumpsum might grow over different periods and return assumptions.`,
          },
          {
            type: 'cta',
            href: '/learn/what-is-sip',
            label: 'Read: What Is SIP?',
            text: `Want to understand the SIP method itself in depth before you begin? Our beginner guide walks through it step by step.`,
          },
        ],
      },
      {
        id: 'how-much-to-start',
        heading: 'How Much Money Do You Need to Start?',
        blocks: [
          {
            type: 'paragraph',
            text: `Far less than most people assume. Many funds allow SIPs from 500 rupees a month, and some from as little as 100 rupees. To widen access further, SEBI has encouraged very small "sachet" SIPs, and the industry has launched micro-SIPs starting at just 250 rupees a month. The barrier to entry today is genuinely low — the harder part is simply starting and staying consistent.`,
          },
          {
            type: 'paragraph',
            text: `As your income grows, you can raise your contribution. A step-up SIP increases your instalment automatically each year.`,
          },
          {
            type: 'cta',
            calculatorPath: '/sip-vs-stepup-sip-calculator',
            text: `Wondering whether raising your SIP each year is worth it? Compare a flat SIP against a step-up SIP and see the difference.`,
          },
          {
            type: 'cta',
            calculatorPath: '/retirement-calculator',
            text: `Planning a big future goal like retirement? Turn it into a concrete number and the monthly amount that could get you there.`,
          },
        ],
      },
      {
        id: 'mutual-funds-vs-other-options',
        heading: 'Mutual Funds vs Other Options',
        blocks: [
          { type: 'subheading', text: `Mutual fund vs Fixed Deposit (FD)` },
          {
            type: 'table',
            headers: ['Factor', 'Mutual fund', 'Fixed Deposit (FD)'],
            rows: [
              ['Returns', 'Market-linked, not fixed', 'Fixed and known in advance'],
              ['Risk', 'Value can rise or fall', 'Very low'],
              ['Best horizon', 'Medium to long term', 'Short to medium term'],
              ['Liquidity', 'Usually redeemable in a few days', 'Penalty for early withdrawal'],
              ['Guarantee', 'None (not deposit-insured)', 'Interest is contractually fixed; deposits insured up to 5 lakh rupees'],
            ],
          },
          {
            type: 'paragraph',
            text: `Neither is universally "better." An FD suits money you cannot afford to see fall; a mutual fund suits long-term goals where growth potential has time to work.`,
          },
          { type: 'subheading', text: `Mutual fund vs buying stocks directly` },
          {
            type: 'table',
            headers: ['Factor', 'Mutual fund', 'Direct stocks'],
            rows: [
              ['Effort/skill needed', 'Low — manager decides', 'High — you research and choose'],
              ['Diversification', 'Built-in across many holdings', 'You must build it yourself'],
              ['Time commitment', 'Minimal', 'Ongoing monitoring'],
              ['Suits', 'Beginners and busy people', 'Confident, experienced investors'],
            ],
          },
        ],
      },
      {
        id: 'risk-and-returns',
        heading: 'Understanding Risk and Returns',
        blocks: [
          { type: 'subheading', text: `The riskometer` },
          {
            type: 'paragraph',
            text: `Every mutual fund in India must display a Riskometer — a simple dial mandated by SEBI that shows the scheme's risk on six levels, from Low to Very High. Before investing, check where a fund sits and ask yourself honestly whether you can handle that level of ups and downs.`,
          },
          { type: 'subheading', text: `Are returns guaranteed?` },
          {
            type: 'paragraph',
            text: `No. This is the single most important sentence in this guide. Mutual fund returns are market-linked. Past performance is not a promise of future results, and any projected number — including from our own calculators — is a rough guide, not a certainty.`,
          },
          {
            type: 'paragraph',
            text: `It also helps to set realistic expectations and to know how returns are measured. A fund's return is not a single flat number — it is worked out over time (for a SIP, using XIRR; for a lumpsum, as an annualised return), and it varies from year to year. As a rough, non-promissory guide to how the main fund types tend to behave:`,
          },
          {
            type: 'table',
            caption: `Educational only. None of these returns is guaranteed; actual outcomes vary year to year and can be negative in some periods.`,
            headers: ['Fund type', 'Return potential (long term)', 'Volatility / risk'],
            rows: [
              ['Debt', 'Lower', 'Lower'],
              ['Hybrid', 'Moderate', 'Moderate'],
              ['Equity', 'Higher', 'Higher (especially short term)'],
            ],
          },
        ],
      },
      {
        id: 'what-it-costs',
        heading: 'What It Costs — Expense Ratio, Exit Load, Direct vs Regular',
        blocks: [
          { type: 'paragraph', text: `Costs are small each year but compound over decades, so it pays to understand them.` },
          {
            type: 'table',
            headers: ['Term', 'What it is', 'Why it matters'],
            rows: [
              ['Expense ratio (TER)', 'The fund\u2019s annual management fee, as a % of your investment', 'Deducted automatically; gently lowers returns each year'],
              ['Exit load', 'A small fee for redeeming too soon (often within a year)', 'Discourages very early withdrawals'],
              ['Regular plan', 'Bought through a distributor or advisor', 'Includes their guidance; slightly higher cost'],
              ['Direct plan', 'Bought straight from the fund house', 'Lower cost; you make your own choices'],
            ],
          },
          {
            type: 'paragraph',
            text: `To make it concrete: on a long-running investment, a fund charging 1.5% a year versus one charging 0.5% can leave you with a noticeably smaller final amount over 20–25 years — and the gap widens the longer you stay invested. (Illustrative, to show the effect of costs — not a projection.)`,
          },
          {
            type: 'paragraph',
            text: `Neither Direct nor Regular is universally better — it depends on how much guidance you want. A dedicated guide will explore costs in depth.`,
          },
          {
            type: 'cta',
            href: '/calculator-methodology',
            label: 'Read our Calculator Methodology',
            text: `Wondering how a projection is actually worked out? We explain every formula and assumption our tools use, in plain language.`,
          },
        ],
      },
      {
        id: 'taxation',
        heading: 'How Are Mutual Funds Taxed in India?',
        blocks: [
          {
            type: 'paragraph',
            text: `Here is a simple overview of the rules currently in force (after the changes effective 23 July 2024, unchanged by the Budgets since). A mutual fund itself is not taxed — tax applies only when you redeem.`,
          },
          {
            type: 'table',
            caption: `This is an educational summary, not tax advice. Tax rules change and depend on your circumstances — always confirm the current rules or consult a qualified tax professional. A dedicated guide will cover mutual fund taxation in detail.`,
            headers: ['Fund type', 'Holding period', 'Tax treatment (educational summary)'],
            rows: [
              ['Equity funds', 'Up to 12 months (short-term)', '20% on the gains'],
              ['Equity funds', 'More than 12 months (long-term)', '12.5% on gains above 1.25 lakh rupees in a financial year'],
              ['Debt funds (bought on/after 1 Apr 2023)', 'Any period', 'Taxed at your income-tax slab rate'],
            ],
          },
          {
            type: 'paragraph',
            text: `The practical takeaway for a beginner: long-term equity investing is taxed more gently than short-term, and there is an annual exemption on long-term equity gains.`,
          },
        ],
      },
      {
        id: 'how-to-start',
        heading: 'How to Start Investing in Mutual Funds',
        blocks: [
          { type: 'paragraph', text: `Starting is easier than most beginners expect:` },
          {
            type: 'list',
            ordered: true,
            items: [
              `Complete your KYC — a one-time verification using your PAN and Aadhaar, done online in minutes.`,
              `Choose how to invest — through a fund house directly, or via a SEBI-registered platform or distributor.`,
              `Pick a fund that matches your goal and risk comfort using the framework above.`,
              `Decide the amount, frequency, and whether to invest via SIP or lumpsum.`,
              `Set up the auto-debit mandate (for a SIP) so it runs on its own.`,
              `Review once or twice a year — not daily.`,
            ],
          },
          { type: 'subheading', text: `Beginner investment checklist` },
          {
            type: 'table',
            headers: ['Before you invest, have you…', 'Done?'],
            rows: [
              ['Built a 3–6 month emergency fund', '☐'],
              ['Bought adequate term and health insurance', '☐'],
              ['Cleared high-interest debt (e.g., credit cards)', '☐'],
              ['Defined a clear goal and time horizon', '☐'],
              ['Completed your KYC (PAN + Aadhaar)', '☐'],
              ['Added a nominee to your investment', '☐'],
              ['Understood the fund\u2019s riskometer and costs', '☐'],
              ['Accepted that returns are not guaranteed', '☐'],
            ],
          },
        ],
      },
      {
        id: 'who-should-not-invest',
        heading: 'Who Should NOT Invest in Mutual Funds?',
        blocks: [
          {
            type: 'paragraph',
            text: `Mutual funds are an excellent default for many people, but they are genuinely the wrong tool in some situations. You should probably wait or avoid market-linked mutual funds if:`,
          },
          {
            type: 'list',
            items: [
              `You will need the money within a year. A short-term dip could arrive exactly when you need the cash.`,
              `You have not built an emergency fund yet. Invest only after your safety net exists.`,
              `You are carrying high-interest debt. Clearing a credit-card balance is a guaranteed "return" that usually beats investing.`,
              `You cannot tolerate seeing your investment fall, even temporarily. Volatility is normal and unavoidable in equity funds.`,
              `You are looking for guaranteed returns. Mutual funds cannot promise a fixed outcome; safer, fixed-return options fit that need better.`,
            ],
          },
          { type: 'subheading', text: `…and who it is a great fit for` },
          {
            type: 'paragraph',
            text: `A mutual fund tends to suit you well if you earn a regular income, are investing for a goal several years away, prefer not to time the market yourself, and can stay calm and invested when markets dip.`,
          },
          {
            type: 'cta',
            calculatorPath: '/fire-calculator',
            text: `Dreaming of early financial independence? Work out your FIRE number and whether your current pace is on track.`,
          },
          {
            type: 'cta',
            calculatorPath: '/swp-calculator',
            text: `When you eventually want a regular income from what you have built, a Systematic Withdrawal Plan does the reverse of a SIP — see how long your money could last.`,
          },
        ],
      },
      {
        id: 'common-myths',
        heading: 'Common Myths About Mutual Funds',
        blocks: [
          {
            type: 'table',
            headers: ['Myth', 'Reality'],
            rows: [
              ['"Mutual funds give guaranteed returns."', 'Returns are market-linked and can rise or fall. Nothing is guaranteed.'],
              ['"Mutual funds are only for rich people."', 'You can begin with as little as 100–500 rupees a month.'],
              ['"A SIP and a mutual fund are the same thing."', 'A SIP is only a method of investing; the mutual fund is the actual investment.'],
              ['"Mutual funds always beat FDs."', 'Over the long term equity funds often do, but they can also fall — an FD\u2019s return is fixed.'],
              ['"Direct plans are always better than Regular."', 'Direct plans cost less, but if you need guidance, a Regular plan may suit you better.'],
              ['"One good fund is enough forever."', 'Goals, risk, and circumstances change; periodic review is wise.'],
            ],
          },
        ],
      },
      {
        id: 'red-flags',
        heading: 'Red Flags — What to Avoid',
        blocks: [
          { type: 'paragraph', text: `Learning to spot these signals protects you from scams and costly mistakes:` },
          {
            type: 'table',
            headers: ['Red flag', 'What to do instead'],
            rows: [
              ['"Guaranteed" or "assured" high returns', 'Walk away — no market investment can guarantee returns'],
              ['Ads screaming the "highest return" fund', 'Ignore the hype; past returns do not predict future ones'],
              ['Chasing last year\u2019s top-performing fund', 'Stick to your goal and plan, not the leaderboard'],
              ['Investment "tips" on WhatsApp or Telegram', 'Never invest on unsolicited tips; use SEBI-regulated channels'],
              ['Buying only because a friend recommended it', 'Decide based on your own goal, horizon, and risk'],
              ['Pressure to invest "right now, limited time"', 'Genuine investing is never an emergency'],
            ],
          },
          {
            type: 'paragraph',
            text: `Before investing, you can confirm a fund is legitimate: genuine mutual funds are managed by SEBI-registered AMCs, and you can verify schemes and AMCs through SEBI's and AMFI's official websites. If you cannot verify it there, treat that as a red flag in itself.`,
          },
        ],
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes Beginners Make',
        blocks: [
          { type: 'paragraph', text: `Most disappointments come from avoidable habits, not the market:` },
          {
            type: 'list',
            items: [
              `Stopping when markets fall — the worst moment to quit; a falling market is when your fixed amount buys the most units.`,
              `Checking returns every day — daily swings are noise and only breed anxiety.`,
              `Ignoring inflation — money that "grows" slower than prices is quietly losing value.`,
              `Ignoring costs — expense ratios and exit loads compound against you over years.`,
              `Buying too many funds — a dozen overlapping schemes add clutter, not diversification.`,
              `Chasing top-performing funds — yesterday's winner is rarely tomorrow's.`,
              `Investing without a goal — with no clear "why," it is too easy to stop when the money feels inconvenient.`,
            ],
          },
          { type: 'paragraph', text: `Avoiding these is, honestly, half the battle won.` },
        ],
      },
      {
        id: 'glossary',
        heading: 'Glossary of Key Terms',
        blocks: [
          {
            type: 'table',
            headers: ['Term', 'Plain meaning'],
            rows: [
              ['AMC', 'Asset Management Company — the firm that runs the fund and employs the manager'],
              ['NAV', 'Net Asset Value — the price of one unit of the fund on a given day'],
              ['Units', 'The portions of the fund you own, based on how much you invested'],
              ['Expense ratio', 'The fund\u2019s annual fee, shown as a percentage of your investment'],
              ['TER', 'Total Expense Ratio — the full annual cost of running the fund (the expense ratio)'],
              ['Exit load', 'A small fee charged if you redeem within a specified short period'],
              ['Folio', 'Your unique account number with a fund house'],
              ['CAS', 'Consolidated Account Statement — a single statement of your mutual fund holdings'],
              ['RTA', 'Registrar and Transfer Agent (e.g., CAMS, KFintech) that maintains investor records'],
              ['KYC', 'Know Your Customer — the one-time identity verification (PAN + Aadhaar) needed to invest'],
              ['IDCW', 'Income Distribution cum Capital Withdrawal — a fund\u2019s payout option, formerly called "dividend"'],
            ],
          },
        ],
      },
    ],
    keyTakeaways: [
      'A mutual fund pools money from many investors and lets a professional manager invest it across many assets on your behalf — it is a method and a vehicle, not a single product.',
      'You own units; their value is set by the fund\u2019s NAV, which moves with the market — returns are never guaranteed.',
      'India\u2019s trust structure (AMC, trustees, custodian, RTA) plus SEBI regulation make it very hard to misuse your money, but they do not offer deposit insurance or protect against market falls.',
      'Mutual funds belong after an emergency fund, insurance, and clearing high-interest debt — not before.',
      'Choose funds by your goal, time horizon, risk tolerance, age, and liquidity needs.',
      'You can start with as little as 100–250–500 rupees; costs, taxes, and consistency matter more than picking a hot fund.',
      'Some people genuinely should wait — money needed within a year, no safety net, or a need for guaranteed returns.',
      'The biggest risks for beginners are behavioural: chasing performance, panicking in a dip, and ignoring costs and inflation.',
    ],
    faqs: [
      {
        question: 'What is a mutual fund in simple words?',
        answer:
          'It is a shared pool of money from many investors that a professional manages by investing it in ' +
          'assets like shares and bonds. You own a proportional slice, called units.',
      },
      {
        question: 'How does a mutual fund work?',
        answer:
          'Your money joins a pool run by an AMC. The fund manager buys a portfolio; each day its value sets ' +
          'the NAV. You get units equal to your investment divided by the NAV, and your holding is worth your ' +
          'units multiplied by the current NAV.',
      },
      {
        question: 'Is it safe to invest in mutual funds in India?',
        answer:
          'The structure is strongly regulated by SEBI, and your assets are held by a separate custodian, so ' +
          'misuse is very hard. However, safe does not mean fixed — your investment value can still rise or ' +
          'fall with the market, and mutual funds are not deposit-insured.',
      },
      {
        question: 'Can I lose money in a mutual fund?',
        answer:
          'Yes. Because returns are market-linked, your value can fall, especially in the short term. ' +
          'Diversification and a long horizon reduce, but never eliminate, this risk.',
      },
      {
        question: 'What is the minimum amount to start?',
        answer:
          'It varies by fund. Many allow 500 rupees a month, some 100 rupees, and micro-SIPs starting at ' +
          '250 rupees now exist to widen access.',
      },
      {
        question: 'What is the difference between a SIP and a mutual fund?',
        answer:
          'A SIP is only a method — investing a fixed amount regularly. The mutual fund is what you are ' +
          'actually investing in. You use a SIP to invest in a mutual fund gradually.',
      },
      {
        question: 'What is NAV?',
        answer:
          'NAV (Net Asset Value) is the per-unit price of a fund on a given day. A low or high NAV alone says ' +
          'nothing about whether a fund is good or expensive.',
      },
      {
        question: 'Who regulates mutual funds in India?',
        answer:
          'SEBI (the Securities and Exchange Board of India) regulates and supervises them, and AMFI is the ' +
          'industry body that promotes standards and investor awareness.',
      },
      {
        question: 'Are mutual fund returns guaranteed?',
        answer:
          'No. Returns depend on the market and are never guaranteed. Past performance does not predict ' +
          'future results.',
      },
      {
        question: 'Mutual fund vs FD — which is better?',
        answer:
          'An FD offers a fixed, guaranteed return with very low risk; a mutual fund offers higher long-term ' +
          'growth potential with market ups and downs. Each suits different needs.',
      },
      {
        question: 'Do I need a demat account to invest?',
        answer:
          'Not usually. Most mutual funds can be held without a demat account, though ETFs are an exception ' +
          'since they trade on the exchange.',
      },
      {
        question: 'Should I invest in mutual funds if I have a loan or credit-card debt?',
        answer:
          'High-interest debt (like credit cards) usually costs more than a fund is likely to earn, so ' +
          'clearing it first is generally the wiser return. Low-cost, long-term loans are a different judgment.',
      },
      {
        question: 'How do I choose my first mutual fund?',
        answer:
          'Start with your goal, time horizon, risk tolerance, age, and liquidity needs, then match those to a ' +
          'broad fund type. This is educational guidance, not a recommendation of any scheme.',
      },
      {
        question: 'Do I need to add a nominee to my mutual fund?',
        answer:
          'It is expected — when you invest you are asked to add a nominee or explicitly opt out. Adding a ' +
          'nominee makes it far easier for your family to claim the investment later, so it is worth doing.',
      },
      {
        question: 'How do I withdraw money from a mutual fund?',
        answer:
          'You place a redemption request for some or all of your units — usually online or through your ' +
          'platform. The units are sold at the applicable NAV, and the money is credited to your registered ' +
          'bank account, generally within a few working days for open-ended funds. Do check for any exit load ' +
          'or lock-in before you redeem.',
      },
      {
        question: 'How are mutual funds taxed in India?',
        answer:
          'Tax applies only when you redeem. For equity funds, gains are taxed at 20% short-term and 12.5% ' +
          'long-term above 1.25 lakh rupees a year; debt funds bought on or after 1 April 2023 are taxed at ' +
          'your slab rate. This is educational, not tax advice.',
      },
    ],
    relatedCalculators: [
      '/sip-calculator',
      '/lumpsum-calculator',
      '/sip-vs-stepup-sip-calculator',
      '/retirement-calculator',
      '/fire-calculator',
      '/swp-calculator',
    ],
    relatedArticles: ['what-is-sip'],
    references: [
      {
        label: 'SEBI — Investor Education (Securities and Exchange Board of India)',
        url: 'https://investor.sebi.gov.in/',
      },
      { label: 'AMFI — Association of Mutual Funds in India', url: 'https://www.amfiindia.com/' },
      {
        label: 'Income Tax Department, Government of India — capital gains',
        url: 'https://www.incometaxindia.gov.in/',
      },
      { label: 'RBI — Reserve Bank of India', url: 'https://www.rbi.org.in/' },
    ],
    author: DEFAULT_AUTHOR,
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Canonical URL for an article. */
export function articleUrl(slug: string): string {
  return `${LEARN_WEBSITE}/learn/${slug}`;
}

/** Only published articles are ever exposed publicly (listings, sitemap, prerender). */
export function getPublishedArticles(): LearnArticle[] {
  return LEARN_ARTICLES.filter((a) => a.status === 'published');
}

/**
 * True once at least one article is published. Drives the conditional exposure
 * of the Learn section in the top navigation and footer — the entry points stay
 * hidden until there is real content to link to.
 */
export function hasPublishedArticles(): boolean {
  return LEARN_ARTICLES.some((a) => a.status === 'published');
}

/**
 * Resolve an article by slug. Includes drafts, so the article template is
 * viewable in local development; production only serves prerendered (published)
 * routes, so drafts are never reachable there.
 */
export function getArticleBySlug(slug: string): LearnArticle | undefined {
  return LEARN_ARTICLES.find((a) => a.slug === slug);
}

/** Published articles in a category. */
export function articlesByCategory(id: LearnCategoryId): LearnArticle[] {
  return getPublishedArticles().filter((a) => a.category === id);
}

/** Count of published articles in a category (for the category cards). */
export function categoryArticleCount(id: LearnCategoryId): number {
  return articlesByCategory(id).length;
}

/** Category lookup. */
export function getCategory(id: LearnCategoryId): LearnCategory | undefined {
  return LEARN_CATEGORIES.find((c) => c.id === id);
}

/** Featured articles (Phase 1: first few published — empty until launch). */
export function featuredArticles(limit = 3): LearnArticle[] {
  return getPublishedArticles().slice(0, limit);
}

/** Most-recently-updated published articles. */
export function recentArticles(limit = 6): LearnArticle[] {
  return [...getPublishedArticles()]
    .sort((a, b) => b.dateModified.localeCompare(a.dateModified))
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* SEO — Learn homepage                                                       */
/* -------------------------------------------------------------------------- */

export const LEARN_META = {
  title: 'Learn — Investing & Financial Planning Guides | ArthVeda Wealth Studio',
  description:
    'Plain-language guides to SIP, lumpsum, retirement, FIRE and withdrawal planning — the ' +
    'concepts behind the ArthVeda calculators, explained for everyday Indian investors.',
  canonical: `${LEARN_WEBSITE}/learn`,
} as const;

export const LEARN_INTRO =
  'Clear, jargon-free guides to investing and financial planning — the ideas behind every ' +
  'ArthVeda calculator, explained for everyday investors.';

/** CollectionPage JSON-LD for the Learn homepage. */
export function buildLearnCollectionJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ArthVeda Learn',
    url: LEARN_META.canonical,
    description: LEARN_META.description,
    isPartOf: { '@type': 'WebSite', name: 'ArthVeda Wealth Studio', url: LEARN_WEBSITE },
    publisher: { '@type': 'Organization', name: 'ArthVeda Wealth Studio', url: LEARN_WEBSITE },
  });
}

/** BreadcrumbList JSON-LD for the Learn homepage (Home › Learn). */
export function buildLearnBreadcrumbJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: LEARN_WEBSITE },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: LEARN_META.canonical },
    ],
  });
}

/* -------------------------------------------------------------------------- */
/* SEO — Article                                                              */
/* -------------------------------------------------------------------------- */

export function articleMeta(article: LearnArticle): { title: string; description: string; canonical: string } {
  return {
    title: article.seoTitle,
    description: article.description,
    canonical: articleUrl(article.slug),
  };
}

/** Article JSON-LD (Article + author/publisher + dates). */
export function buildArticleJsonLd(article: LearnArticle): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.author.name,
      jobTitle: article.author.role,
      description: article.author.bio,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ArthVeda Wealth Studio',
      url: LEARN_WEBSITE,
      logo: `${LEARN_WEBSITE}/brand/arthveda-logo.png`,
    },
    image: `${LEARN_WEBSITE}/og-image.png`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl(article.slug) },
    isPartOf: { '@type': 'WebSite', name: 'ArthVeda Wealth Studio', url: LEARN_WEBSITE },
  });
}

/** BreadcrumbList JSON-LD for an article (Home › Learn › Article). */
export function buildArticleBreadcrumbJsonLd(article: LearnArticle): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: LEARN_WEBSITE },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: LEARN_META.canonical },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl(article.slug) },
    ],
  });
}

/** FAQPage JSON-LD for an article, or null when it has no FAQ. */
export function buildArticleFaqJsonLd(article: LearnArticle): string | null {
  if (!article.faqs || article.faqs.length === 0) {
    return null;
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  });
}

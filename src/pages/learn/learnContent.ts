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
      logo: `${LEARN_WEBSITE}/favicon.svg`,
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

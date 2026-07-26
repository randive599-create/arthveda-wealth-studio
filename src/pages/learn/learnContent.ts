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
    status: 'published',
    category: 'sip-mutual-funds',
    title: 'SIP vs Lumpsum: Which Investing Strategy Is Right for You?',
    seoTitle: 'SIP vs Lumpsum: Which Strategy Is Right for You? | ArthVeda',
    description:
      'Compare systematic (SIP) investing against a one-time lumpsum investment — the trade-offs, ' +
      'when each makes sense, and how to combine both.',
    heroSummary:
      'Understand the differences between SIP and lumpsum investing, when each approach works best, and ' +
      'how to choose the right strategy based on your financial goals, investment horizon, and available funds.',
    datePublished: '2026-07-18',
    dateModified: '2026-07-18',
    readingMinutes: 10,
    sections: [
      {
        id: 'quick-answer',
        heading: 'Quick Answer',
        blocks: [
          {
            type: 'callout',
            text: `Why trust this guide? This guide is prepared using publicly available information from authoritative sources such as SEBI and AMFI. It is educational only — ArthVeda Wealth Studio is independent and does not recommend any specific mutual fund, AMC, or product. Nothing here is personalised investment advice, so please weigh your own goals and situation before investing.`,
          },
          {
            type: 'callout',
            text: `Quick answer: Neither a SIP nor a lumpsum is "better" in the abstract — they are simply two ways of putting money into the same mutual funds. A SIP invests a fixed amount at regular intervals (usually monthly), which suits money that arrives steadily, like a salary, and spreads your entry across many dates.`,
          },
          {
            type: 'callout',
            text: `A lumpsum invests a single larger amount all at once, which suits a sum you already hold, like a bonus or a maturity payout, and puts the whole amount to work immediately. In both cases your money goes into a market-linked mutual fund, so returns can rise or fall and are never guaranteed.`,
          },
        ],
      },
      {
        id: 'sip-and-lumpsum-are-not-different-investments',
        heading: 'SIP and Lumpsum Are NOT Different Investments',
        blocks: [
          {
            type: 'paragraph',
            text: `The most common confusion for beginners is to treat "SIP" and "lumpsum" as if they were two rival products you have to choose between. They are not. Both are only methods — different ways of moving your money into the very same mutual fund.`,
          },
          {
            type: 'paragraph',
            text: `It helps to keep the hierarchy straight. The mutual fund is what you actually invest in — the professionally managed basket of shares, bonds, or a mix of both. SIP and lumpsum simply describe how you put money into that basket: a little at a time, or all at once. Change the method and the underlying investment does not change at all.`,
          },
          { type: 'subheading', text: `The hierarchy: the fund is the investment, the method is how you enter` },
          {
            type: 'list',
            items: [
              `Mutual fund — the investment itself (for example, an equity, debt, or hybrid fund).`,
              `SIP — a method of entering that fund with a fixed amount at regular intervals.`,
              `Lumpsum — a method of entering that same fund with one larger amount at once.`,
            ],
          },
          {
            type: 'paragraph',
            text: `In other words, you do not choose "a SIP" or "a lumpsum" the way you choose a fund. You first decide which fund fits your goal and risk comfort, and then decide how to invest in it — steadily through a SIP, all at once as a lumpsum, or a combination of the two. Because the destination is identical, the real question is never "which is the better investment," but "which method fits the money I have and how it reaches me."`,
          },
          {
            type: 'table',
            headers: ['Factor', 'SIP', 'Lumpsum'],
            rows: [
              ['How you invest', 'A fixed amount at regular intervals (usually monthly)', 'A single larger amount, all at once'],
              ['Money it suits', 'Money that arrives regularly, like a salary', 'A sum you already hold, like a bonus or maturity payout'],
              ['Entry timing', 'Spread across many dates and prices', 'A single entry point on one date'],
              ['Timing risk', 'Lower — averaged over time', 'Higher — depends on the day you invest'],
              ['Ease for beginners', 'Gentle and largely automatic', 'Needs more comfort with market swings'],
            ],
          },
        ],
      },
      {
        id: 'what-is-sip',
        heading: 'What Is SIP?',
        blocks: [
          {
            type: 'paragraph',
            text: `A SIP, or Systematic Investment Plan, is a method of investing a fixed amount into a mutual fund at regular intervals — most commonly once a month. You decide the amount and the date, set up a one-time auto-debit instruction with your bank, and that amount is invested automatically each period without you having to act again.`,
          },
          { type: 'subheading', text: `How a monthly SIP works over time` },
          {
            type: 'paragraph',
            text: `Imagine you invest ₹5,000 every month through a SIP. On your chosen date each month, 5,000 rupees leaves your bank and buys units of the fund at that day's NAV (the price of one unit). Because the NAV moves with the market, the exact number of units you get differs every month — more units when the price is lower, fewer when it is higher. Month after month these units add up, and the total value of your holding is simply all your accumulated units multiplied by the current NAV. The quiet advantage is consistency: the process runs through calm months and nervous ones alike, so investing becomes a background habit rather than a monthly decision.`,
          },
          { type: 'subheading', text: `Rupee cost averaging` },
          {
            type: 'paragraph',
            text: `Because your amount is fixed while the NAV keeps changing, your money automatically buys more units when prices fall and fewer when they rise. Over time this tends to even out your average purchase price — an effect known as rupee cost averaging. Here is a simplified illustration of a 3,000-rupee monthly investment:`,
          },
          {
            type: 'table',
            caption: `Illustrative only, to show how averaging works — not a projection or a promise. Actual NAVs and returns vary and are never guaranteed.`,
            headers: ['Month', 'Amount invested', 'NAV (rupees)', 'Units bought'],
            rows: [
              ['Month 1', '3,000 rupees', '30', '100'],
              ['Month 2', '3,000 rupees', '20', '150'],
              ['Month 3', '3,000 rupees', '25', '120'],
              ['Total', '9,000 rupees', '—', '370'],
            ],
          },
          {
            type: 'paragraph',
            text: `Across these three months you invested 9,000 rupees and received 370 units — an average cost of about 24.32 rupees per unit, even though the average of the three NAVs was 25 rupees. Notice Month 2: when the price dropped to 20 rupees, your steady 3,000 rupees quietly picked up the most units. It is worth being honest about what this does and does not do: rupee cost averaging lowers timing risk — the danger of investing everything at a single bad moment — but it does not remove market risk, and it never guarantees a profit.`,
          },
          { type: 'subheading', text: `Compounding` },
          {
            type: 'paragraph',
            text: `The second force at work over long periods is compounding. As your investment grows, the returns themselves begin to earn returns, so the value can build on itself the longer you stay invested. This applies to any mutual fund investment, whether you enter through a SIP or a lumpsum — it is driven by time in the market, not by the method you use. As with all market-linked investing, the effect depends on how the fund performs and is not guaranteed.`,
          },
          {
            type: 'cta',
            calculatorPath: '/sip-calculator',
            text: `Curious how a monthly SIP could grow? Model your own amount, time horizon, and return assumption and see the projection update.`,
          },
          {
            type: 'cta',
            href: '/learn/what-is-sip',
            label: 'Read: What Is SIP?',
            text: `Want a deeper, step-by-step guide to SIPs — including types, taxation, and common mistakes? Our beginner guide covers it in detail.`,
          },
        ],
      },
      {
        id: 'what-is-lumpsum',
        heading: 'What Is Lumpsum?',
        blocks: [
          {
            type: 'paragraph',
            text: `A lumpsum investment is the opposite approach in terms of timing: instead of spreading your money across many months, you invest a single larger amount into a mutual fund all at once. The fund and the way it works are exactly the same as with a SIP — only the entry is different.`,
          },
          { type: 'subheading', text: `How a one-time lumpsum works over time` },
          {
            type: 'paragraph',
            text: `Suppose you invest 3,00,000 rupees as a lumpsum. On the day you invest, the entire amount buys units at that day's NAV, and from that moment your full investment is exposed to the market. There is no averaging across dates — your whole entry happens at one price on one day. After that, the value of your units rises and falls with the fund, and over a long horizon it can benefit from compounding. Because the complete amount is working from day one, a lumpsum can do well when markets rise after you invest — and it can feel painful if they fall soon afterwards. That single entry point is why a lumpsum carries more timing risk than a SIP.`,
          },
          {
            type: 'paragraph',
            text: `A lumpsum tends to fit money you already hold as one sum — a bonus, a maturity payout, a gift, or accumulated savings — rather than money that trickles in each month. It asks for a little more comfort with short-term swings, since you see your whole amount move with the market from the start. Some investors who receive a large sum prefer to stagger it into the market over a few months to soften the timing decision, which blends the two methods. None of this is a recommendation to choose one over the other; the right method depends on the money you have and how it reaches you.`,
          },
          {
            type: 'cta',
            calculatorPath: '/lumpsum-calculator',
            text: `Received a one-time amount? Project how a lumpsum might grow over different periods and return assumptions before you decide.`,
          },
          {
            type: 'cta',
            href: '/learn/what-is-a-mutual-fund',
            label: 'Read: What Is a Mutual Fund?',
            text: `New to mutual funds? Our beginner guide explains what a mutual fund is and how it works.`,
          },
        ],
      },
      {
        id: 'which-is-better',
        heading: 'Which Is Better: SIP or Lumpsum?',
        blocks: [
          {
            type: 'paragraph',
            text: `The answer depends on your situation. SIP and lumpsum are not two different investments competing against each other — they are simply two different ways of investing in the same mutual fund. The better approach depends on how your money becomes available, your financial goals, your investment horizon, and how comfortable you are with market movements.`,
          },
          {
            type: 'paragraph',
            text: `For someone earning a regular salary, a SIP often feels natural because investments can be aligned with monthly income. Instead of waiting to accumulate a large amount, the investor can participate consistently over time. For someone who already has a significant amount available, such as a bonus, maturity amount, or accumulated savings, a lumpsum allows that money to be invested immediately.`,
          },
          {
            type: 'paragraph',
            text: `The important point is that neither method guarantees better returns. A SIP does not guarantee profits, and a lumpsum does not automatically create higher returns. The outcome depends on the mutual fund chosen, the time period, market performance, and investor behaviour.`,
          },
          {
            type: 'callout',
            text: `The right question is not "Which method gives higher returns?" but "Which method fits my money flow, goal, and ability to handle market movements?"`,
          },
        ],
      },
      {
        id: 'sip-vs-lumpsum-comparison',
        heading: 'SIP vs Lumpsum: Side-by-Side Comparison',
        blocks: [
          {
            type: 'paragraph',
            text: `Both methods invest in the same mutual fund, but the experience of investing can feel very different. The following comparison highlights the practical differences between SIP and lumpsum investing.`,
          },
          {
            type: 'table',
            headers: ['Factor', 'SIP', 'Lumpsum'],
            rows: [
              ['Investment style', 'Regular investments at fixed intervals', 'One-time investment of a larger amount'],
              ['Source of money', 'Usually suited for regular income like salary', 'Usually suited for money already available'],
              ['Entry points', 'Multiple investment dates', 'Single investment date'],
              ['Impact of market timing', 'Spread across different market levels', 'Entire amount depends on one entry point'],
              ['Investment habit', 'Encourages disciplined investing', 'Requires confidence to invest a larger amount'],
              ['Automation', 'Can be automated through bank mandates', 'Usually requires a one-time decision'],
              ['Short-term market fall after investing', 'Only the latest instalment is immediately affected', 'The entire invested amount is affected'],
              ['Long-term growth potential', 'Depends on fund performance and investment duration', 'Depends on fund performance and investment duration'],
              ['Return guarantee', 'No guarantee of returns', 'No guarantee of returns'],
            ],
          },
          {
            type: 'paragraph',
            text: `These comparisons are general guidelines rather than fixed rules. Your financial goals, investment horizon, available funds, and risk tolerance should always guide the decision between SIP and lumpsum investing.`,
          },
          {
            type: 'paragraph',
            text: `The comparison does not mean one method is always superior. A disciplined SIP investor can achieve strong long-term results, while a lumpsum investor who invests suitable money for a long enough period can also benefit from market growth. The method should match the investor's circumstances rather than being selected based on assumptions.`,
          },
        ],
      },
      {
        id: 'market-timing',
        heading: 'Should You Wait for the Market to Fall?',
        blocks: [
          {
            type: 'paragraph',
            text: `A common question among new investors is whether they should wait for a market correction before investing a lumpsum amount. The thought is understandable — buying at a lower price feels attractive. The challenge is that predicting the exact top or bottom of the market is extremely difficult.`,
          },
          {
            type: 'paragraph',
            text: `Markets can fall after you invest, but they can also continue rising while you wait. An investor who delays investing while waiting for the "right time" may miss periods of market growth. This uncertainty is why many long-term investors focus more on their goals, asset allocation, and investment horizon rather than trying to predict short-term movements.`,
          },
          {
            type: 'paragraph',
            text: `A SIP naturally spreads investments across multiple dates, which reduces dependence on one particular entry point. A lumpsum investment places the entire amount into the market at one time, making the initial entry date more important. However, over longer periods, the time invested and the quality of the investment often matter more than short-term market movements.`,
          },
          {
            type: 'callout',
            text: `Market timing is difficult because future prices are unknown. A suitable investment plan focuses on consistency, time horizon, and risk management rather than perfect prediction.`,
          },
        ],
      },
      {
        id: 'can-you-combine-both',
        heading: 'Can You Combine SIP and Lumpsum?',
        blocks: [
          {
            type: 'paragraph',
            text: `Yes. SIP and lumpsum are not mutually exclusive. Many investors use both methods at different times because their financial situations change throughout their investing journey.`,
          },
          {
            type: 'paragraph',
            text: `For example, an investor may continue a monthly SIP from regular income while also investing a yearly bonus or a maturity amount as a lumpsum. This allows regular savings to continue while putting additional available money to work.`,
          },
          {
            type: 'paragraph',
            text: `Another approach some investors use after receiving a large amount is to gradually move money into the market over time instead of investing everything immediately. This can help reduce the emotional pressure of making one large investment decision, although it does not remove market risk.`,
          },
          {
            type: 'paragraph',
            text: `The choice between SIP, lumpsum, or a combination depends on your cash flow, investment objective, time horizon, and comfort with market fluctuations.`,
          },
          {
            type: 'callout',
            text: `SIP and lumpsum are tools that solve different situations. The method should follow your financial reality, not the other way around.`,
          },
        ],
      },
      {
        id: 'sip-mistakes-beginners-should-avoid',
        heading: 'SIP Mistakes Beginners Should Avoid',
        blocks: [
          {
            type: 'paragraph',
            text: `SIP is one of the simplest ways to start investing in mutual funds, but investors can still make mistakes that affect their long-term results.`,
          },
          { type: 'subheading', text: `1. Starting SIP Without a Clear Goal` },
          {
            type: 'paragraph',
            text: `Many investors begin SIPs without knowing why they are investing. A SIP works better when it is connected to a specific financial goal, such as building wealth, saving for a major expense, or creating long-term financial security.`,
          },
          {
            type: 'paragraph',
            text: `Understanding your goal helps you decide the investment amount, time horizon, and suitable mutual fund category.`,
          },
          { type: 'subheading', text: `2. Stopping SIP During Market Declines` },
          {
            type: 'paragraph',
            text: `Market corrections are a normal part of investing. Many beginners stop their SIPs when markets fall because they fear losses.`,
          },
          {
            type: 'paragraph',
            text: `However, continuing SIP investments during market downturns can allow investors to purchase more mutual fund units at lower prices. Stopping investments due to short-term market movements may reduce the benefits of disciplined investing.`,
          },
          { type: 'subheading', text: `3. Expecting Guaranteed Returns` },
          {
            type: 'paragraph',
            text: `A SIP is only an investment method. It does not guarantee fixed returns.`,
          },
          {
            type: 'paragraph',
            text: `The returns depend on the performance of the underlying mutual fund and market conditions. Investors should understand that equity mutual funds require patience and a long-term approach.`,
          },
          { type: 'subheading', text: `4. Investing Without Reviewing Progress` },
          {
            type: 'paragraph',
            text: `Starting a SIP is only the first step. Investors should periodically review whether their investments are aligned with their goals, risk tolerance, and changing financial situation.`,
          },
          {
            type: 'paragraph',
            text: `Regular review does not mean reacting to every market movement, but ensuring that the investment strategy remains suitable.`,
          },
        ],
      },
      {
        id: 'lumpsum-mistakes-beginners-should-avoid',
        heading: 'Lumpsum Mistakes Beginners Should Avoid',
        blocks: [
          {
            type: 'paragraph',
            text: `Lumpsum investing can be effective, but investing a large amount at the wrong time or without proper planning can create challenges.`,
          },
          { type: 'subheading', text: `1. Investing the Entire Amount Without Planning` },
          {
            type: 'paragraph',
            text: `A common mistake is investing a large amount without considering financial goals, emergency requirements, or investment duration.`,
          },
          {
            type: 'paragraph',
            text: `Before making a lumpsum investment, investors should ensure they have sufficient emergency savings and a clear purpose for the investment.`,
          },
          { type: 'subheading', text: `2. Trying to Predict the Perfect Market Entry` },
          {
            type: 'paragraph',
            text: `Many investors wait for the “best” time to invest or attempt to identify the exact market bottom.`,
          },
          {
            type: 'paragraph',
            text: `While market valuations can be considered, accurately predicting short-term market movements is extremely difficult. Delaying investment decisions for too long may result in missed opportunities.`,
          },
          { type: 'subheading', text: `3. Ignoring Risk Capacity` },
          {
            type: 'paragraph',
            text: `A large investment amount can experience significant short-term fluctuations, especially in equity mutual funds.`,
          },
          {
            type: 'paragraph',
            text: `Investors should select investments based on their ability to handle market volatility rather than investing only because they have available money.`,
          },
          { type: 'subheading', text: `4. Expecting Immediate Results` },
          {
            type: 'paragraph',
            text: `Lumpsum investing does not guarantee quick profits. Markets can move in different directions after investment.`,
          },
          {
            type: 'paragraph',
            text: `A long-term investment approach and patience are important for allowing wealth creation to happen over time.`,
          },
        ],
      },
      {
        id: 'when-should-you-choose-sip',
        heading: 'When Should You Choose SIP?',
        blocks: [
          {
            type: 'paragraph',
            text: `SIP may be suitable for investors who prefer gradual investing and want to build wealth through regular contributions.`,
          },
          {
            type: 'paragraph',
            text: `You may consider choosing SIP when:`,
          },
          {
            type: 'list',
            items: [
              'You receive regular income, such as salary or business income',
              'You want to develop a disciplined investing habit',
              'You are new to mutual fund investing',
              'You do not want to worry about choosing the perfect market entry point',
              'You have long-term financial goals',
            ],
          },
          {
            type: 'paragraph',
            text: `For example, a salaried investor investing ₹10,000 every month through SIP can gradually build a portfolio without requiring a large amount of money upfront.`,
          },
          {
            type: 'paragraph',
            text: `SIP is particularly useful for investors who value consistency and want investing to become a regular financial habit.`,
          },
        ],
      },
      {
        id: 'when-should-you-choose-lumpsum',
        heading: 'When Should You Choose Lumpsum?',
        blocks: [
          {
            type: 'paragraph',
            text: `Lumpsum investment may be suitable when an investor already has a significant amount of money available and understands the risks involved.`,
          },
          {
            type: 'paragraph',
            text: `You may consider choosing lumpsum when:`,
          },
          {
            type: 'list',
            items: [
              'You have received a large amount of money, such as a bonus, inheritance, or business income',
              'You have a long investment horizon',
              'You understand market fluctuations and can remain invested during volatility',
              'Your emergency fund and financial obligations are already managed',
              'You have a clear investment plan',
            ],
          },
          {
            type: 'paragraph',
            text: `For example, an investor with ₹5 lakh available for a long-term goal may choose lumpsum investment to get immediate market exposure.`,
          },
          {
            type: 'paragraph',
            text: `However, investors who are uncomfortable with market timing can consider investing gradually through SIP or using approaches like Systematic Transfer Plans.`,
          },
          {
            type: 'paragraph',
            text: `The suitable choice depends on personal circumstances rather than a universal rule.`,
          },
        ],
      },
      {
        id: 'common-investor-questions-sip-vs-lumpsum',
        heading: 'Common Investor Questions About SIP vs Lumpsum',
        blocks: [
          { type: 'subheading', text: `1. Is SIP safer than lumpsum investment?` },
          {
            type: 'paragraph',
            text: `SIP can reduce the impact of market timing because investments are spread over multiple periods. However, SIP does not eliminate market risk. Both SIP and lumpsum investments are subject to market fluctuations.`,
          },
          { type: 'subheading', text: `2. Which gives better returns: SIP or lumpsum?` },
          {
            type: 'paragraph',
            text: `Neither method always provides higher returns. A lumpsum investment may perform better when markets rise after investment, while SIP can perform better when markets experience volatility over the investment period.`,
          },
          {
            type: 'paragraph',
            text: `The final outcome depends on market conditions, investment duration, and investor behaviour.`,
          },
          { type: 'subheading', text: `3. Can I start SIP and lumpsum in the same mutual fund?` },
          {
            type: 'paragraph',
            text: `Yes. Investors can use both methods in the same mutual fund scheme if it matches their investment strategy and financial goals.`,
          },
          { type: 'subheading', text: `4. Should beginners choose SIP or lumpsum?` },
          {
            type: 'paragraph',
            text: `Many beginners prefer SIP because it requires smaller regular contributions and helps develop investing discipline. However, beginners with available capital and a long-term plan may also consider lumpsum investing.`,
          },
          { type: 'subheading', text: `5. Can I stop my SIP anytime?` },
          {
            type: 'paragraph',
            text: `In most mutual funds, investors can stop future SIP contributions whenever they choose. However, existing investments remain invested unless the investor decides to redeem them.`,
          },
          { type: 'subheading', text: `6. Is investing during a market fall always better?` },
          {
            type: 'paragraph',
            text: `Market falls may provide opportunities, but predicting the lowest point is difficult. Investors should focus on a consistent strategy rather than waiting indefinitely for the perfect time.`,
          },
        ],
      },
      {
        id: 'conclusion',
        heading: 'Conclusion',
        blocks: [
          {
            type: 'paragraph',
            text: `Choosing between SIP and lumpsum is not about finding a universally better investment method. Both approaches can help investors build wealth when used appropriately and aligned with their financial goals.`,
          },
          {
            type: 'paragraph',
            text: `SIP is often suitable for investors who earn regular income and prefer disciplined investing over time. Lumpsum investment may be suitable for those who already have a significant amount available and are comfortable with market fluctuations.`,
          },
          {
            type: 'paragraph',
            text: `Rather than focusing solely on timing the market, investors should develop a long-term investment strategy that matches their goals, risk tolerance, and financial situation. Consistent investing, regular portfolio reviews, and patience are often more important than attempting to predict short-term market movements.`,
          },
          {
            type: 'paragraph',
            text: `Whether you choose SIP, lumpsum, or a combination of both, the most important step is to begin investing with a clear plan and remain committed to your long-term financial objectives.`,
          },
          {
            type: 'paragraph',
            text: `Whichever investment approach you choose, review your portfolio periodically and ensure it continues to align with your financial goals, investment horizon, and risk tolerance.`,
          },
        ],
      },
    ],
    keyTakeaways: [
      'SIP and lumpsum are different investment methods, not different investment products.',
      'SIP involves investing a fixed amount regularly, while lumpsum invests a larger amount at one time.',
      'SIP helps reduce the impact of market timing through regular investing.',
      'Lumpsum investing offers immediate market exposure but carries higher short-term timing risk.',
      'The right choice depends on your financial goals, risk tolerance, investment horizon, and available funds.',
      'Investors can combine SIP and lumpsum strategies based on their circumstances.',
      'Long-term consistency is generally more important than trying to predict short-term market movements.',
    ],
    faqs: [
      {
        question: 'Which is better: SIP or lumpsum investment?',
        answer:
          'There is no single answer. SIP may be suitable for investors with regular income who prefer ' +
          'disciplined investing over time, while lumpsum investment may suit those who already have a ' +
          'larger amount available. The better choice depends on your financial goals, investment horizon, ' +
          'risk tolerance, and available funds.',
      },
      {
        question: 'Is SIP safer than lumpsum investment?',
        answer:
          'SIP helps reduce the impact of investing all your money at one market level because investments ' +
          'are spread over time. However, both SIP and lumpsum investments are subject to market risk, and ' +
          'neither guarantees profits or protects against losses.',
      },
      {
        question: 'Can I invest through SIP and lumpsum in the same mutual fund?',
        answer:
          'Yes. Investors can combine both methods in the same mutual fund scheme. For example, someone may ' +
          'invest a bonus as a lumpsum while continuing monthly SIP contributions for long-term wealth creation.',
      },
      {
        question: 'Should I wait for the market to fall before making a lumpsum investment?',
        answer:
          'Trying to predict market movements consistently is extremely difficult. Instead of waiting ' +
          'indefinitely for the perfect opportunity, investors should make decisions based on their financial ' +
          'plan, investment horizon, and risk tolerance.',
      },
      {
        question: 'Which option is better for beginners: SIP or lumpsum?',
        answer:
          'Many beginners choose SIP because it allows them to invest smaller amounts regularly and develop ' +
          'disciplined investing habits. However, beginners with a long investment horizon and available ' +
          'capital may also consider lumpsum investing if it aligns with their financial plan.',
      },
      {
        question: 'Can I stop my SIP whenever I want?',
        answer:
          'Yes. Most mutual fund SIPs can be stopped, paused, increased, or reduced at any time. Stopping a ' +
          'SIP only affects future contributions; your existing investments remain invested until you choose ' +
          'to redeem them.',
      },
      {
        question: 'Does SIP always give better returns than lumpsum?',
        answer:
          'No. Returns depend on market performance, investment timing, and how long you stay invested. In ' +
          'some situations, lumpsum investing may generate higher returns, while in others, SIP may perform ' +
          'better. Neither approach consistently outperforms the other.',
      },
      {
        question: 'Can I switch from SIP to lumpsum or vice versa?',
        answer:
          'Yes. Your investment strategy can change as your financial situation changes. Many investors use ' +
          'SIP during their earning years and also make occasional lumpsum investments whenever they receive ' +
          'additional funds such as bonuses or inheritances.',
      },
    ],
    relatedCalculators: ['/sip-calculator', '/lumpsum-calculator'],
    relatedArticles: ['what-is-sip'],
    references: [
      { label: 'Association of Mutual Funds in India (AMFI)', url: 'https://www.amfiindia.com/' },
      { label: 'SEBI Investor Education', url: 'https://investor.sebi.gov.in/' },
      { label: 'Securities and Exchange Board of India (SEBI)', url: 'https://www.sebi.gov.in/' },
      { label: 'Reserve Bank of India (RBI)', url: 'https://www.rbi.org.in/' },
    ],
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
  {
    slug: 'types-of-mutual-funds',
    status: 'published',
    category: 'sip-mutual-funds',
    title: 'Types of Mutual Funds in India: Complete Beginner\'s Guide',
    seoTitle: 'Types of Mutual Funds in India (2026): Equity, Debt, Hybrid & More Explained',
    description:
      'Learn about the different types of mutual funds in India, including equity, debt, hybrid, ' +
      'solution-oriented, and passive funds. Understand how SEBI classifies mutual funds, how each ' +
      'category works, and which types are commonly explored for different financial goals.',
    heroSummary:
      'Mutual funds in India are available in several categories, each designed for different ' +
      'investment objectives, risk profiles, and investment horizons. This guide explains SEBI\'s ' +
      'mutual fund classification framework, the major types of mutual funds, and the key differences ' +
      'between them to help investors understand how each category works.',
    datePublished: '2026-07-26',
    dateModified: '2026-07-26',
    readingMinutes: 18,
    sections: [
      {
        id: 'quick-answer',
        heading: 'Quick Answer',
        blocks: [
          {
            type: 'callout',
            text: `Mutual funds in India are classified by the Securities and Exchange Board of India (SEBI) into five broad categories: Equity Schemes, Debt Schemes, Hybrid Schemes, Solution-Oriented Schemes, and Other Schemes. Each category has a different investment objective, portfolio composition, risk profile, and recommended investment horizon. There is no single "best" type of mutual fund—the right category depends on your financial goal, investment horizon, liquidity needs, and risk tolerance.`,
          },
          {
            type: 'paragraph',
            text: `Understanding the different types of mutual funds is one of the most important steps before investing. Every mutual fund category is designed to serve a specific purpose, whether it is long-term wealth creation, generating regular income, preserving capital, or planning for goals such as retirement or a child's future. Knowing how these categories differ can help investors evaluate mutual funds more effectively instead of selecting schemes solely based on recent returns or popularity.`,
          },
        ],
      },
      {
        id: 'why-understanding-mutual-fund-types-matters',
        heading: 'Why Understanding Mutual Fund Types Matters',
        blocks: [
          {
            type: 'paragraph',
            text: `Many first-time investors search for the "best mutual fund" without first understanding how mutual funds are categorized. In reality, every mutual fund category is designed with a different investment strategy and risk profile. A fund that may be appropriate for one investor could be unsuitable for another depending on factors such as financial goals, investment horizon, liquidity requirements, and comfort with market fluctuations.`,
          },
          {
            type: 'paragraph',
            text: `For example, an investor planning for retirement several decades away may evaluate different mutual fund categories than someone saving for a short-term purchase within a few years. Similarly, investors with different risk appetites may prefer different categories even when pursuing the same financial goal. Understanding these differences helps investors compare schemes within the appropriate category instead of comparing funds that are designed for entirely different purposes.`,
          },
          {
            type: 'list',
            items: [
              `Understand how SEBI classifies mutual funds.`,
              `Learn the objective of each mutual fund category.`,
              `Recognize the differences in risk and return characteristics.`,
              `Identify categories commonly associated with different financial goals.`,
              `Avoid selecting mutual funds based only on recent performance.`,
            ],
          },
          {
            type: 'callout',
            text: `A mutual fund category should not be chosen solely because it delivered the highest recent returns. Every category serves a different investment purpose, and understanding that purpose is more important than chasing past performance.`,
          },
        ],
      },
      {
        id: 'sebi-mutual-fund-classification-framework',
        heading: 'SEBI\'s Mutual Fund Classification Framework',
        blocks: [
          {
            type: 'paragraph',
            text: `SEBI introduced a standardized mutual fund categorization framework to bring greater consistency, transparency, and comparability across mutual fund schemes. Before this framework, different Asset Management Companies (AMCs) could launch multiple schemes with similar investment objectives, making it difficult for investors to compare funds effectively. The categorization framework helps ensure that every mutual fund category follows clearly defined investment mandates and regulatory requirements.`,
          },
          {
            type: 'paragraph',
            text: `Under the current framework, mutual funds in India are broadly classified into five major categories. Each category has a distinct investment objective and may contain multiple sub-categories with specific investment mandates. Understanding this structure makes it easier to compare schemes within the same category rather than comparing funds designed for entirely different purposes.`,
          },
          {
            type: 'list',
            items: [
              `Equity Schemes`,
              `Debt Schemes`,
              `Hybrid Schemes`,
              `Solution-Oriented Schemes`,
              `Other Schemes`,
            ],
          },
          {
            type: 'callout',
            text: `SEBI's categorization framework does not rank mutual fund categories from best to worst. Instead, it defines the investment universe and objective that each category must follow.`,
          },
        ],
      },
      {
        id: 'five-broad-types-of-mutual-funds',
        heading: 'The Five Broad Types of Mutual Funds in India',
        blocks: [
          {
            type: 'paragraph',
            text: `SEBI classifies mutual funds into five broad categories based on the assets they primarily invest in and the investment objectives they seek to achieve. Within each broad category are several sub-categories designed for different investment strategies, market segments, and investor needs. The table below provides a simplified overview before we discuss each category in detail.`,
          },
          {
            type: 'table',
            caption: `Overview of SEBI's Five Broad Mutual Fund Categories`,
            headers: ['Category', 'Primary Investments', 'Common Investment Objective'],
            rows: [
              ['Equity Schemes', 'Shares of listed companies', 'Long-term capital appreciation'],
              [
                'Debt Schemes',
                'Government securities, corporate bonds, treasury bills, money market instruments, and other fixed-income securities',
                'Income generation, capital preservation, and liquidity',
              ],
              [
                'Hybrid Schemes',
                'Combination of equity, debt, and/or other asset classes',
                'Balanced risk and diversification',
              ],
              [
                'Solution-Oriented Schemes',
                'Portfolio aligned with specific long-term goals',
                'Goal-based investing such as retirement or children\'s education',
              ],
              [
                'Other Schemes',
                'Index-based portfolios or fund-of-funds',
                'Passive investing or exposure through other mutual fund schemes',
              ],
            ],
          },
          {
            type: 'paragraph',
            text: `Each of these categories serves a different purpose and carries different levels of risk, return potential, and investment horizon. Rather than asking which category is the "best," investors should first understand which category is commonly associated with their financial goal, time horizon, and risk appetite before evaluating individual mutual fund schemes.`,
          },
          {
            type: 'cta',
            calculatorPath: '/sip-calculator',
            text: `Not sure which mutual fund category aligns with your financial goal? Use our SIP Calculator to understand how your investment amount, expected returns, and investment horizon can influence long-term wealth creation before selecting a mutual fund category.`,
          },
        ],
      },
      {
        id: 'equity-mutual-funds',
        heading: 'Equity Mutual Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Equity Mutual Funds primarily invest in the shares of listed companies and are designed to help investors participate in the long-term growth potential of businesses. Since these funds invest in the stock market, their value rises and falls with changes in market prices. As a result, Equity Mutual Funds are generally considered suitable for investors who have a longer investment horizon and are comfortable with market fluctuations.`,
          },
          {
            type: 'paragraph',
            text: `SEBI classifies Equity Mutual Funds into several categories based on factors such as market capitalisation, investment strategy, or the type of companies a fund invests in. Each category follows specific regulatory investment requirements, allowing investors to compare similar funds more effectively and choose schemes that align with their financial goals, risk appetite, and investment horizon.`,
          },
          {
            type: 'paragraph',
            text: `While Equity Mutual Funds have historically offered the potential for long-term capital appreciation, they also carry higher market risk than many other mutual fund categories. Short-term volatility is a normal characteristic of equity investing, which is why investors should evaluate their financial goals, investment horizon, and ability to tolerate market fluctuations before investing.`,
          },
          {
            type: 'callout',
            text: `Equity Mutual Funds are generally better suited for long-term wealth creation rather than short-term financial goals because equity markets can experience significant fluctuations over shorter periods.`,
          },
        ],
      },
      {
        id: 'understanding-market-capitalisation',
        heading: 'Understanding Market Capitalisation',
        blocks: [
          {
            type: 'paragraph',
            text: `Market capitalisation, often called "market cap," refers to the total market value of a company's outstanding shares. It helps classify companies based on their relative size and is one of the key factors used by SEBI to categorize equity mutual funds. Instead of using fixed rupee-value thresholds, SEBI classifies companies according to their full market capitalisation rankings.`,
          },
          {
            type: 'paragraph',
            text: `Understanding market capitalisation makes it easier to understand why different equity mutual funds invest in different groups of companies. Generally, larger companies are considered relatively more established, while smaller companies may offer higher growth potential but can also experience greater price volatility. However, every investment involves risk, and market capitalisation alone should not be used to evaluate the quality of a company or a mutual fund.`,
          },
          {
            type: 'table',
            caption: `SEBI Classification of Companies by Full Market Capitalisation`,
            headers: ['Company Category', 'SEBI Classification'],
            rows: [
              ['Large Cap', '1st to 100th company by full market capitalisation'],
              ['Mid Cap', '101st to 250th company by full market capitalisation'],
              ['Small Cap', '251st company onwards by full market capitalisation'],
            ],
          },
          {
            type: 'callout',
            text: `Companies can move between Large Cap, Mid Cap, and Small Cap categories over time as their market capitalisation rankings change. Mutual funds adjust their portfolios as required to remain compliant with SEBI regulations.`,
          },
        ],
      },
      {
        id: 'large-cap-funds',
        heading: 'Large Cap Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Large Cap Funds are equity mutual funds that invest predominantly in the shares of large-cap companies. According to SEBI regulations, these funds must invest at least 80% of their total assets in large-cap stocks. Large-cap companies are generally well-established businesses with strong market presence, proven operating history, and relatively stable business models compared to smaller companies.`,
          },
          {
            type: 'table',
            caption: `Large Cap Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['Primary Investment', 'Shares of large-cap companies (Top 100 by full market capitalisation)'],
              ['SEBI Requirement', 'At least 80% of total assets invested in large-cap stocks'],
              ['Risk Level', 'Moderate to High'],
              ['Return Potential', 'Market-linked with potential for long-term capital appreciation'],
              ['Typical Investment Horizon', '5 years or longer'],
              ['Suitable For', 'Investors seeking relatively stable equity exposure for long-term goals'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `First-time equity mutual fund investors who understand market risk.`,
              `Investors with long-term financial goals, typically five years or more.`,
              `Investors seeking relatively stable exposure within the equity mutual fund category.`,
              `Investors building a diversified long-term investment portfolio.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Exposure to well-established companies with proven business models.`,
              `Generally lower volatility than mid-cap and small-cap funds.`,
              `Suitable for building the equity portion of a long-term investment portfolio.`,
              `Can be appropriate for first-time equity mutual fund investors who understand market risk.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Large-cap funds can still experience losses during market downturns.`,
              `They may generate relatively lower growth than mid-cap or small-cap funds during certain market cycles.`,
              `Long-term investing is generally more suitable than attempting to benefit from short-term market movements.`,
            ],
          },
          {
            type: 'callout',
            text: `Large Cap Funds are often considered one of the relatively less volatile categories within equity mutual funds, but they are not risk-free and do not guarantee positive returns.`,
          },
        ],
      },
      {
        id: 'mid-cap-funds',
        heading: 'Mid Cap Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Mid Cap Funds are equity mutual funds that invest predominantly in the shares of mid-cap companies. As per SEBI regulations, these funds must invest at least 65% of their total assets in mid-cap stocks. Mid-cap companies are generally businesses that have moved beyond the early stages of growth but still have significant potential to expand further.`,
          },
          {
            type: 'table',
            caption: `Mid Cap Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['Primary Investment', 'Shares of mid-cap companies (Ranked 101st\u2013250th by full market capitalisation)'],
              ['SEBI Requirement', 'At least 65% of total assets invested in mid-cap stocks'],
              ['Risk Level', 'Moderately High'],
              ['Return Characteristics', 'Higher growth potential with higher volatility than large-cap funds'],
              ['Typical Investment Horizon', '7 years or longer'],
              ['Suitable For', 'Investors willing to accept higher volatility in pursuit of long-term growth'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors with a long investment horizon and higher risk tolerance.`,
              `Investors seeking potentially higher long-term growth than large-cap funds.`,
              `Investors who can remain invested during periods of market volatility.`,
              `Investors looking to diversify an existing equity portfolio.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Higher long-term growth potential compared to large-cap funds.`,
              `Exposure to businesses that may become future market leaders.`,
              `Can enhance long-term portfolio growth when combined with other equity fund categories.`,
              `Suitable for investors comfortable with moderate-to-high market fluctuations.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Mid-cap stocks tend to experience greater price fluctuations than large-cap stocks.`,
              `Returns can vary significantly across different market cycles.`,
              `A disciplined long-term investment approach is generally more appropriate than short-term investing.`,
            ],
          },
          {
            type: 'callout',
            text: `Mid Cap Funds can offer attractive long-term growth potential, but investors should be prepared for higher volatility and remain invested through market cycles.`,
          },
        ],
      },
      {
        id: 'small-cap-funds',
        heading: 'Small Cap Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Small Cap Funds are equity mutual funds that invest predominantly in the shares of small-cap companies. Under SEBI regulations, these funds must invest at least 65% of their total assets in small-cap stocks. Small-cap companies generally have greater growth potential than larger businesses, but they also tend to experience higher price volatility and business risk.`,
          },
          {
            type: 'table',
            caption: `Small Cap Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['Primary Investment', 'Shares of small-cap companies (Ranked 251st and below by full market capitalisation)'],
              ['SEBI Requirement', 'At least 65% of total assets invested in small-cap stocks'],
              ['Risk Level', 'High'],
              ['Return Characteristics', 'Highest long-term growth potential with higher market volatility'],
              ['Typical Investment Horizon', '7\u201310 years or longer'],
              ['Suitable For', 'Experienced investors with a high risk tolerance and long investment horizon'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors with a high tolerance for market volatility.`,
              `Investors seeking maximum long-term capital appreciation.`,
              `Investors who can remain invested for at least seven to ten years.`,
              `Investors with a well-diversified investment portfolio.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Highest long-term growth potential among diversified equity mutual fund categories.`,
              `Opportunity to invest in emerging businesses with significant expansion potential.`,
              `Can meaningfully enhance long-term portfolio returns when combined with other equity fund categories.`,
              `Suitable for investors with long investment horizons and strong risk tolerance.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Small-cap funds can experience sharp price fluctuations during market corrections.`,
              `Returns may remain volatile for extended periods.`,
              `Patience and disciplined long-term investing are essential for this category.`,
            ],
          },
          {
            type: 'callout',
            text: `Small Cap Funds have historically delivered strong long-term wealth creation potential in certain market cycles, but they also carry some of the highest levels of risk and volatility among diversified equity mutual funds.`,
          },
        ],
      },
      {
        id: 'flexi-cap-funds',
        heading: 'Flexi Cap Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Flexi Cap Funds are equity mutual funds that can invest across large-cap, mid-cap, and small-cap companies without following fixed allocation limits for each market capitalisation segment. Under SEBI regulations, these funds must invest at least 65% of their total assets in equity and equity-related instruments. The fund manager has the flexibility to adjust the portfolio based on market conditions and investment opportunities.`,
          },
          {
            type: 'table',
            caption: `Flexi Cap Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['Primary Investment', 'Large-cap, mid-cap, and small-cap companies'],
              ['SEBI Requirement', 'At least 65% of total assets invested in equity and equity-related instruments'],
              ['Risk Level', 'Moderately High to High'],
              ['Return Characteristics', 'Diversified growth potential with flexibility across market capitalisation segments'],
              ['Typical Investment Horizon', '5\u20137 years or longer'],
              ['Suitable For', 'Investors seeking a single diversified equity fund managed across market capitalisation segments'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors seeking diversification across large-cap, mid-cap, and small-cap companies through a single fund.`,
              `Investors who prefer allowing the fund manager to decide the allocation across market capitalisation segments.`,
              `Investors with long-term financial goals and moderate-to-high risk tolerance.`,
              `First-time equity investors looking for a diversified equity mutual fund.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Provides diversification across different company sizes within one portfolio.`,
              `Offers flexibility to adapt to changing market conditions.`,
              `Eliminates the need for investors to manually rebalance allocations across large-cap, mid-cap, and small-cap funds.`,
              `Can provide a balanced approach to long-term equity investing.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Fund performance depends significantly on the fund manager's allocation decisions.`,
              `Market volatility can still affect overall portfolio returns.`,
              `Different Flexi Cap Funds may follow significantly different investment strategies.`,
            ],
          },
          {
            type: 'callout',
            text: `Flexi Cap Funds provide diversification with flexibility, making them a popular choice for investors seeking a single long-term equity mutual fund.`,
          },
        ],
      },
      {
        id: 'multi-cap-funds',
        heading: 'Multi Cap Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Multi Cap Funds are equity mutual funds that invest across large-cap, mid-cap, and small-cap companies while maintaining a minimum allocation to each market capitalisation segment. Under SEBI regulations, these funds must invest at least 75% of their total assets in equity and equity-related instruments, with a minimum of 25% each in large-cap, mid-cap, and small-cap stocks. This structure ensures diversified exposure across companies of different sizes.`,
          },
          {
            type: 'table',
            caption: `Multi Cap Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['Primary Investment', 'Large-cap, mid-cap, and small-cap companies'],
              ['SEBI Requirement', 'At least 75% of total assets in equity and equity-related instruments, with a minimum of 25% each in large-cap, mid-cap, and small-cap stocks'],
              ['Risk Level', 'High'],
              ['Return Characteristics', 'Diversified long-term growth across all market capitalisation segments'],
              ['Typical Investment Horizon', '7 years or longer'],
              ['Suitable For', 'Investors seeking mandatory diversification across all market capitalisation segments'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors seeking diversified exposure across large-cap, mid-cap, and small-cap companies.`,
              `Investors who prefer a disciplined allocation framework defined by SEBI.`,
              `Long-term investors comfortable with equity market volatility.`,
              `Investors looking for a single diversified equity mutual fund with balanced market capitalisation exposure.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Mandatory allocation across all three market capitalisation segments provides broad diversification.`,
              `Reduces dependence on any single market-cap segment.`,
              `Offers exposure to both established companies and emerging growth businesses.`,
              `Suitable for building a diversified long-term equity portfolio.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `The mandatory allocation requirement may reduce flexibility during changing market conditions.`,
              `Returns can differ from Flexi Cap Funds because fund managers have less freedom to shift allocations.`,
              `Investors should remain invested for the long term to benefit from market cycles.`,
            ],
          },
          {
            type: 'callout',
            text: `Unlike Flexi Cap Funds, Multi Cap Funds must maintain minimum allocations across large-cap, mid-cap, and small-cap stocks, making diversification a regulatory requirement rather than a portfolio choice.`,
          },
        ],
      },
      {
        id: 'elss-funds',
        heading: 'Equity Linked Savings Scheme (ELSS)',
        blocks: [
          {
            type: 'paragraph',
            text: `Equity Linked Savings Scheme (ELSS) is a category of equity mutual funds that offers tax benefits under Section 80C of the Income-tax Act, 1961, while investing predominantly in equity and equity-related instruments. Under SEBI regulations, ELSS funds must invest at least 80% of their total assets in equity and equity-related securities. Investments in ELSS are subject to a mandatory lock-in period of three years, which is the shortest lock-in among tax-saving investment options eligible under Section 80C.`,
          },
          {
            type: 'table',
            caption: `ELSS Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['Primary Investment', 'Equity and equity-related securities'],
              ['SEBI Requirement', 'At least 80% of total assets invested in equity and equity-related securities'],
              ['Tax Benefit', 'Eligible for deduction under Section 80C of the Income-tax Act, 1961 (subject to prevailing tax laws)'],
              ['Lock-in Period', '3 years from the date of each investment'],
              ['Risk Level', 'High'],
              ['Suitable For', 'Investors seeking long-term wealth creation along with tax-saving benefits'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Taxpayers looking to claim deductions under Section 80C.`,
              `Investors with long-term financial goals and high risk tolerance.`,
              `Individuals seeking equity market exposure while saving taxes.`,
              `Investors comfortable with the mandatory three-year lock-in period.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Provides the dual benefit of long-term wealth creation potential and tax savings.`,
              `Shortest lock-in period among tax-saving investments eligible under Section 80C.`,
              `Professional portfolio management with diversified equity exposure.`,
              `Suitable for disciplined long-term investing.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Investments cannot be redeemed before the completion of the three-year lock-in period.`,
              `Returns are market-linked and are not guaranteed.`,
              `Tax laws may change in the future, affecting available benefits.`,
            ],
          },
          {
            type: 'callout',
            text: `ELSS combines equity investing with tax-saving benefits, but investment decisions should be based on overall financial goals and not solely on tax deductions.`,
          },
        ],
      },
      {
        id: 'focused-funds',
        heading: 'Focused Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Focused Funds are equity mutual funds that invest in a concentrated portfolio of stocks. Under SEBI regulations, these funds can invest in a maximum of 30 stocks while maintaining at least 65% of their total assets in equity and equity-related instruments. The concentrated nature of these funds allows fund managers to build high-conviction portfolios, but it also increases concentration risk.`,
          },
          {
            type: 'table',
            caption: `Focused Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['Primary Investment', 'Concentrated portfolio of equity and equity-related securities'],
              ['SEBI Requirement', 'At least 65% of total assets invested in equity and equity-related instruments; maximum of 30 stocks'],
              ['Risk Level', 'High'],
              ['Return Characteristics', 'Potential for higher returns with higher concentration risk'],
              ['Typical Investment Horizon', '5\u20137 years or longer'],
              ['Suitable For', 'Investors comfortable with concentrated equity portfolios and higher risk'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors with a high risk tolerance.`,
              `Investors who have confidence in active fund management.`,
              `Long-term investors seeking potentially higher returns from a concentrated portfolio.`,
              `Investors who already have a diversified overall investment portfolio.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Concentrated portfolios allow fund managers to focus on their highest-conviction investment ideas.`,
              `Can outperform diversified equity funds if stock selection is successful.`,
              `Professional active portfolio management.`,
              `Suitable for experienced equity investors seeking focused exposure.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Concentration increases the impact of poor-performing stocks on overall returns.`,
              `Returns may be more volatile than broadly diversified equity funds.`,
              `Fund manager selection becomes particularly important in this category.`,
            ],
          },
          {
            type: 'callout',
            text: `Focused Funds aim to generate long-term wealth through a concentrated portfolio, but higher concentration also increases investment risk.`,
          },
        ],
      },
      {
        id: 'value-funds',
        heading: 'Value Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Value Funds are equity mutual funds that follow a value investing strategy by investing predominantly in stocks that appear undervalued relative to their intrinsic worth. Under SEBI regulations, Value Funds must invest at least 65% of their total assets in equity and equity-related instruments. Fund managers aim to identify companies trading below their estimated intrinsic value with the expectation that their market prices may better reflect their fundamentals over time.`,
          },
          {
            type: 'table',
            caption: `Value Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['Primary Investment', 'Undervalued equity and equity-related securities'],
              ['SEBI Requirement', 'At least 65% of total assets invested in equity and equity-related instruments'],
              ['Risk Level', 'Moderately High to High'],
              ['Return Characteristics', 'Long-term appreciation driven by value investing'],
              ['Typical Investment Horizon', '7 years or longer'],
              ['Suitable For', 'Investors who believe in long-term value investing and can remain patient through market cycles'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Long-term investors who prefer a value investing approach.`,
              `Investors comfortable waiting for market prices to reflect business fundamentals.`,
              `Investors seeking diversified equity exposure through undervalued companies.`,
              `Investors with moderate-to-high risk tolerance.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Provides exposure to companies that may be trading below their estimated intrinsic value.`,
              `Encourages a disciplined long-term investment approach.`,
              `Can perform well during periods when value investing is favored by the market.`,
              `Professionally managed diversified equity portfolio.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Undervalued stocks may remain undervalued for extended periods.`,
              `Performance can lag growth-oriented investment strategies during certain market cycles.`,
              `Patience is essential to benefit from the value investing approach.`,
            ],
          },
          {
            type: 'callout',
            text: `Value Funds follow a long-term investment philosophy, and returns depend on whether the market eventually recognizes the underlying value of portfolio companies.`,
          },
        ],
      },
      {
        id: 'contra-funds',
        heading: 'Contra Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Contra Funds are equity mutual funds that follow a contrarian investment strategy by investing in companies or sectors that are temporarily out of favor with the broader market but are believed to have long-term recovery potential. Under SEBI regulations, Contra Funds must invest at least 65% of their total assets in equity and equity-related instruments. The objective is to benefit from changes in market sentiment over time rather than following prevailing market trends.`,
          },
          {
            type: 'table',
            caption: `Contra Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['Primary Investment', 'Out-of-favor equity and equity-related securities with long-term recovery potential'],
              ['SEBI Requirement', 'At least 65% of total assets invested in equity and equity-related instruments'],
              ['Risk Level', 'High'],
              ['Return Characteristics', 'Long-term appreciation through contrarian investing'],
              ['Typical Investment Horizon', '7 years or longer'],
              ['Suitable For', 'Investors comfortable with contrarian investment strategies and long holding periods'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors with a long investment horizon and high risk tolerance.`,
              `Investors who understand that market sentiment can change over time.`,
              `Investors willing to remain invested even when portfolio holdings are temporarily unpopular.`,
              `Investors seeking diversification through a contrarian investment approach.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Provides exposure to companies that may be temporarily undervalued due to market sentiment.`,
              `Can generate attractive long-term returns if recovery expectations materialize.`,
              `Encourages disciplined investing by avoiding herd behavior.`,
              `Professionally managed portfolio following a distinct investment strategy.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Recovery in out-of-favor sectors or companies may take longer than expected.`,
              `Performance can remain weak for extended periods before improving.`,
              `Requires patience and a long-term investment mindset.`,
            ],
          },
          {
            type: 'callout',
            text: `Contra Funds invest against prevailing market sentiment, making them suitable only for investors who understand the risks associated with contrarian investing and can remain patient over the long term.`,
          },
        ],
      },
      {
        id: 'debt-mutual-funds',
        heading: 'Debt Mutual Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Debt Mutual Funds primarily invest in fixed-income securities such as government securities, treasury bills, corporate bonds, commercial papers, certificates of deposit, and other debt instruments. Unlike equity funds, these funds aim to generate relatively stable returns through interest income while preserving capital.`,
          },
          {
            type: 'paragraph',
            text: `Debt funds are generally less volatile than equity funds because they do not invest primarily in company shares. Instead, their performance depends on factors such as interest rates, credit quality, bond maturity, and overall economic conditions. While they typically offer lower long-term return potential than equity funds, they also experience comparatively lower market volatility.`,
          },
          {
            type: 'paragraph',
            text: `SEBI classifies debt mutual funds into multiple categories based on the maturity profile and type of debt instruments they invest in. Each category serves a different investment objective, ranging from parking surplus money for a few days to generating stable income over several years.`,
          },
          {
            type: 'table',
            caption: `Overview of SEBI Debt Mutual Fund Categories`,
            headers: ['Category', 'Primary Investment Focus', 'Typical Investment Horizon'],
            rows: [
              ['Liquid Funds', 'Very short-term money market instruments', 'Few days to 3 months'],
              ['Overnight Funds', 'Overnight securities', '1 day'],
              ['Ultra Short Duration Funds', 'Very short-duration debt instruments', '3\u20136 months'],
              ['Low Duration Funds', 'Short-term debt securities', '6\u201312 months'],
              ['Money Market Funds', 'Money market instruments', 'Up to 1 year'],
              ['Short Duration Funds', 'Short- to medium-term debt instruments', '1\u20133 years'],
              ['Medium Duration Funds', 'Medium-term debt instruments', '3\u20134 years'],
              ['Medium to Long Duration Funds', 'Medium- to long-term debt instruments', '4\u20137 years'],
              ['Long Duration Funds', 'Long-maturity debt securities', '7 years or more'],
              ['Dynamic Bond Funds', 'Debt securities of varying maturities', 'Depends on fund strategy'],
              ['Corporate Bond Funds', 'Highest-rated corporate bonds', '2\u20134 years'],
              ['Credit Risk Funds', 'Lower-rated corporate bonds', '3 years or more'],
              ['Banking & PSU Funds', 'Banking and Public Sector debt', '2\u20134 years'],
              ['Gilt Funds', 'Government securities', '3\u20135 years or more'],
              ['Gilt Funds with 10-Year Constant Duration', 'Government securities maintaining 10-year duration', '5 years or more'],
              ['Floater Funds', 'Floating-rate debt securities', 'Depends on interest-rate cycle'],
            ],
          },
          {
            type: 'paragraph',
            text: `Let's now understand each debt mutual fund category in detail so you can identify which one best matches your investment horizon, liquidity needs, and risk tolerance.`,
          },
          {
            type: 'callout',
            text: `Debt mutual funds are generally suitable for investors seeking relatively stable returns with lower volatility than equity funds, but every category carries its own interest-rate risk, credit risk, and investment horizon.`,
          },
        ],
      },
      {
        id: 'liquid-funds',
        heading: 'Liquid Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Liquid Funds are one of the safest categories of debt mutual funds. They invest in very short-term money market instruments with a maturity of up to 91 days, making them suitable for parking surplus cash while earning potentially better returns than a regular savings account. Due to their short maturity profile, they are generally less sensitive to interest rate fluctuations.`,
          },
          {
            type: 'table',
            caption: `Liquid Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Requirement', 'Invest only in debt and money market securities with maturity up to 91 days'],
              ['Primary Investment', 'Treasury Bills, Commercial Papers, Certificates of Deposit, and other money market instruments'],
              ['Risk Level', 'Very Low'],
              ['Return Potential', 'Low'],
              ['Typical Investment Horizon', 'Few days to 3 months'],
              ['Best For', 'Parking emergency funds and short-term surplus money'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors looking to park surplus cash for a short period.`,
              `Individuals building or maintaining an emergency fund.`,
              `Investors seeking high liquidity with relatively low risk.`,
              `Businesses managing temporary cash balances.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `High liquidity with quick access to funds.`,
              `Relatively low interest-rate risk.`,
              `Suitable for emergency savings and temporary cash parking.`,
              `Potentially better returns than keeping idle money in a savings account.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Returns are not guaranteed.`,
              `Long-term wealth creation potential is limited.`,
              `Exit load may apply for very early withdrawals depending on the scheme.`,
            ],
          },
          {
            type: 'callout',
            text: `Liquid Funds are designed for capital preservation and liquidity, not for long-term wealth creation. They are most effective when used for short-term cash management rather than long-term investing.`,
          },
        ],
      },
      {
        id: 'overnight-funds',
        heading: 'Overnight Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Overnight Funds invest exclusively in debt securities that mature within one business day. Since the underlying securities mature every day, these funds carry minimal interest-rate risk and are considered one of the lowest-risk categories among debt mutual funds. They are primarily used for temporarily parking money with maximum liquidity and capital preservation.`,
          },
          {
            type: 'table',
            caption: `Overnight Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Requirement', 'Invest in overnight securities with a maturity of one business day'],
              ['Primary Investment', 'Overnight money market securities'],
              ['Risk Level', 'Very Low'],
              ['Return Potential', 'Low'],
              ['Typical Investment Horizon', '1 day to a few days'],
              ['Best For', 'Parking money for extremely short periods with minimal risk'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors parking money for one or a few days.`,
              `Businesses managing daily cash balances.`,
              `Investors seeking maximum capital preservation.`,
              `Investors requiring immediate liquidity with minimal volatility.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Extremely low interest-rate risk.`,
              `High liquidity.`,
              `Suitable for very short-term cash management.`,
              `Very low portfolio volatility.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Return potential is limited.`,
              `Not suitable for long-term investing.`,
              `Returns are generally lower than most other debt fund categories.`,
            ],
          },
          {
            type: 'callout',
            text: `Overnight Funds prioritize safety and liquidity over returns, making them suitable only for very short-term cash management rather than long-term wealth creation.`,
          },
        ],
      },
      {
        id: 'ultra-short-duration-funds',
        heading: 'Ultra Short Duration Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Ultra Short Duration Funds invest in debt and money market instruments with a Macaulay duration of between 3 and 6 months. These funds aim to generate slightly higher returns than Liquid and Overnight Funds while maintaining relatively low interest-rate risk. They are suitable for investors looking to park money for a few months without taking significant market risk.`,
          },
          {
            type: 'table',
            caption: `Ultra Short Duration Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Requirement', 'Macaulay duration between 3 and 6 months'],
              ['Primary Investment', 'Short-term debt and money market instruments'],
              ['Risk Level', 'Low'],
              ['Return Potential', 'Low to Moderate'],
              ['Typical Investment Horizon', '3\u20136 months'],
              ['Best For', 'Investors seeking better short-term returns with relatively low risk'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors with an investment horizon of 3 to 6 months.`,
              `Investors seeking relatively stable short-term returns.`,
              `Individuals parking surplus funds for upcoming expenses.`,
              `Conservative investors willing to accept slightly higher risk than Liquid Funds.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Potentially higher returns than Liquid and Overnight Funds.`,
              `Relatively low interest-rate risk.`,
              `Suitable for short-term financial goals.`,
              `Better diversification across short-term debt securities.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Returns are not guaranteed.`,
              `Interest-rate movements can affect short-term performance.`,
              `Not suitable for long-term wealth creation.`,
            ],
          },
          {
            type: 'callout',
            text: `Ultra Short Duration Funds offer a balance between liquidity and return potential, making them suitable for investors with short-term financial goals who can stay invested for several months.`,
          },
        ],
      },
      {
        id: 'low-duration-funds',
        heading: 'Low Duration Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Low Duration Funds invest in debt and money market instruments with a Macaulay duration of between 6 months and 12 months. They aim to provide relatively stable returns by investing in slightly longer-duration securities compared to Ultra Short Duration Funds. However, they carry somewhat higher interest-rate risk due to their longer maturity profile.`,
          },
          {
            type: 'table',
            caption: `Low Duration Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Requirement', 'Macaulay duration between 6 months and 12 months'],
              ['Primary Investment', 'Short-term debt and money market instruments'],
              ['Risk Level', 'Low to Moderate'],
              ['Return Potential', 'Low to Moderate'],
              ['Typical Investment Horizon', '6\u201312 months'],
              ['Best For', 'Investors with short-term goals who can accept slightly higher risk than Liquid Funds'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors with a 6 to 12 month investment horizon.`,
              `Investors looking for alternatives to traditional short-term deposits.`,
              `Investors seeking relatively stable returns with moderate liquidity.`,
              `Conservative investors comfortable with limited interest-rate risk.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Potentially better returns than shorter-duration debt funds.`,
              `Suitable for short-term financial planning.`,
              `Lower volatility compared to longer-duration debt funds.`,
              `Provides exposure to diversified short-term debt instruments.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Returns are not guaranteed.`,
              `Interest-rate changes can impact returns.`,
              `Not suitable for very short holding periods.`,
            ],
          },
          {
            type: 'callout',
            text: `Low Duration Funds can be useful for investors seeking a balance between stability and return potential over a period of several months, but they should match the investor's time horizon and risk tolerance.`,
          },
        ],
      },
      {
        id: 'medium-duration-funds',
        heading: 'Medium Duration Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Medium Duration Funds invest in debt and money market instruments such that the portfolio maintains a Macaulay duration of between 3 years and 4 years. As per SEBI's debt fund classification, this places them between shorter-duration categories, such as Low Duration Funds, and longer-duration categories. Because their portfolios hold securities with longer maturities, these funds are more sensitive to interest-rate movements than short-duration debt funds, but they also aim to offer relatively higher return potential over a medium-term investment horizon.`,
          },
          {
            type: 'table',
            caption: `Medium Duration Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Open-ended debt scheme investing in instruments with a portfolio Macaulay duration of 3 to 4 years'],
              ['Typical Portfolio Duration', 'Macaulay duration between 3 and 4 years'],
              ['Primary Investments', 'Corporate bonds, government securities, and other debt and money market instruments'],
              ['Risk Level', 'Moderate'],
              ['Expected Return Profile', 'Moderate'],
              ['Typical Investment Horizon', '3\u20134 years'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors with a medium-term investment horizon of around three to four years.`,
              `Investors who can accept moderate fluctuations in returns caused by interest-rate movements.`,
              `Investors seeking potentially higher returns than shorter-duration debt funds.`,
              `Investors looking to diversify a debt allocation beyond very short-term categories.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Potential for higher returns than shorter-duration debt funds over the medium term.`,
              `Diversified exposure across corporate bonds and government securities.`,
              `A clearly defined Macaulay duration range that keeps the fund's strategy transparent.`,
              `Suitable for medium-term financial goals within a debt portfolio.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Longer portfolio duration makes these funds more sensitive to interest-rate changes than short-duration funds.`,
              `Returns are market-linked and are not guaranteed.`,
              `The credit quality of the underlying securities can affect overall performance.`,
            ],
          },
          {
            type: 'callout',
            text: `Medium Duration Funds sit between short- and long-duration debt categories, offering moderate return potential in exchange for greater interest-rate sensitivity, so they are most appropriate for investors who can genuinely stay invested over a three-to-four-year horizon.`,
          },
        ],
      },
      {
        id: 'medium-to-long-duration-funds',
        heading: 'Medium to Long Duration Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Medium to Long Duration Funds invest in debt and money market instruments such that the portfolio maintains a Macaulay duration of between 4 years and 7 years. Under SEBI's debt fund classification, this positions them above Medium Duration Funds and just below Long Duration Funds. Because the portfolio holds securities with longer maturities, these funds are more sensitive to interest-rate movements: when interest rates fall, longer-duration bond prices tend to rise more, and when rates rise, they tend to fall more. In exchange for accepting this higher interest-rate sensitivity, investors seek relatively higher return potential over a longer investment horizon.`,
          },
          {
            type: 'table',
            caption: `Medium to Long Duration Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Open-ended debt scheme investing in instruments with a portfolio Macaulay duration of 4 to 7 years'],
              ['Typical Portfolio Duration', 'Macaulay duration between 4 and 7 years'],
              ['Primary Investments', 'Government securities, corporate bonds, and other debt and money market instruments'],
              ['Risk Level', 'Moderate to High'],
              ['Expected Return Profile', 'Moderate'],
              ['Typical Investment Horizon', '4\u20137 years'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors with a longer-term investment horizon of around four to seven years.`,
              `Investors who can tolerate higher fluctuations in returns caused by interest-rate movements.`,
              `Investors seeking potentially higher returns than medium-duration debt funds.`,
              `Investors comfortable holding a longer-duration debt allocation through interest-rate cycles.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Potential for higher returns than shorter- and medium-duration debt funds over a longer horizon.`,
              `Can benefit meaningfully during periods of falling interest rates.`,
              `Diversified exposure across government securities and corporate bonds.`,
              `A clearly defined Macaulay duration range that keeps the fund's strategy transparent.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Higher portfolio duration makes these funds notably more sensitive to interest-rate changes, which can increase short-term volatility.`,
              `Returns are market-linked and are not guaranteed.`,
              `The category is generally unsuitable for investors with short holding periods.`,
            ],
          },
          {
            type: 'callout',
            text: `Medium to Long Duration Funds carry higher duration exposure and therefore greater interest-rate sensitivity than most other debt categories, so they are most appropriate for investors who can genuinely stay invested over a four-to-seven-year horizon and can tolerate interim fluctuations in returns.`,
          },
        ],
      },
      {
        id: 'long-duration-funds',
        heading: 'Long Duration Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Long Duration Funds invest in debt and money market instruments such that the portfolio maintains a Macaulay duration of greater than 7 years. Under SEBI's debt fund classification, this makes them the longest-duration category among debt mutual funds. A longer duration means the portfolio's value reacts more strongly to changes in interest rates: when interest rates fall, the prices of longer-maturity bonds tend to rise significantly, and when interest rates rise, their prices tend to fall just as sharply. This heightened interest-rate sensitivity can lead to meaningful short-term fluctuations in returns, which is why these funds are generally intended for investors with a long investment horizon who can stay invested through complete interest-rate cycles.`,
          },
          {
            type: 'table',
            caption: `Long Duration Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Open-ended debt scheme investing in instruments with a portfolio Macaulay duration of more than 7 years'],
              ['Typical Portfolio Duration', 'Macaulay duration greater than 7 years'],
              ['Primary Investments', 'Long-maturity government securities, corporate bonds, and other debt instruments'],
              ['Risk Level', 'High'],
              ['Expected Return Profile', 'Moderate'],
              ['Typical Investment Horizon', '7 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors with a long investment horizon of seven years or more.`,
              `Investors who understand debt market and interest-rate cycles.`,
              `Investors who can tolerate significant interim fluctuations in returns.`,
              `Investors seeking to benefit from an anticipated long-term decline in interest rates.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Highest sensitivity to falling interest rates, which can enhance returns during rate-cut cycles.`,
              `Access to long-maturity government securities and high-quality bonds through a single fund.`,
              `A clearly defined Macaulay duration mandate that keeps the fund's strategy transparent.`,
              `Can play a specific role in a long-term, duration-aware debt allocation.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `This category carries the highest interest-rate risk among debt funds, so returns can be volatile in the short term.`,
              `Returns are market-linked and are not guaranteed.`,
              `The category is generally unsuitable for investors with short- or medium-term goals.`,
            ],
          },
          {
            type: 'callout',
            text: `Long Duration Funds carry the highest duration exposure among debt categories and are therefore the most sensitive to interest-rate movements, so they require a genuinely long holding period and are suitable only for investors who understand debt market cycles and can tolerate significant interim volatility.`,
          },
        ],
      },
      {
        id: 'dynamic-bond-funds',
        heading: 'Dynamic Bond Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Dynamic Bond Funds are debt mutual funds that invest across different maturity profiles without being tied to a fixed duration band. Under SEBI's debt fund classification, they are defined as open-ended dynamic debt schemes that invest across duration. Unlike fixed-duration categories such as Low, Medium, or Long Duration Funds, a Dynamic Bond Fund gives the fund manager the flexibility to shift the portfolio between short-maturity and long-maturity securities based on their expectations of how interest rates will move. When the manager anticipates falling interest rates, the portfolio's duration may be increased to benefit from rising bond prices; when rates are expected to rise, duration may be reduced to limit the impact. This flexibility can be an advantage, but because outcomes depend heavily on the manager's interest-rate calls, performance is closely tied to those active management decisions.`,
          },
          {
            type: 'table',
            caption: `Dynamic Bond Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Open-ended dynamic debt scheme investing across duration'],
              ['Portfolio Strategy', 'Actively adjusts portfolio duration based on the fund manager\'s interest-rate expectations'],
              ['Primary Investments', 'Government securities, corporate bonds, and other debt and money market instruments across maturities'],
              ['Risk Level', 'Moderate to High'],
              ['Expected Return Profile', 'Moderate'],
              ['Typical Investment Horizon', '3 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors who prefer to let the fund manager decide portfolio duration rather than choosing a fixed-duration category themselves.`,
              `Investors with a medium- to long-term investment horizon.`,
              `Investors who can tolerate fluctuations arising from changes in portfolio duration.`,
              `Investors comfortable relying on active management through interest-rate cycles.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Flexibility to adjust duration across changing interest-rate environments.`,
              `Removes the need for investors to time interest-rate movements themselves.`,
              `Diversified exposure across securities of varying maturities.`,
              `Can adapt the portfolio as the fund manager's outlook on rates evolves.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Returns depend significantly on the fund manager's interest-rate decisions, which may not always be correct.`,
              `Returns are market-linked and are not guaranteed.`,
              `Duration can change over time, so the fund's risk profile is less predictable than fixed-duration categories.`,
            ],
          },
          {
            type: 'callout',
            text: `Dynamic Bond Funds offer flexible duration management that shifts with the interest-rate cycle, but because their returns are market-linked and depend on the fund manager's active calls, they are most appropriate for investors who understand active debt management and can stay invested through changing rate environments.`,
          },
        ],
      },
      {
        id: 'corporate-bond-funds',
        heading: 'Corporate Bond Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Corporate Bond Funds are debt mutual funds that invest predominantly in bonds issued by companies. Under SEBI's debt fund classification, a Corporate Bond Fund must invest at least 80% of its total assets in the highest-rated corporate bonds, which means it focuses on high-quality corporate debt securities rather than lower-rated instruments. Unlike Gilt Funds, which invest in government securities carrying no credit risk, Corporate Bond Funds take on the credit risk of the issuing companies — though this is limited by the mandate to hold predominantly top-rated bonds. Their returns are influenced by two main factors: the credit quality of the underlying issuers and the movement of interest rates, since bond prices generally fall when interest rates rise and rise when interest rates fall.`,
          },
          {
            type: 'table',
            caption: `Corporate Bond Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Open-ended debt scheme investing predominantly in the highest-rated corporate bonds'],
              ['Minimum Corporate Bond Allocation', 'At least 80% of total assets in the highest-rated corporate bonds'],
              ['Primary Investments', 'High-quality corporate bonds and other debt and money market instruments'],
              ['Risk Level', 'Low to Moderate'],
              ['Expected Return Profile', 'Moderate'],
              ['Typical Investment Horizon', '2\u20134 years'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors seeking relatively stable income from high-quality corporate debt.`,
              `Investors with a short- to medium-term investment horizon.`,
              `Investors looking for potentially higher returns than government-security funds while keeping credit risk relatively contained.`,
              `Conservative investors comfortable with limited credit and interest-rate risk.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Focus on the highest-rated corporate bonds helps keep credit risk relatively low.`,
              `Potential for higher income than funds investing only in government securities.`,
              `Diversified exposure across quality corporate issuers.`,
              `A clearly defined SEBI mandate that keeps the fund's credit-quality focus transparent.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Even highly rated corporate bonds carry some credit risk, unlike government securities.`,
              `Interest-rate movements can affect the fund's returns.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Corporate Bond Funds focus on high-quality corporate debt, offering higher income potential than government-security funds in exchange for some credit risk, so investors should pay attention to the portfolio's credit quality and remember that returns remain market-linked.`,
          },
        ],
      },
      {
        id: 'credit-risk-funds',
        heading: 'Credit Risk Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Credit Risk Funds are debt mutual funds that invest predominantly in corporate bonds rated below the highest credit rating. Under SEBI's debt fund classification, a Credit Risk Fund must invest at least 65% of its total assets in corporate bonds below the highest-rated instruments. Because lower-rated bonds carry a greater chance of the issuer delaying or defaulting on payments, these funds take on higher credit risk than Corporate Bond Funds, which focus on the highest-rated debt. In return for accepting this additional risk, investors seek higher return potential, since lower-rated issuers typically pay higher interest to attract lenders. This makes careful credit analysis and issuer quality central to how these funds are managed, as a downgrade or default among the underlying holdings can meaningfully affect returns.`,
          },
          {
            type: 'table',
            caption: `Credit Risk Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Open-ended debt scheme investing predominantly in corporate bonds below the highest ratings'],
              ['Minimum Lower-Rated Corporate Bond Allocation', 'At least 65% of total assets in corporate bonds below the highest-rated instruments'],
              ['Primary Investments', 'Lower-rated corporate bonds and other debt and money market instruments'],
              ['Risk Level', 'High'],
              ['Expected Return Profile', 'Moderate to High'],
              ['Typical Investment Horizon', '3 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors with a higher risk appetite seeking potentially higher returns from debt.`,
              `Investors who understand credit risk, downgrades, and default risk.`,
              `Investors with a medium- to long-term investment horizon.`,
              `Investors comfortable relying on the fund manager's credit-selection process.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Potential for higher returns than funds investing only in the highest-rated bonds.`,
              `Higher interest income from lower-rated corporate issuers.`,
              `Diversified exposure across a range of corporate bond issuers.`,
              `Active credit selection can add value when issuer quality is assessed well.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Lower-rated bonds carry a higher risk of downgrades and defaults, which can reduce returns.`,
              `Returns are market-linked and are not guaranteed.`,
              `This category is generally less suitable for conservative investors seeking capital stability.`,
            ],
          },
          {
            type: 'callout',
            text: `Credit Risk Funds pursue higher returns by investing in lower-rated corporate bonds, which means greater exposure to downgrade and default risk, so they suit only investors who understand issuer credit quality and accept that returns are market-linked and can be affected by credit events.`,
          },
        ],
      },
      {
        id: 'banking-and-psu-funds',
        heading: 'Banking and PSU Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Banking and PSU Funds are debt mutual funds that invest predominantly in debt instruments issued by banks, public sector undertakings, public financial institutions, and municipal bodies. Under SEBI's debt fund classification, these funds must invest at least 80% of their total assets in debt instruments of banks, Public Sector Undertakings (PSUs), Public Financial Institutions, and Municipal Bonds. Because these issuers are large, well-established institutions — many of them government-backed — the category is generally associated with high-quality issuers and relatively lower credit risk than funds focused on corporate or lower-rated debt. However, credit risk (the chance an issuer fails to pay) and interest-rate risk (the effect of changing interest rates on bond prices) are two distinct factors: even high-quality issuers do not remove interest-rate risk, so the fund's value can still move as rates change, and returns remain market-linked.`,
          },
          {
            type: 'table',
            caption: `Banking and PSU Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Open-ended debt scheme investing predominantly in debt instruments of banks, PSUs, Public Financial Institutions, and Municipal Bonds'],
              ['Minimum Allocation Requirement', 'At least 80% of total assets in debt instruments of banks, PSUs, Public Financial Institutions, and Municipal Bonds'],
              ['Primary Investments', 'Debt instruments issued by banks, public sector undertakings, financial institutions, and municipal bodies'],
              ['Risk Level', 'Low to Moderate'],
              ['Expected Return Profile', 'Moderate'],
              ['Typical Investment Horizon', '2\u20134 years'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors seeking exposure to high-quality institutional issuers.`,
              `Investors who prefer relatively lower credit risk within debt funds.`,
              `Investors with a short- to medium-term investment horizon.`,
              `Conservative investors comfortable with some interest-rate sensitivity.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Focus on strong, well-established institutional issuers helps keep credit risk relatively low.`,
              `Diversified exposure across banks, PSUs, financial institutions, and municipal bodies.`,
              `Generally more stable credit quality than corporate or credit-risk-focused debt funds.`,
              `A clearly defined SEBI mandate that keeps the fund's issuer focus transparent.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Interest-rate movements can still affect returns despite high issuer quality.`,
              `Returns are market-linked and are not guaranteed.`,
              `Lower credit risk generally comes with more moderate return potential than higher-risk debt categories.`,
            ],
          },
          {
            type: 'callout',
            text: `Banking and PSU Funds focus on debt from high-quality institutional issuers, which typically means lower credit risk than many corporate debt categories, but they remain exposed to interest-rate movements and their returns are still market-linked.`,
          },
        ],
      },
      {
        id: 'gilt-funds',
        heading: 'Gilt Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Gilt Funds are debt mutual funds that invest predominantly in government securities issued by the central and state governments. Under SEBI's debt fund classification, a Gilt Fund must invest at least 80% of its total assets in government securities across maturities. Because these securities are backed by the government, they carry minimal credit or default risk — the sovereign is considered the safest borrower in the system. However, being free of credit risk does not make Gilt Funds risk-free: they still carry interest-rate risk, since the prices of government bonds move inversely to interest rates, rising when rates fall and falling when rates rise. As a result, the portfolio's duration and the prevailing interest-rate cycle play a central role in determining Gilt Fund returns, and these funds can show notable short-term fluctuations when interest rates move sharply.`,
          },
          {
            type: 'table',
            caption: `Gilt Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Open-ended debt scheme investing predominantly in government securities across maturities'],
              ['Minimum Government Securities Allocation', 'At least 80% of total assets in government securities'],
              ['Primary Investments', 'Central and state government securities'],
              ['Risk Level', 'Moderate to High'],
              ['Expected Return Profile', 'Moderate'],
              ['Typical Investment Horizon', '3\u20135 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors seeking exposure to sovereign-backed securities with minimal credit risk.`,
              `Investors who understand and can tolerate interest-rate-driven fluctuations.`,
              `Investors with a medium- to long-term investment horizon.`,
              `Investors seeking to benefit from an anticipated fall in interest rates.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Minimal credit or default risk due to sovereign backing.`,
              `Can benefit meaningfully during periods of falling interest rates.`,
              `Diversified exposure across central and state government securities.`,
              `A clearly defined SEBI mandate that keeps the fund's government-securities focus transparent.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Despite minimal credit risk, these funds carry significant interest-rate risk and can be volatile in the short term.`,
              `Returns are market-linked and are not guaranteed.`,
              `The category is generally less suited to investors with very short holding periods.`,
            ],
          },
          {
            type: 'callout',
            text: `Gilt Funds invest in sovereign-backed government securities, which means minimal credit risk, but they remain highly sensitive to interest-rate movements and their returns are still market-linked, so they suit investors who understand interest-rate cycles and can stay invested through them.`,
          },
        ],
      },
      {
        id: 'gilt-funds-with-10-year-constant-duration',
        heading: 'Gilt Funds with 10-Year Constant Duration',
        blocks: [
          {
            type: 'paragraph',
            text: `Gilt Funds with 10-Year Constant Duration are debt mutual funds that invest in government securities while maintaining a portfolio Macaulay duration of around 10 years at all times. Under SEBI's debt fund classification, this category must invest at least 80% of its total assets in government securities and keep the portfolio's Macaulay duration at approximately 10 years. This is the key difference from regular Gilt Funds: in an ordinary Gilt Fund the manager can vary the portfolio's duration based on their outlook, whereas this category follows a defined, constant duration target. Holding a consistently long duration makes these funds highly sensitive to interest-rate movements, because longer-duration bonds react more sharply to rate changes — their prices rise significantly when interest rates fall and fall significantly when interest rates rise. As a result, this category is intended for investors who understand duration risk and can tolerate meaningful short-term fluctuations, and its returns remain market-linked.`,
          },
          {
            type: 'table',
            caption: `Gilt Funds with 10-Year Constant Duration at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Open-ended debt scheme investing in government securities with a constant portfolio Macaulay duration of around 10 years'],
              ['Duration Requirement', 'Portfolio Macaulay duration maintained at approximately 10 years'],
              ['Minimum Government Securities Allocation', 'At least 80% of total assets in government securities'],
              ['Primary Investments', 'Central and state government securities'],
              ['Risk Level', 'High'],
              ['Typical Investment Horizon', '7 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors who understand duration risk and long-duration debt investing.`,
              `Investors seeking sovereign-backed securities with a consistently long duration.`,
              `Investors who can tolerate significant interest-rate-driven fluctuations.`,
              `Investors seeking to benefit from an anticipated long-term fall in interest rates.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Minimal credit or default risk due to investment in sovereign-backed securities.`,
              `A predictable, constant duration profile that keeps the fund's strategy transparent.`,
              `Can benefit meaningfully during periods of falling long-term interest rates.`,
              `Useful as a targeted, duration-specific building block within a debt allocation.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `The constant long duration makes these funds among the most interest-rate-sensitive debt categories, so they can be highly volatile in the short term.`,
              `Returns are market-linked and are not guaranteed.`,
              `The category is generally unsuitable for investors with short holding periods or low tolerance for fluctuations.`,
            ],
          },
          {
            type: 'callout',
            text: `Gilt Funds with 10-Year Constant Duration combine sovereign-backed government securities with a fixed duration exposure of around 10 years, which means minimal credit risk but very high interest-rate sensitivity, so they suit only investors who understand duration risk and accept that returns are market-linked.`,
          },
        ],
      },
      {
        id: 'floater-funds',
        heading: 'Floater Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Floater Funds are debt mutual funds that invest predominantly in floating-rate instruments. Under SEBI's debt fund classification, a Floater Fund must invest at least 65% of its total assets in floating-rate instruments. Unlike fixed-rate bonds, whose coupon (interest) stays the same throughout their term, floating-rate instruments have coupons that are linked to a benchmark interest rate and reset periodically — so the interest they pay rises and falls as the benchmark moves. Because their coupons adjust with interest rates, these funds tend to have lower interest-rate sensitivity than fixed-rate debt when rates are rising, which can make them behave differently across interest-rate cycles. This does not make them risk-free: they still carry credit risk (the chance an issuer fails to pay) and market risk, and their returns remain market-linked rather than guaranteed.`,
          },
          {
            type: 'table',
            caption: `Floater Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Open-ended debt scheme investing predominantly in floating-rate instruments'],
              ['Minimum Floating Rate Instrument Allocation', 'At least 65% of total assets in floating-rate instruments'],
              ['Primary Investments', 'Floating-rate debt securities and other debt and money market instruments'],
              ['Risk Level', 'Low to Moderate'],
              ['Expected Return Profile', 'Moderate'],
              ['Typical Investment Horizon', 'Depends on the interest-rate cycle'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors who expect interest rates to rise and prefer lower duration sensitivity.`,
              `Investors seeking a debt option that adjusts coupon income as benchmark rates move.`,
              `Investors comfortable with moderate credit and market risk.`,
              `Investors looking to diversify a debt allocation across different rate structures.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Coupons reset with benchmark rates, which can reduce interest-rate sensitivity in a rising-rate environment.`,
              `Can help diversify a debt portfolio that is otherwise concentrated in fixed-rate instruments.`,
              `Interest income may increase as benchmark rates rise.`,
              `A clearly defined SEBI mandate that keeps the fund's floating-rate focus transparent.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Floating-rate instruments still carry credit risk and market risk despite lower duration sensitivity.`,
              `Coupon income can fall when benchmark interest rates decline.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Floater Funds focus on floating-rate instruments whose coupons adjust with benchmark rates, which can reduce duration sensitivity compared with fixed-rate debt, but credit and market risks still apply and their returns remain market-linked.`,
          },
        ],
      },
      {
        id: 'hybrid-mutual-funds',
        heading: 'Hybrid Mutual Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Hybrid Mutual Funds are funds that invest across more than one asset class — most commonly a combination of equity and debt, and sometimes other assets such as gold. Under SEBI's mutual fund classification, hybrid schemes form one of the five broad categories and are further divided into sub-categories based on how much they allocate to equity versus debt. The balance between these asset classes is what shapes each fund's behaviour: a higher equity allocation generally increases both return potential and volatility, while a higher debt allocation tends to add relative stability but lowers long-term growth potential. Because they blend growth-oriented equity with income-oriented debt, hybrid funds are often described as a bridge between pure equity and pure debt categories, offering diversification within a single scheme. Importantly, different hybrid categories follow different equity and debt allocation rules defined by SEBI, so their risk and return characteristics vary considerably from one type to another.`,
          },
          {
            type: 'table',
            caption: `Hybrid Mutual Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Schemes that invest across multiple asset classes, primarily equity and debt'],
              ['Core Investment Approach', 'Combining growth-oriented equity with income-oriented debt within a single fund'],
              ['Equity Exposure', 'Varies by sub-category, ranging from low to high depending on the fund\'s mandate'],
              ['Debt Exposure', 'Varies by sub-category, used to balance risk and provide relative stability'],
              ['Risk Level', 'Low to High, depending on the specific hybrid category'],
              ['Typical Investment Horizon', 'Varies by category, generally medium to long term'],
            ],
          },
          { type: 'subheading', text: `Major Types of Hybrid Mutual Funds` },
          {
            type: 'list',
            items: [
              `Conservative Hybrid Funds`,
              `Balanced Hybrid Funds`,
              `Aggressive Hybrid Funds`,
              `Dynamic Asset Allocation / Balanced Advantage Funds`,
              `Multi Asset Allocation Funds`,
              `Equity Savings Funds`,
              `Arbitrage Funds`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Diversification across equity and debt within a single fund.`,
              `A range of sub-categories to suit different risk appetites and goals.`,
              `Professional management of the equity-debt allocation on the investor's behalf.`,
              `Can offer a smoother experience than pure equity funds during volatile markets, depending on the category.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Risk and return vary significantly across hybrid categories, so the label "hybrid" alone does not indicate the risk level.`,
              `Returns are market-linked and are not guaranteed.`,
              `The equity portion still carries market risk, and the debt portion still carries interest-rate and credit risk.`,
            ],
          },
          {
            type: 'callout',
            text: `Hybrid Mutual Funds combine equity and debt in a single scheme, but because each sub-category follows a different allocation strategy, their risk levels range from low to high — and their returns remain market-linked, so it is important to look at the specific category rather than the "hybrid" label alone.`,
          },
        ],
      },
      {
        id: 'conservative-hybrid-funds',
        heading: 'Conservative Hybrid Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Conservative Hybrid Funds are hybrid mutual funds that invest predominantly in debt while keeping a small portion in equity. Under SEBI's mutual fund classification, these funds invest between 10% and 25% of their total assets in equity and equity-related instruments, and between 75% and 90% of their total assets in debt instruments. The name "conservative" reflects this debt-heavy structure: because the large majority of the portfolio sits in fixed-income securities, the fund aims for relative stability and regular income, while the limited equity portion adds a measure of long-term growth potential without exposing the investor to the full volatility of the equity market. In effect, debt dominates the portfolio and shapes most of the fund's behaviour, and the small equity allocation works alongside it to modestly enhance returns over time.`,
          },
          {
            type: 'table',
            caption: `Conservative Hybrid Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Hybrid scheme investing predominantly in debt, with a small allocation to equity'],
              ['Equity Allocation', '10% to 25% of total assets in equity and equity-related instruments'],
              ['Debt Allocation', '75% to 90% of total assets in debt instruments'],
              ['Risk Level', 'Low to Moderate'],
              ['Expected Return Profile', 'Moderate'],
              ['Typical Investment Horizon', '3 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Conservative investors seeking relative stability with a small degree of equity participation.`,
              `Investors who want potentially higher returns than pure debt funds while limiting equity exposure.`,
              `Investors with a medium-term investment horizon.`,
              `Investors who prefer a debt-oriented portfolio with limited market volatility.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Debt-heavy allocation aims to provide relative stability compared with equity-oriented funds.`,
              `Small equity exposure can add long-term growth potential to a largely income-oriented portfolio.`,
              `Diversification across debt and equity within a single fund.`,
              `A clearly defined SEBI allocation mandate that keeps the fund's conservative approach transparent.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Even a small equity allocation introduces market risk, so returns can still fluctuate.`,
              `The debt portion carries interest-rate and credit risk.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Conservative Hybrid Funds hold a debt-heavy portfolio with only limited equity exposure, which generally means relatively lower volatility than equity-oriented funds — but they are not risk-free, and their returns remain market-linked.`,
          },
        ],
      },
      {
        id: 'balanced-hybrid-funds',
        heading: 'Balanced Hybrid Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Balanced Hybrid Funds are hybrid mutual funds designed to hold a relatively even mix of equity and debt. Under SEBI's mutual fund classification, these funds invest between 40% and 60% of their total assets in equity and equity-related instruments, and between 40% and 60% of their total assets in debt instruments, and they are not permitted to use arbitrage in this category. This roughly balanced allocation is what distinguishes them from Conservative Hybrid Funds, which are debt-heavy, and Aggressive Hybrid Funds, which are equity-heavy — Balanced Hybrid Funds sit between the two, aiming for a middle path on both risk and return. A fund house may offer either a Balanced Hybrid Fund or an Aggressive Hybrid Fund, but not both. Since most AMCs opted for the Aggressive Hybrid category, new Balanced Hybrid Funds are generally not launched, although existing schemes continue to operate. As with all hybrid funds, the returns remain market-linked and are not guaranteed.`,
          },
          {
            type: 'table',
            caption: `Balanced Hybrid Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Hybrid scheme investing in a balanced mix of equity and debt, without arbitrage'],
              ['Equity Allocation', '40% to 60% of total assets in equity and equity-related instruments'],
              ['Debt Allocation', '40% to 60% of total assets in debt instruments'],
              ['Risk Level', 'Moderate to High'],
              ['Expected Return Profile', 'Moderate'],
              ['Typical Investment Horizon', '5 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors seeking a roughly balanced mix of equity and debt within a single fund.`,
              `Investors who want more equity participation than Conservative Hybrid Funds but less than Aggressive Hybrid Funds.`,
              `Investors with a medium- to long-term investment horizon.`,
              `Investors comfortable with moderate market fluctuations.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Balanced allocation aims to combine growth potential with a measure of stability.`,
              `Diversification across equity and debt within a single scheme.`,
              `A middle-ground risk profile between conservative and aggressive hybrid categories.`,
              `A clearly defined SEBI allocation mandate that keeps the fund's balanced approach transparent.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `The equity portion carries market risk, and the debt portion carries interest-rate and credit risk.`,
              `New Balanced Hybrid Funds are generally not launched, so available options in this category are limited.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Balanced Hybrid Funds hold a roughly equal mix of equity and debt, aiming for a moderate risk-return profile between conservative and aggressive hybrids — and while new schemes in this category are generally not launched, existing ones continue to operate, with returns remaining market-linked.`,
          },
        ],
      },
      {
        id: 'aggressive-hybrid-funds',
        heading: 'Aggressive Hybrid Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Aggressive Hybrid Funds are hybrid mutual funds that invest predominantly in equity while keeping a smaller allocation to debt. Under SEBI's mutual fund classification, these funds invest between 65% and 80% of their total assets in equity and equity-related instruments, and between 20% and 35% of their total assets in debt instruments. Because equity dominates the portfolio, these funds behave much more like equity-oriented investments than the other hybrid categories — the large equity share drives most of the return potential, while the debt portion adds a cushion that can soften the impact of falling markets. This is what sets them apart from Balanced Hybrid Funds, which hold a roughly even equity-debt split, and Conservative Hybrid Funds, which are debt-heavy. As a result, Aggressive Hybrid Funds generally carry higher risk and higher long-term return potential than other hybrid categories, though they are usually somewhat less volatile than pure equity funds because of the debt component. As with all hybrid funds, the returns remain market-linked and are not guaranteed.`,
          },
          {
            type: 'table',
            caption: `Aggressive Hybrid Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Hybrid scheme investing predominantly in equity, with a smaller allocation to debt'],
              ['Equity Allocation', '65% to 80% of total assets in equity and equity-related instruments'],
              ['Debt Allocation', '20% to 35% of total assets in debt instruments'],
              ['Risk Level', 'High'],
              ['Expected Return Profile', 'Moderate to High'],
              ['Typical Investment Horizon', '5 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors seeking equity-oriented growth with a modest debt cushion.`,
              `Investors who want higher long-term return potential than balanced or conservative hybrid funds.`,
              `Investors with a long-term investment horizon.`,
              `Investors who can tolerate equity-level market fluctuations.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Equity-heavy allocation offers higher long-term growth potential than other hybrid categories.`,
              `The debt portion can help soften the impact of sharp equity market declines.`,
              `Diversification across equity and debt within a single fund.`,
              `A clearly defined SEBI allocation mandate that keeps the fund's equity-oriented approach transparent.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `The large equity allocation means these funds can be volatile, especially in the short term.`,
              `The debt portion carries interest-rate and credit risk.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Aggressive Hybrid Funds hold an equity-heavy portfolio with a smaller debt allocation, which means higher long-term growth potential but also higher volatility than other hybrid categories — and their returns remain market-linked.`,
          },
        ],
      },
      {
        id: 'dynamic-asset-allocation-or-balanced-advantage-funds',
        heading: 'Dynamic Asset Allocation / Balanced Advantage Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Dynamic Asset Allocation Funds, also known as Balanced Advantage Funds, are hybrid mutual funds that shift their allocation between equity and debt dynamically rather than following fixed limits. Under SEBI's mutual fund classification, this category is defined by investment in equity and debt that is managed dynamically, which means the fund can move across a wide range of equity and debt exposure without being tied to a fixed split. The fund manager actively adjusts the balance — typically using market valuation measures, risk indicators, or in-house investment models — increasing equity when markets appear attractively valued and reducing it when they appear expensive. The objective is to participate in long-term equity market growth while seeking to reduce downside risk during expensive or volatile market phases, aiming for a smoother investment experience across market cycles. This flexible, model-driven approach is what distinguishes them from Aggressive Hybrid Funds and Balanced Hybrid Funds, which must stay within fixed equity-debt bands. As with all hybrid funds, the returns remain market-linked and are not guaranteed.`,
          },
          {
            type: 'table',
            caption: `Dynamic Asset Allocation / Balanced Advantage Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Hybrid scheme that invests in equity and debt managed dynamically'],
              ['Equity Allocation', 'Varies dynamically with no fixed limit, based on the fund\'s model and market conditions'],
              ['Debt Allocation', 'Varies dynamically with no fixed limit, based on the fund\'s model and market conditions'],
              ['Portfolio Strategy', 'Actively adjusts equity and debt allocation using valuation measures, risk indicators, or investment models'],
              ['Risk Level', 'Moderate to High'],
              ['Typical Investment Horizon', '5 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors who prefer the fund manager to decide equity-debt allocation across market cycles.`,
              `Investors seeking equity participation with an attempt to limit downside during expensive markets.`,
              `Investors with a medium- to long-term investment horizon.`,
              `Investors comfortable with a model-driven, actively managed allocation approach.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Flexibility to adjust equity and debt exposure as market conditions change.`,
              `Attempts to reduce downside risk during expensive or volatile market phases.`,
              `Removes the need for investors to time equity and debt allocation themselves.`,
              `Diversification across equity and debt within a single actively managed fund.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Performance depends significantly on the fund manager's allocation model, which may not always be correct.`,
              `The equity portion carries market risk and the debt portion carries interest-rate and credit risk.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Dynamic Asset Allocation / Balanced Advantage Funds vary their equity and debt exposure dynamically through active, model-driven management, aiming for flexibility across market cycles — but their outcomes depend on the manager's calls, and their returns remain market-linked.`,
          },
        ],
      },
      {
        id: 'multi-asset-allocation-funds',
        heading: 'Multi Asset Allocation Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Multi Asset Allocation Funds are hybrid mutual funds that spread their investments across several different asset classes rather than concentrating on just equity and debt. Under SEBI's mutual fund classification, a Multi Asset Allocation Fund must invest in at least three asset classes, with a minimum allocation of 10% to each. In practice, these funds typically combine equity, debt, and at least one additional asset class such as gold — and some may also include instruments like international equities or other commodities, depending on the scheme's mandate. The reasoning behind this structure is diversification: because different asset classes often behave differently under the same market conditions — for example, gold may hold up when equity markets fall — combining them can reduce the impact of any single asset class performing poorly. As a result, the fund's overall performance depends on how these different asset classes behave together over time, rather than on the movement of one market alone. It is important to understand that while spreading money across multiple asset classes reduces concentration risk, it does not eliminate investment risk, and the returns remain market-linked and are not guaranteed.`,
          },
          {
            type: 'table',
            caption: `Multi Asset Allocation Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Hybrid scheme that invests across at least three asset classes'],
              ['Minimum Asset Classes', 'At least three asset classes'],
              ['Minimum Allocation per Asset Class', 'At least 10% of total assets in each asset class'],
              ['Typical Investments', 'A combination of equity, debt, and at least one additional asset class such as gold, and sometimes other commodities or international equities'],
              ['Risk Level', 'Moderate to High'],
              ['Typical Investment Horizon', '5 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors seeking diversification across more than just equity and debt within a single fund.`,
              `Investors who want exposure to an additional asset class, such as gold, alongside equity and debt.`,
              `Investors with a medium- to long-term investment horizon.`,
              `Investors comfortable with the fund manager deciding the mix across asset classes.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Diversification across at least three asset classes can reduce concentration risk.`,
              `Different asset classes may respond differently to the same market conditions, which can smooth the overall experience.`,
              `Access to asset classes like gold within a single, professionally managed fund.`,
              `A clearly defined SEBI mandate that keeps the multi-asset approach transparent.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Diversification reduces concentration risk but does not eliminate investment risk.`,
              `Performance depends on how multiple asset classes behave together, which can be harder to anticipate.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Multi Asset Allocation Funds diversify across at least three asset classes — combining equity, debt, and at least one more such as gold — which can reduce concentration risk, but diversification does not remove investment risk and the returns remain market-linked.`,
          },
        ],
      },
      {
        id: 'equity-savings-funds',
        heading: 'Equity Savings Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Equity Savings Funds are hybrid mutual funds that combine three distinct components within a single portfolio: unhedged equity, arbitrage (hedged equity), and debt. Under SEBI's mutual fund classification, these funds must invest a minimum of 65% of total assets in equity and equity-related instruments and a minimum of 10% in debt instruments. A defining nuance of this category is that the 65% equity figure includes both the unhedged equity position, which is exposed to market movements, and the arbitrage position, which is hedged and therefore behaves more like a low-risk, near-cash holding. The actual net (unhedged) equity exposure is typically kept lower and is defined in each scheme's offer document, which is what gives these funds their comparatively moderate risk profile despite carrying an equity-like headline allocation.`,
          },
          {
            type: 'paragraph',
            text: `The category exists to offer a middle ground between pure equity funds and more conservative options. By keeping only a portion of the portfolio directly exposed to the market and parking the rest in arbitrage and debt, an Equity Savings Fund aims to deliver steadier outcomes than an equity-oriented fund while retaining some participation in equity market growth. The arbitrage sleeve seeks to earn small, relatively stable returns from price differences between the cash and derivatives markets, and the debt sleeve provides income; together they help steady the fund when equity markets are volatile.`,
          },
          {
            type: 'paragraph',
            text: `In terms of behaviour and risk, Equity Savings Funds generally sit below Aggressive Hybrid Funds on the risk scale, because their true market-linked equity exposure is smaller, while still carrying more equity risk than a purely debt-oriented scheme. Balanced Advantage Funds dynamically adjust their equity and debt allocation based on market valuations or investment models, whereas Equity Savings Funds maintain a structural mix of unhedged equity, arbitrage, and debt instead of dynamically changing asset allocation. The main risks are the market risk of the unhedged equity portion, interest-rate and credit risk in the debt portion, and the possibility that arbitrage opportunities narrow, which can reduce the returns from that sleeve. Because these funds are generally structured to satisfy the equity allocation requirements applicable to equity-oriented mutual funds, they are generally treated as equity-oriented for taxation under the prevailing tax laws, although tax rules can change over time. Return characteristics are typically moderate rather than high, reflecting the limited net equity exposure. As with all hybrid funds, the returns remain market-linked and are not guaranteed.`,
          },
          {
            type: 'table',
            caption: `Equity Savings Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Hybrid scheme investing in equity, arbitrage, and debt'],
              ['Minimum Equity and Equity-Related Allocation', 'At least 65% of total assets, including hedged (arbitrage) and unhedged positions'],
              ['Minimum Debt Allocation', 'At least 10% of total assets in debt and/or money market instruments'],
              ['Portfolio Strategy', 'Blends unhedged equity for growth, arbitrage for relative stability, and debt for income'],
              ['Risk Level', 'Moderate'],
              ['Typical Investment Horizon', '3 years or more'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors seeking some equity participation with lower volatility than equity-oriented hybrid funds.`,
              `Investors who want a moderate-risk option that blends equity, arbitrage, and debt.`,
              `Investors with a medium-term investment horizon.`,
              `Investors who prefer the fund manager to manage the hedged and unhedged equity balance.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Lower net equity exposure than aggressive hybrids can mean comparatively steadier outcomes.`,
              `The arbitrage and debt components provide a cushion during volatile equity markets.`,
              `Generally treated as equity-oriented for taxation, subject to prevailing tax laws.`,
              `A clearly defined SEBI mandate that keeps the three-part strategy transparent.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `The unhedged equity portion still carries market risk, so returns can fluctuate.`,
              `Returns from the arbitrage sleeve can shrink when arbitrage opportunities are limited.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Equity Savings Funds combine unhedged equity, arbitrage, and debt to offer moderate risk with some equity participation — their strength is a smoother experience than equity-oriented funds, while their main limitation is more modest return potential due to limited net equity exposure, and their returns remain market-linked.`,
          },
        ],
      },
      {
        id: 'arbitrage-funds',
        heading: 'Arbitrage Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Arbitrage Funds are hybrid mutual funds that primarily seek to generate returns from price differences between the cash (spot) and derivatives (futures) markets instead of taking directional equity exposure. Under SEBI's mutual fund classification, an Arbitrage Fund follows an arbitrage strategy and must invest a minimum of 65% of total assets in equity and equity-related instruments. The strategy works by taking offsetting positions — for example, buying a stock in the cash market while simultaneously selling an equivalent position in the futures market — so that the gain on one leg broadly offsets the movement on the other, and the fund aims to capture the spread between the two prices. A key point for investors to understand is that these funds are not making directional equity bets; they do not rely on markets rising to earn returns.`,
          },
          {
            type: 'paragraph',
            text: `This offsetting structure is why an Arbitrage Fund can carry high gross equity exposure while its net market exposure remains typically low. The equity holdings are almost fully hedged by opposite derivative positions, so although the portfolio satisfies the 65% equity requirement on a gross basis, its sensitivity to overall market direction is limited. When clear arbitrage opportunities are scarce, surplus cash is commonly invested in debt and/or money market instruments, and margin requirements for the derivative positions are also met from such holdings.`,
          },
          {
            type: 'paragraph',
            text: `In terms of risk, the most significant factor is that arbitrage opportunities themselves may reduce — in calm or low-volatility markets, the spreads between cash and futures prices can narrow, which can lower the returns available from the strategy. In addition, the debt and money market investments carry interest-rate and credit risk, and, as with all funds, the returns are market-linked and are not guaranteed. Return behaviour is generally influenced by the level of arbitrage spreads and short-term interest rates rather than by equity market performance, so outcomes tend to be relatively steady but are not fixed or assured. Because these funds are generally structured to satisfy the equity allocation requirements applicable to equity-oriented mutual funds, they are generally treated as an equity-oriented mutual fund under the prevailing tax laws, although tax rules can change over time.`,
          },
          {
            type: 'table',
            caption: `Arbitrage Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Hybrid scheme following an arbitrage strategy in the cash and derivatives segments of the equity market'],
              ['Minimum Equity and Equity-Related Allocation', 'At least 65% of total assets in equity and equity-related instruments'],
              ['Investment Strategy', 'Takes offsetting cash and futures positions to capture price differences, with surplus in debt and/or money market instruments'],
              ['Risk Level', 'Generally Low to Moderate'],
              ['Typical Investment Horizon', '3 months or more'],
              ['Tax Treatment', 'Generally treated as an equity-oriented mutual fund under the prevailing tax laws, although tax rules can change over time'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors seeking a low-directional-risk equity-oriented option rather than exposure to market direction.`,
              `Investors looking to park funds for a short to medium period with relatively low volatility.`,
              `Investors who understand that returns depend on arbitrage spreads rather than equity performance.`,
              `Investors comfortable with equity-oriented tax treatment for a largely hedged strategy.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Returns are driven by cash-futures spreads rather than equity market direction, keeping net market exposure low.`,
              `Hedged positions mean the fund generally experiences lower volatility than directional equity funds.`,
              `Surplus cash is deployed in debt and money market instruments when arbitrage opportunities are limited.`,
              `Generally treated as equity-oriented for taxation, subject to prevailing tax laws.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Arbitrage opportunities can reduce in calm markets, which may lower the returns available from the strategy.`,
              `The debt and money market portion carries interest-rate and credit risk.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Arbitrage Funds aim to earn from cash-futures price differences rather than market direction, so their biggest strength is low net market exposure with relatively steady behaviour — while their biggest limitation is that returns depend on the availability of arbitrage spreads, which can shrink in calm markets, and their returns remain market-linked.`,
          },
        ],
      },
      {
        id: 'solution-oriented-mutual-funds',
        heading: 'Solution-Oriented Mutual Funds',
        blocks: [
          {
            type: 'paragraph',
            text: `Solution-Oriented Mutual Funds are schemes designed around a specific long-term financial goal rather than a broad investment style. Instead of being defined mainly by where they invest — as equity, debt, or hybrid funds are — these schemes are defined by the objective they are meant to serve. Under SEBI's mutual fund categorization framework, the solution-oriented category consists of two types: the Retirement Fund and the Children's Fund. Both are intended to support long-term financial objectives, and their defining feature is a mandatory lock-in that sets them apart from most other open-ended schemes. A Retirement Fund carries a lock-in of at least 5 years or until retirement age, whichever is earlier, while a Children's Fund carries a lock-in of at least 5 years or until the child attains the age of majority (adulthood), whichever is earlier. This lock-in is intended to encourage disciplined, long-term investing by discouraging premature withdrawals during interim market movements. It is important to note that individual schemes within this category may invest quite differently — some lean towards equity, others towards debt, and many use a mix — so the risk and return characteristics vary considerably from one scheme to another. As with all mutual funds, the returns remain market-linked and are not guaranteed.`,
          },
          {
            type: 'table',
            caption: `Solution-Oriented Mutual Funds at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'Schemes designed for a specific long-term goal — retirement or a child\'s future — with a mandatory lock-in'],
              ['Major Categories', 'Retirement Fund and Children\'s Fund'],
              ['Lock-in Requirement', 'Retirement Fund: at least 5 years or until retirement age, whichever is earlier; Children\'s Fund: at least 5 years or until the child attains the age of majority, whichever is earlier'],
              ['Investment Approach', 'Varies by scheme, which may invest in equity, debt, or a mix according to its mandate'],
              ['Risk Level', 'Varies by scheme, depending on the underlying asset allocation'],
              ['Typical Investment Horizon', 'Long term, aligned with the goal and the applicable lock-in'],
            ],
          },
          { type: 'subheading', text: `Major Types of Solution-Oriented Mutual Funds` },
          {
            type: 'list',
            items: [
              `Retirement Fund`,
              `Children's Fund`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `A goal-based structure aligns the investment with a specific long-term objective such as retirement or a child's future.`,
              `The mandatory lock-in encourages disciplined, long-term investing and discourages premature withdrawals.`,
              `Provides a dedicated scheme framework built around a single long-term goal rather than a general investment style.`,
              `Professional management of the portfolio in line with the scheme's stated investment objective.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Mandatory lock-in restricts liquidity, so the investment cannot be redeemed freely before the lock-in ends.`,
              `Risk depends on the underlying asset allocation, which varies from scheme to scheme.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Solution-Oriented Mutual Funds are built for goal-based investing towards retirement or a child's future, and their mandatory lock-in enforces a long-term commitment that suits these objectives — but because each scheme's asset allocation differs, risk varies by scheme, and the returns remain market-linked.`,
          },
        ],
      },
      {
        id: 'retirement-fund',
        heading: 'Retirement Fund',
        blocks: [
          {
            type: 'paragraph',
            text: `A Retirement Fund is a Solution-Oriented Mutual Fund designed to help investors build a retirement corpus over the long term. Rather than being defined by a particular asset class, it is defined by its goal — accumulating wealth for the years after an investor stops earning a regular income. Under SEBI's mutual fund categorization framework, a Retirement Fund carries a mandatory lock-in of at least 5 years or until the investor reaches retirement age, whichever is earlier. This lock-in exists to encourage disciplined, long-term investing: by discouraging withdrawals during interim market movements, it helps investors stay committed to a goal that naturally spans decades. It is important to understand that different Retirement Funds may invest quite differently — some are equity-oriented, some debt-oriented, and others follow a hybrid approach — so the risk and return characteristics depend on the individual scheme rather than the category label. For this reason, investors should review a scheme's investment objective, asset allocation, and risk profile before investing. A key advantage of the long investment horizon associated with retirement planning is that it allows compounding to work over an extended period, which can be meaningful for a goal measured in years or decades. As with all mutual funds, the returns remain market-linked and are not guaranteed.`,
          },
          {
            type: 'table',
            caption: `Retirement Fund at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'A solution-oriented scheme designed to help investors accumulate a retirement corpus'],
              ['Lock-in Requirement', 'At least 5 years or until the investor reaches retirement age, whichever is earlier'],
              ['Investment Approach', 'Varies by scheme, which may be equity-oriented, debt-oriented, or hybrid according to its mandate'],
              ['Risk Level', 'Varies by scheme, depending on the underlying asset allocation'],
              ['Primary Objective', 'Long-term wealth accumulation for retirement'],
              ['Typical Investment Horizon', 'Long term, typically spanning many years until retirement'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Investors specifically planning for retirement over a long time horizon.`,
              `Investors who want a goal-based scheme structured around building a retirement corpus.`,
              `Investors comfortable with a mandatory lock-in in exchange for disciplined long-term investing.`,
              `Investors who will review the scheme's asset allocation and risk profile to match their own comfort level.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Purpose-built for long-term retirement planning within a single scheme framework.`,
              `The mandatory lock-in encourages disciplined investing and discourages premature withdrawals.`,
              `Professional management of the portfolio in line with the scheme's stated investment objective.`,
              `A long investment horizon allows compounding to work over an extended period.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Mandatory lock-in limits liquidity, so the investment cannot be redeemed freely before the lock-in ends.`,
              `Risk depends on the scheme's asset allocation, which varies from one Retirement Fund to another.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Retirement Funds are built for long-term retirement planning, using a compulsory lock-in to enforce the disciplined, multi-year commitment such a goal requires — but because each scheme's asset allocation differs, risk varies by scheme, and the returns remain market-linked.`,
          },
        ],
      },
      {
        id: 'childrens-fund',
        heading: 'Children\'s Fund',
        blocks: [
          {
            type: 'paragraph',
            text: `A Children's Fund is a Solution-Oriented Mutual Fund designed to help investors build wealth for a child's future financial needs. It is defined by its goal rather than by a specific asset class, and it is commonly used to work towards long-term objectives such as higher education, professional studies, or other major life milestones — though it is important to note that no scheme can guarantee that any particular goal will be met. Under SEBI's mutual fund categorization framework, a Children's Fund carries a mandatory lock-in of at least 5 years or until the child attains the age of majority (18 years), whichever is earlier. This lock-in exists to encourage disciplined, long-term investing, keeping the money committed to a multi-year goal and discouraging withdrawals during interim market movements. Different Children's Funds may invest quite differently — some are equity-oriented, some debt-oriented, and others follow a hybrid approach — so the risk and return characteristics depend on the individual scheme rather than the category label. For this reason, investors should review a scheme's investment objective, asset allocation, and risk profile before investing. Because a child's goal typically lies several years away, the long investment horizon allows compounding to work over time, which can be meaningful for wealth accumulated over many years. As with all mutual funds, the returns remain market-linked and are not guaranteed.`,
          },
          {
            type: 'table',
            caption: `Children's Fund at a Glance`,
            headers: ['Attribute', 'Details'],
            rows: [
              ['SEBI Category Definition', 'A solution-oriented scheme designed to help investors build wealth for a child\'s future financial needs'],
              ['Lock-in Requirement', 'At least 5 years or until the child attains the age of majority (18 years), whichever is earlier'],
              ['Investment Approach', 'Varies by scheme, which may be equity-oriented, debt-oriented, or hybrid according to its mandate'],
              ['Risk Level', 'Varies by scheme, depending on the underlying asset allocation'],
              ['Primary Objective', 'Long-term wealth accumulation for a child\'s future needs'],
              ['Typical Investment Horizon', 'Long term, typically spanning many years towards a child\'s future goal'],
            ],
          },
          { type: 'subheading', text: `Who is it suitable for?` },
          {
            type: 'list',
            items: [
              `Parents or guardians planning for a child's long-term financial needs.`,
              `Investors who want a goal-based scheme structured around a child's future.`,
              `Investors comfortable with a mandatory lock-in in exchange for disciplined long-term investing.`,
              `Investors who will review the scheme's asset allocation and risk profile to match their own comfort level.`,
            ],
          },
          { type: 'subheading', text: `Advantages` },
          {
            type: 'list',
            items: [
              `Purpose-built for goal-based investing towards a child's future within a single scheme framework.`,
              `The mandatory lock-in encourages disciplined investing and discourages premature withdrawals.`,
              `Professional management of the portfolio in line with the scheme's stated investment objective.`,
              `A long investment horizon allows compounding to work over an extended period.`,
            ],
          },
          { type: 'subheading', text: `Things to Consider` },
          {
            type: 'list',
            items: [
              `Mandatory lock-in limits liquidity, so the investment cannot be redeemed freely before the lock-in ends.`,
              `Risk depends on the scheme's asset allocation, which varies from one Children's Fund to another.`,
              `Returns are market-linked and are not guaranteed.`,
            ],
          },
          {
            type: 'callout',
            text: `Children's Funds are built for goal-based investing towards a child's future, using a compulsory lock-in to enforce the disciplined, long-term commitment such a goal requires — but because each scheme's asset allocation differs, risk varies by scheme, and the returns remain market-linked.`,
          },
        ],
      },
    ],
    keyTakeaways: [
      `A mutual fund pools money from many investors and invests it, through a professional fund manager, in assets such as equity, debt, or other instruments, with each investor owning units proportional to their contribution.`,
      `SEBI's categorization framework standardizes how schemes are defined and labelled, which makes it easier to compare funds within the same category rather than across funds designed for different purposes.`,
      `Mutual funds are broadly classified into five categories — Equity, Debt, Hybrid, Solution-Oriented, and Other schemes — each designed to meet different investment objectives and risk profiles.`,
      `Risk and return are related: categories with higher return potential, such as equity funds, generally carry higher volatility, while debt-oriented categories typically offer steadier but more modest outcomes.`,
      `The suitable investment horizon varies by category, ranging from a few days for liquid funds to several years for equity and solution-oriented funds, so matching the horizon to the fund is important.`,
      `Diversification, whether across companies, asset classes, or fund categories, can reduce concentration risk, but it does not eliminate investment risk altogether.`,
      `Choosing a mutual fund should be based on your financial goals, investment horizon, and risk tolerance rather than solely on recent performance.`,
      `Mutual fund returns are market-linked and are not guaranteed, so their value can rise or fall with the performance of the underlying assets.`,
    ],
    faqs: [
      {
        question: `What is the difference between equity, debt, and hybrid mutual funds?`,
        answer: `The difference comes down to what each primarily invests in and the objective it pursues. Equity mutual funds invest mainly in the shares of companies and aim for long-term capital appreciation, which brings higher market volatility. Debt mutual funds invest in fixed-income securities such as government securities and corporate bonds, generally seeking steadier returns with lower volatility than equity. Hybrid mutual funds combine equity and debt — and sometimes other asset classes — within a single scheme, so their risk sits between the two depending on the allocation. Under SEBI's mutual fund categorization, each is a broad category with its own sub-categories. In every case, the value of your units moves with the underlying market and is not guaranteed.`,
      },
      {
        question: `Which type of mutual fund is suitable for beginners?`,
        answer: `No single category suits every beginner, because the right choice depends on the individual's financial goal, investment horizon, and comfort with market fluctuations. Someone investing for a goal many years away might consider a diversified equity or hybrid category, while a person who needs the money soon, or who prefers lower volatility, may look at debt-oriented categories. What matters more than the label is matching the fund's objective and risk profile to your own situation. This guide is educational and does not point to any specific scheme. Whatever the category, the returns depend on market performance, the level of risk differs from one category to another, and the scheme documents are worth reviewing before you invest.`,
      },
      {
        question: `How do I choose the right type of mutual fund?`,
        answer: `Choosing the right type of mutual fund is generally more effective when you start with your financial goal, investment horizon, and risk tolerance rather than with recent performance. Once those are clear, you can identify the broad category whose objective fits them — for example, growth-oriented equity categories for long-term goals, or debt categories for shorter horizons and lower volatility. Within a category, comparing schemes that follow the same mandate is more meaningful than comparing funds built for different purposes. It also helps to read each scheme's investment objective, asset allocation, and risk level in its offer document. Keep in mind that risk differs across categories and that returns are linked to the market rather than assured.`,
      },
      {
        question: `Are mutual funds guaranteed to make money?`,
        answer: `No. Mutual fund returns are linked to the market, which means the value of your investment can rise or fall with the performance of the underlying assets. No mutual fund can promise a positive return or fully protect against losses, and past performance does not assure future results. Different categories carry different levels of risk — equity-oriented funds tend to be more volatile, while debt-oriented funds are usually steadier but still not risk-free. Diversification can reduce concentration risk, yet it cannot remove investment risk altogether. Because outcomes are uncertain, it is sensible to align the category with your goal and horizon and to review the scheme documents before investing.`,
      },
      {
        question: `What is the safest type of mutual fund?`,
        answer: `No mutual fund is entirely free of risk, so it is more accurate to talk about relatively lower-risk categories. Among debt funds, categories such as Overnight Funds and Liquid Funds invest in very short-maturity instruments and are generally regarded as among the lower-risk options, largely because they carry limited interest-rate sensitivity. Even these are not risk-free, however: they can be affected by credit events, and their returns still depend on the market rather than being fixed. Risk can also differ from one scheme to another within the same category. Rather than searching for the "safest" fund in absolute terms, it is more useful to match the risk level to your goal and to check the scheme's details before investing.`,
      },
      {
        question: `Can I invest in more than one type of mutual fund?`,
        answer: `Yes. Investors can hold more than one category at the same time, and doing so is one way to diversify across different objectives, asset classes, and risk levels. For instance, some investors combine equity-oriented and debt-oriented categories to balance growth potential with relative stability. Diversifying across categories can lower concentration risk, though it does not remove investment risk, and holding several schemes with similar mandates may create overlap rather than genuine diversification. The appropriate mix ultimately depends on your goals, horizon, and risk tolerance. This is educational information rather than a recommendation, and each scheme's documents are worth reviewing before investing.`,
      },
      {
        question: `Why does SEBI classify mutual funds into categories?`,
        answer: `SEBI introduced a standardized categorization framework to bring greater consistency, transparency, and comparability across mutual fund schemes. Before it existed, different fund houses could launch several schemes with similar objectives, which made it hard for investors to compare like with like. Under the framework, each category follows a clearly defined investment mandate, so investors can understand what a scheme is meant to do and compare it against others in the same category rather than against funds designed for entirely different purposes. The framework does not rank categories from best to worst; it simply defines the investment universe and objective that each category must follow.`,
      },
      {
        question: `What is the difference between actively managed and passive mutual funds?`,
        answer: `The difference lies in how investment decisions are made. In an actively managed fund, a fund manager decides which securities to buy and sell, aiming to pursue the scheme's objective through research and judgment. In a passive fund, such as an index fund, the portfolio is built to track a chosen market index rather than to make active selection decisions. Actively managed funds therefore depend more on the manager's calls, while passive funds aim simply to mirror the index they follow. Both remain market-linked, so their values move with their underlying holdings, and neither promises a positive return. In SEBI's framework, passive schemes such as index funds and fund-of-funds sit within the broad "Other" category.`,
      },
      {
        question: `How does investment horizon affect mutual fund selection?`,
        answer: `Investment horizon — how long you expect to stay invested — is central to choosing a category, because different categories are built for different timeframes. Very short-term needs may point towards debt categories such as liquid or ultra-short duration funds, which carry limited interest-rate sensitivity. Longer horizons leave more time to absorb short-term volatility, which is why equity and many hybrid or solution-oriented categories are generally associated with multi-year goals. Matching the horizon to the fund helps avoid situations where money is needed before a volatile investment has had time to work. Whatever the horizon, returns depend on the market, and a scheme's details are worth reviewing before investing.`,
      },
      {
        question: `What is the difference between open-ended and close-ended mutual funds?`,
        answer: `The difference lies in how and when you can buy and sell units. An open-ended mutual fund is available for purchase and redemption on an ongoing basis at the prevailing net asset value, giving investors the flexibility to enter or exit at most times. A close-ended mutual fund is offered for a fixed period and has a defined maturity, so units are generally bought during the initial offer and redeemed at maturity, though such schemes are usually listed on a stock exchange to provide some liquidity in between. Most categories discussed in this guide are open-ended. In either structure, the value of your investment moves with the market and is not guaranteed.`,
      },
      {
        question: `Can the risk level of a mutual fund change over time?`,
        answer: `Yes, to an extent. A category's broad mandate is set by SEBI, but the risk within that mandate can shift as market conditions and the underlying portfolio change. For example, companies can move between large-cap, mid-cap, and small-cap classifications as their market capitalisation rankings change, and funds adjust their holdings to stay compliant. In debt funds, movements in interest rates and changes in the credit quality of holdings can alter risk. Some categories, such as dynamically managed funds, deliberately vary their allocation over time. This is one reason investors revisit a scheme's current profile periodically. Across every category, returns remain tied to the market and are not assured.`,
      },
      {
        question: `What should I check before investing in a mutual fund?`,
        answer: `Before investing, it helps to review the scheme's investment objective, the category it belongs to and how it allocates its assets, and its stated risk level, and then to consider whether these fit your own financial goal, investment horizon, and risk tolerance. The scheme's offer document, such as the Scheme Information Document, gives the authoritative detail on how the fund invests and the risks involved. It is also worth understanding that categories behave differently, that diversification lowers but does not remove risk, and that any lock-in or liquidity conditions may apply. This guide is educational only and does not recommend any scheme, and returns are linked to market performance rather than guaranteed.`,
      },
    ],
    relatedCalculators: [
      '/sip-calculator',
      '/lumpsum-calculator',
      '/sip-vs-stepup-sip-calculator',
      '/retirement-calculator',
    ],
    references: [
      {
        label: 'Securities and Exchange Board of India (SEBI). SEBI (Mutual Funds) Regulations, 1996.',
        url: 'https://www.sebi.gov.in',
      },
      {
        label: 'Securities and Exchange Board of India (SEBI). Master Circular for Mutual Funds (SEBI/HO/IMD/IMD-PoD-1/P/CIR/2024/90, dated June 27, 2024) — Chapter 2, Clause 2.6, "Categorization and Rationalization of Mutual Fund Schemes".',
        url: 'https://www.sebi.gov.in',
      },
      {
        label: 'Securities and Exchange Board of India (SEBI). Categorization and Rationalization of Mutual Fund Schemes (circular superseding Clause 2.6 of the Master Circular dated June 27, 2024).',
        url: 'https://www.sebi.gov.in/sebi_data/attachdocs/jul-2025/1752835259617.pdf',
      },
      {
        label: 'Securities and Exchange Board of India (SEBI). Investor Education — A Guide to ELSS (Equity-Linked Savings Scheme).',
        url: 'https://investor.sebi.gov.in/elss.html',
      },
      {
        label: 'Securities and Exchange Board of India (SEBI). Investor Education Portal — Mutual Funds.',
        url: 'https://investor.sebi.gov.in',
      },
      {
        label: 'Association of Mutual Funds in India (AMFI). Mutual Fund Scheme Categories and Categorization Framework.',
        url: 'https://www.amfiindia.com',
      },
      {
        label: 'Association of Mutual Funds in India (AMFI). Investor Awareness — Guide to Mutual Funds.',
        url: 'https://www.amfiindia.com',
      },
      {
        label: 'Reserve Bank of India (RBI). Government Securities Market in India — A Primer.',
        url: 'https://www.rbi.org.in',
      },
      {
        label: 'Income Tax Department, Government of India. Deduction under Section 80C and Taxation of Capital Gains on Mutual Funds.',
        url: 'https://www.incometaxindia.gov.in',
      },
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

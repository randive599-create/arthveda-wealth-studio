/**
 * FAQ content for the studio and for FAQ structured data (JSON-LD).
 *
 * A single source of truth shared by the on-page accordion and the schema in
 * index.html generation, so the visible content and the SEO markup never drift.
 * Answers are educational and neutral — informational, not advice.
 */

export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: 'What is a SIP and how does this SIP calculator work?',
    answer:
      'A Systematic Investment Plan (SIP) is a disciplined way to invest a fixed amount every month. ' +
      'This SIP calculator compounds your monthly contributions on a monthly basis at your assumed ' +
      'annual return, optionally escalating the contribution each year with a step-up, and projects ' +
      'the resulting corpus year by year.',
  },
  {
    question: 'How is a lumpsum investment projected?',
    answer:
      'A lumpsum is invested once at the start and then compounds monthly for the full duration. ' +
      'In this wealth projection studio you can combine a one-time lumpsum with an ongoing monthly ' +
      'SIP to model a realistic capital-formation strategy.',
  },
  {
    question: 'What is an SWP and when should I use the withdrawal mode?',
    answer:
      'A Systematic Withdrawal Plan (SWP) draws a fixed amount from your corpus each month, typically ' +
      'in retirement. Switch the plan mode to Accumulation + Income to model a withdrawal phase with ' +
      'its own return rate and an optional annual withdrawal step-up.',
  },
  {
    question: 'What is a SIP step-up and why does it matter?',
    answer:
      'A SIP step-up increases your monthly contribution each year, either by a percentage or a fixed ' +
      'amount, usually in line with income growth. Because the additional capital compounds for the ' +
      'remaining horizon, even a modest step-up can materially increase projected wealth.',
  },
  {
    question: 'How does the calculator handle inflation?',
    answer:
      'When inflation adjustment is enabled, the studio shows both the nominal corpus and its value ' +
      "in today's purchasing power. Real values are computed by discounting future amounts to year " +
      'zero, so you can see what your projected wealth is genuinely worth.',
  },
  {
    question: 'What does inflation-adjusted corpus mean?',
    answer:
      'The inflation-adjusted (real) corpus expresses your future wealth in present-day money. For ' +
      'example, a large nominal figure thirty years out may represent considerably less in real terms ' +
      'once inflation is accounted for, which is essential for honest retirement planning.',
  },
  {
    question: 'Can I plan for retirement income with this tool?',
    answer:
      'Yes. Model an accumulation phase to build your corpus, then a withdrawal phase to draw a ' +
      'monthly income. The studio flags if withdrawals would exhaust the corpus before the end of the ' +
      'horizon, helping you size a sustainable retirement income.',
  },
  {
    question: 'What happens if my withdrawals are too high?',
    answer:
      'If the requested withdrawal exceeds the available balance, the corpus is floored at zero, ' +
      'withdrawals stop, and the projection flags the depletion year. The AI Wealth Insights section ' +
      'will also surface an explicit sustainability risk.',
  },
  {
    question: 'Which currencies are supported?',
    answer:
      'The studio supports the Indian Rupee (INR), US Dollar (USD), and Euro (EUR). All dashboards, ' +
      'charts, tables, and reports reformat instantly when you change currency, and the milestone ' +
      'section adapts between the Crorepati Countdown (INR) and the Milestone Countdown (USD/EUR).',
  },
  {
    question: 'What is the Crorepati Countdown?',
    answer:
      'For Indian Rupee plans, the Crorepati Countdown detects when your projected corpus is expected ' +
      'to cross key wealth milestones — from ₹10 Lakh up to ₹100 Crore — showing the year reached and ' +
      'the corpus value at each milestone.',
  },
  {
    question: 'How accurate are these wealth projections?',
    answer:
      'Projections are deterministic illustrations based on the constant assumptions you provide and ' +
      'monthly compounding. Real markets vary year to year, so actual outcomes will differ. Use the ' +
      'projection as a planning baseline, not a guarantee.',
  },
  {
    question: 'What return rate should I assume?',
    answer:
      'There is no single correct figure. Many long-term equity investors model conservative and ' +
      'optimistic scenarios, for example 10% and 12% per annum, and compare the outcomes. You can ' +
      'adjust the rate freely and watch the projection update in real time.',
  },
  {
    question: 'What is the wealth multiplier?',
    answer:
      'The wealth multiplier is the gross value returned per unit of capital invested — the final ' +
      'corpus plus any withdrawals, divided by total contributions. It is a quick gauge of how hard ' +
      'your money is working over the horizon.',
  },
  {
    question: 'How much of my wealth comes from compounding?',
    answer:
      'The Wealth Composition donut splits your projected corpus into invested capital and returns ' +
      'generated through compounding. Over long horizons, returns typically account for the majority ' +
      'of the final corpus, which the studio states explicitly.',
  },
  {
    question: 'Can I share my projection scenario?',
    answer:
      'Yes. The Share Scenario action encodes all of your inputs — amounts, rates, durations, step-ups, ' +
      'currency, and inflation settings — into a compact link. Anyone who opens it sees exactly your ' +
      'scenario, with no account or backend required.',
  },
  {
    question: 'Can I export a professional report?',
    answer:
      'The Download Report action generates a multi-page A4 PDF — a wealth projection dossier with the ' +
      'summary, assumptions, charts, timeline, milestones, insights, and the full year-by-year ledger — ' +
      'suitable for sharing with family or a financial advisor.',
  },
  {
    question: 'Is my financial data stored anywhere?',
    answer:
      'No. The studio runs entirely in your browser. Calculations are performed locally and your ' +
      'scenario is held only in the page address. Nothing is sent to or stored on a server.',
  },
  {
    question: 'Is this investment advice?',
    answer:
      'No. ArthVeda provides illustrative wealth projections for long-term planning and education only. ' +
      'It is not investment advice or a recommendation. Consult a qualified financial professional ' +
      'before making investment decisions.',
  },
];

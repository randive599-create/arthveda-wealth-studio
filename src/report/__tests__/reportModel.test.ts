import { describe, expect, it } from 'vitest';
import { buildProjection } from '../../engine';
import { makeInputs } from '../../engine/__tests__/factory';
import {
  buildReportFileName,
  buildReportModel,
  formatIsoDate,
  formatLongDate,
} from '../reportModel';

const FIXED_DATE = new Date(2026, 5, 7); // 7 June 2026 (month is 0-based)

function incomeResult() {
  return buildProjection(
    makeInputs({
      mode: 'income',
      currency: 'INR',
      lumpsum: 500_000,
      monthlySip: 25_000,
      sipStepUp: { method: 'percentage', percentage: 10, amount: 0 },
      annualReturnRate: 12,
      durationYears: 30,
      sipStopYear: 20,
      withdrawalStartYear: 25,
      withdrawalReturnRate: 8,
      monthlySwp: 100_000,
      swpStepUp: { method: 'fixed', percentage: 0, amount: 5_000 },
      inflation: { enabled: true, rate: 6 },
    }),
  );
}

describe('date + file naming', () => {
  it('formats the ISO date', () => {
    expect(formatIsoDate(FIXED_DATE)).toBe('2026-06-07');
  });

  it('formats the long date', () => {
    expect(formatLongDate(FIXED_DATE)).toBe('7 June 2026');
  });

  it('builds the report file name', () => {
    expect(buildReportFileName(FIXED_DATE)).toBe('ArthVeda-Wealth-Projection-2026-06-07.pdf');
  });
});

describe('buildReportModel — income + inflation', () => {
  const model = buildReportModel(incomeResult(), FIXED_DATE);

  it('populates cover metadata', () => {
    expect(model.cover.brand).toBe('ARTHVEDA');
    expect(model.cover.division).toBe('PRIVATE OFFICE');
    expect(model.cover.title).toBe('Wealth Projection Report');
    expect(model.cover.generatedDate).toBe('7 June 2026');
    expect(model.cover.currencyLabel).toContain('Indian Rupee');
  });

  it('includes inflation-adjusted summary rows when enabled', () => {
    const labels = model.summary.map((p) => p.label);
    expect(labels).toContain('Inflation Adjusted Corpus');
    expect(labels).toContain('Inflation Adjusted Wealth Multiplier');
  });

  it('includes income-only assumptions and currency-formatted values', () => {
    const labels = model.assumptions.map((p) => p.label);
    expect(labels).toContain('Withdrawal Start Year');
    expect(labels).toContain('Monthly SWP');
    const sip = model.assumptions.find((p) => p.label === 'Monthly SIP');
    expect(sip?.value).toContain('₹');
  });

  it('describes a fixed SWP step-up in currency', () => {
    const swp = model.assumptions.find((p) => p.label === 'SWP Step-Up');
    expect(swp?.value).toContain('₹');
    expect(swp?.value).toContain('per annum');
  });

  it('builds a four-node timeline with corpus values', () => {
    expect(model.timeline).toHaveLength(4);
    expect(model.timeline[0].event).toBe('Investment Start');
    expect(model.timeline[0].year).toBe('Year 0');
  });

  it('adds an inflation ledger column and one row per year', () => {
    expect(model.ledgerColumns).toContain('Infl. Adj. Corpus');
    expect(model.ledgerRows).toHaveLength(30);
    expect(model.ledgerRows[0].realCorpus).not.toBeNull();
  });

  it('groups insights by category in opportunity/observation/risk order', () => {
    const categories = model.insightGroups.map((g) => g.category);
    const expectedOrder = ['opportunity', 'observation', 'risk'];
    // Categories present must follow the canonical order.
    const filtered = expectedOrder.filter((c) => categories.includes(c as never));
    expect(categories).toEqual(filtered);
  });

  it('produces a compounding-share sentence', () => {
    expect(model.compositionSentence).toMatch(/% of projected wealth comes from compounding\./);
  });
});

describe('buildReportModel — accumulation + no inflation', () => {
  const model = buildReportModel(
    buildProjection(
      makeInputs({
        mode: 'accumulation',
        currency: 'USD',
        lumpsum: 50_000,
        monthlySip: 2_000,
        annualReturnRate: 9,
        durationYears: 20,
        sipStopYear: 20,
        inflation: { enabled: false, rate: 0 },
      }),
    ),
    FIXED_DATE,
  );

  it('omits inflation rows and the inflation column', () => {
    expect(model.summary.map((p) => p.label)).not.toContain('Inflation Adjusted Corpus');
    expect(model.ledgerColumns).not.toContain('Infl. Adj. Corpus');
    expect(model.ledgerRows[0].realCorpus).toBeNull();
    expect(model.inflationEnabled).toBe(false);
  });

  it('omits income-only assumptions in accumulation mode', () => {
    const labels = model.assumptions.map((p) => p.label);
    expect(labels).not.toContain('Withdrawal Start Year');
    expect(labels).not.toContain('Monthly SWP');
  });

  it('uses USD currency labelling', () => {
    expect(model.cover.currencyLabel).toContain('US Dollar');
    const lumpsum = model.assumptions.find((p) => p.label === 'Lumpsum Investment');
    expect(lumpsum?.value).toContain('$');
  });

  it('uses the Milestone Countdown title for USD', () => {
    expect(model.milestoneTitle).toBe('Milestone Countdown');
  });
});

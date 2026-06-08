import { describe, expect, it } from 'vitest';
import { runLedger } from '../ledger';
import { monthlyGrowthFactor } from '../rates';
import { makeInputs } from './factory';

describe('runLedger — accumulation', () => {
  it('invests lumpsum and SIP with no growth at 0%', () => {
    const { rows } = runLedger(
      makeInputs({
        lumpsum: 100_000,
        monthlySip: 10_000,
        annualReturnRate: 0,
        durationYears: 2,
        sipStopYear: 1,
        withdrawalStartYear: 2,
      }),
    );

    expect(rows).toHaveLength(24);
    // Year 1: 100,000 lumpsum + 12 x 10,000 SIP = 220,000 invested, no growth.
    const endOfYear1 = rows[11];
    expect(endOfYear1.totalInvested).toBe(220_000);
    expect(endOfYear1.corpus).toBe(220_000);
    // Year 2 is a (zero-SWP) withdrawal year at 0%: corpus is preserved.
    const endOfYear2 = rows[23];
    expect(endOfYear2.totalInvested).toBe(220_000);
    expect(endOfYear2.corpus).toBe(220_000);
    expect(endOfYear2.totalWithdrawn).toBe(0);
  });

  it('applies start-of-year SIP step-up from the first month of the new year', () => {
    const { rows } = runLedger(
      makeInputs({
        monthlySip: 25_000,
        sipStepUp: { method: 'percentage', percentage: 10 },
        annualReturnRate: 0,
        durationYears: 3,
        sipStopYear: 2,
        withdrawalStartYear: 3,
      }),
    );

    // First month of year 1 contributes the base amount.
    expect(rows[0].sip).toBe(25_000);
    // First month of year 2 (month 13) contributes the stepped-up amount.
    expect(rows[12].sip).toBeCloseTo(27_500, 6);
    // Year 2's final month still uses the stepped amount.
    expect(rows[23].sip).toBeCloseTo(27_500, 6);
  });
});

describe('runLedger — compounding (annuity-due order of operations)', () => {
  it('compounds a lumpsum to the annual rate over one year', () => {
    const { rows } = runLedger(
      makeInputs({
        lumpsum: 100_000,
        durationYears: 1,
        sipStopYear: 1,
        withdrawalStartYear: 1,
        withdrawalReturnRate: 12,
      }),
    );
    expect(rows[11].corpus).toBeCloseTo(112_000, 2);
  });

  it('treats SIP as an annuity-due (contribute, then grow)', () => {
    const inputs = makeInputs({
      monthlySip: 1_000,
      annualReturnRate: 12,
      durationYears: 2,
      sipStopYear: 1,
      withdrawalStartYear: 2,
    });
    const { rows } = runLedger(inputs);

    const f = monthlyGrowthFactor(12);
    // Annuity-due future value after 12 contributions: 1000 * f * (f^12 - 1) / (f - 1).
    const expected = 1_000 * f * ((Math.pow(f, 12) - 1) / (f - 1));
    expect(rows[11].corpus).toBeCloseTo(expected, 4);
  });
});

describe('runLedger — invariants', () => {
  it('keeps returns = corpus + withdrawn - invested on every row', () => {
    const { rows } = runLedger(
      makeInputs({
        lumpsum: 250_000,
        monthlySip: 15_000,
        sipStepUp: { method: 'percentage', percentage: 8 },
        annualReturnRate: 11,
        durationYears: 10,
        sipStopYear: 6,
        withdrawalStartYear: 8,
        withdrawalReturnRate: 7,
        monthlySwp: 30_000,
      }),
    );

    for (const row of rows) {
      expect(row.returns).toBeCloseTo(row.corpus + row.totalWithdrawn - row.totalInvested, 6);
      expect(row.corpus).toBeGreaterThanOrEqual(0);
    }
  });

  it('produces durationYears * 12 monthly rows', () => {
    const { rows } = runLedger(makeInputs({ durationYears: 7 }));
    expect(rows).toHaveLength(84);
  });
});

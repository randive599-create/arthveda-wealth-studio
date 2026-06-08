import { describe, expect, it } from 'vitest';
import { buildProjection } from '../index';
import { runLedger } from '../ledger';
import { makeInputs } from './factory';

describe('withdrawal depletion', () => {
  it('exhausts the corpus, floors at zero, and flags depletion', () => {
    const inputs = makeInputs({
      lumpsum: 100_000,
      annualReturnRate: 0,
      withdrawalReturnRate: 0,
      durationYears: 1,
      sipStopYear: 1,
      withdrawalStartYear: 1,
      monthlySwp: 20_000,
    });

    const { rows, depleted, depletionYear } = runLedger(inputs);

    // 100,000 drawn down at 20,000/month is exhausted after 5 months; month 6
    // cannot be met and triggers the depletion flag.
    expect(depleted).toBe(true);
    expect(depletionYear).toBe(1);
    expect(rows[rows.length - 1].corpus).toBe(0);

    const result = buildProjection(inputs);
    expect(result.summary.totalWithdrawn).toBe(100_000);
    expect(result.summary.finalCorpus).toBe(0);
    expect(result.flags.depleted).toBe(true);
    expect(result.flags.depletionYear).toBe(1);
  });

  it('never pays out more than the available balance and never goes negative', () => {
    const inputs = makeInputs({
      lumpsum: 50_000,
      annualReturnRate: 0,
      withdrawalReturnRate: 0,
      durationYears: 2,
      sipStopYear: 1,
      withdrawalStartYear: 1,
      monthlySwp: 9_000,
    });
    const { rows } = runLedger(inputs);
    for (const row of rows) {
      expect(row.corpus).toBeGreaterThanOrEqual(0);
      expect(row.swp).toBeGreaterThanOrEqual(0);
    }
  });

  it('does not flag depletion when there are no withdrawals', () => {
    const result = buildProjection(
      makeInputs({
        lumpsum: 100_000,
        annualReturnRate: 8,
        withdrawalReturnRate: 8,
        durationYears: 5,
        sipStopYear: 3,
        withdrawalStartYear: 4,
        monthlySwp: 0,
      }),
    );
    expect(result.flags.depleted).toBe(false);
    expect(result.flags.depletionYear).toBeNull();
    expect(result.summary.finalCorpus).toBeGreaterThan(0);
  });
});

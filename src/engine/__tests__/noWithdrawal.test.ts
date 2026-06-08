import { describe, expect, it } from 'vitest';
import { buildProjection } from '../index';
import { phaseOfYear } from '../phases';
import { makeInputs } from './factory';

describe('phaseOfYear — No Withdrawal mode', () => {
  it('never returns withdrawal when withdrawals are disabled', () => {
    // Even though year >= withdrawalStartYear, withdrawals are off.
    expect(phaseOfYear(10, 5, 8, false)).toBe('growth');
    expect(phaseOfYear(3, 5, 8, false)).toBe('accumulation');
    expect(phaseOfYear(5, 5, 8, false)).toBe('accumulation');
  });

  it('still resolves withdrawal when enabled (default)', () => {
    expect(phaseOfYear(10, 5, 8, true)).toBe('withdrawal');
    expect(phaseOfYear(10, 5, 8)).toBe('withdrawal');
  });
});

describe('No Withdrawal mode — pure accumulation', () => {
  const accumulation = makeInputs({
    mode: 'accumulation',
    lumpsum: 500_000,
    monthlySip: 25_000,
    sipStepUp: { method: 'percentage', percentage: 10 },
    annualReturnRate: 12,
    durationYears: 30,
    sipStopYear: 30,
    // These should be ignored entirely in accumulation mode:
    withdrawalStartYear: 30,
    withdrawalReturnRate: 8,
    monthlySwp: 100_000,
    swpStepUp: { method: 'percentage', percentage: 5 },
  });

  const result = buildProjection(accumulation);

  it('contributes SIP for every year of a 30-year plan', () => {
    const contributingYears = result.yearly.filter((y) => y.sipAnnual > 0);
    expect(contributingYears).toHaveLength(30);
    // The final year is a genuine SIP year, not a reserved withdrawal year.
    expect(result.yearly[29].sipAnnual).toBeGreaterThan(0);
  });

  it('reserves no withdrawal year and never withdraws', () => {
    expect(result.yearly.some((y) => y.phase === 'withdrawal')).toBe(false);
    expect(result.summary.totalWithdrawn).toBe(0);
    expect(result.flags.depleted).toBe(false);
    expect(result.flags.depletionYear).toBeNull();
  });

  it('matches the closed-form total investment for 30 full SIP years', () => {
    let expectedInvestment = 500_000;
    for (let y = 1; y <= 30; y += 1) {
      expectedInvestment += 12 * 25_000 * Math.pow(1.1, y - 1);
    }
    expect(result.summary.totalInvestment).toBeCloseTo(expectedInvestment, 2);
  });

  it('ignores withdrawal parameters even when SWP is large', () => {
    const withHugeSwp = buildProjection(
      makeInputs({
        mode: 'accumulation',
        lumpsum: 500_000,
        monthlySip: 25_000,
        sipStepUp: { method: 'percentage', percentage: 10 },
        annualReturnRate: 12,
        durationYears: 30,
        sipStopYear: 30,
        withdrawalStartYear: 5,
        monthlySwp: 5_000_000,
      }),
    );
    expect(withHugeSwp.summary.totalWithdrawn).toBe(0);
    expect(withHugeSwp.flags.depleted).toBe(false);
    expect(withHugeSwp.yearly.filter((y) => y.sipAnnual > 0)).toHaveLength(30);
  });
});

describe('No Withdrawal mode — accumulation then growth', () => {
  it('compounds without contributions after sipStopYear and never withdraws', () => {
    const result = buildProjection(
      makeInputs({
        mode: 'accumulation',
        lumpsum: 500_000,
        monthlySip: 25_000,
        annualReturnRate: 12,
        durationYears: 30,
        sipStopYear: 20,
        withdrawalStartYear: 25,
        monthlySwp: 50_000,
      }),
    );

    // Years 1-20 accumulate, 21-30 grow, none withdraw.
    expect(result.yearly[19].phase).toBe('accumulation');
    expect(result.yearly[20].phase).toBe('growth');
    expect(result.yearly[29].phase).toBe('growth');
    expect(result.yearly.some((y) => y.phase === 'withdrawal')).toBe(false);
    expect(result.summary.totalWithdrawn).toBe(0);
  });
});

describe('No Withdrawal vs income mode (the reserved-year fix)', () => {
  const shared = {
    lumpsum: 500_000,
    monthlySip: 25_000,
    sipStepUp: { method: 'percentage' as const, percentage: 10 },
    annualReturnRate: 12,
    durationYears: 30,
    sipStopYear: 30,
    withdrawalStartYear: 30,
    withdrawalReturnRate: 12,
  };

  it('accumulation mode invests one more SIP year than income mode with a reserved final year', () => {
    const accumulation = buildProjection(makeInputs({ ...shared, mode: 'accumulation' }));
    const income = buildProjection(makeInputs({ ...shared, mode: 'income', monthlySwp: 0 }));

    // Income mode reserves year 30 as a (zero-SWP) withdrawal year -> 29 SIP years.
    expect(income.yearly.filter((y) => y.sipAnnual > 0)).toHaveLength(29);
    // Accumulation mode keeps all 30 SIP years and therefore a larger corpus.
    expect(accumulation.yearly.filter((y) => y.sipAnnual > 0)).toHaveLength(30);
    expect(accumulation.summary.totalInvestment).toBeGreaterThan(income.summary.totalInvestment);
    expect(accumulation.summary.finalCorpus).toBeGreaterThan(income.summary.finalCorpus);
  });
});

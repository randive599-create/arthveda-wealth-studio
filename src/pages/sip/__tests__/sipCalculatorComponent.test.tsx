// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { SipCalculator } from '../SipCalculator';
import { TESTIDS } from '../../../lib/testids';

// Recharts' ResponsiveContainer relies on ResizeObserver, which jsdom lacks.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeAll(() => {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;
});

describe('SipCalculator (dedicated SIP experience)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders SIP controls, primary + advanced results, three charts, comparison and report', () => {
    const { queryByTestId } = render(<SipCalculator />);

    expect(queryByTestId(TESTIDS.sipCalculator)).not.toBeNull();
    expect(queryByTestId(TESTIDS.sipControls)).not.toBeNull();
    expect(queryByTestId(TESTIDS.sipSummary)).not.toBeNull();
    expect(queryByTestId(TESTIDS.sipAdvancedResults)).not.toBeNull();
    expect(queryByTestId(TESTIDS.sipComparison)).not.toBeNull();
    expect(queryByTestId(TESTIDS.sipReportButton)).not.toBeNull();

    for (const key of [
      'maturity-value',
      'total-invested',
      'wealth-created',
      'total-gain',
      'wealth-multiplier',
      'inflation-adjusted',
      'real-multiplier',
      'step-up-benefit',
      'xirr',
    ]) {
      expect(queryByTestId(TESTIDS.sipOutput(key))).not.toBeNull();
    }

    for (const key of ['growth', 'invested-vs-wealth', 'inflation-adjusted']) {
      expect(queryByTestId(TESTIDS.sipChart(key))).not.toBeNull();
    }

    for (const amount of [5_000, 10_000, 25_000, 50_000, 100_000]) {
      expect(queryByTestId(TESTIDS.sipComparisonRow(amount))).not.toBeNull();
    }
  });

  it('starts in basic mode with no SWP/withdrawal/step-up fields, and reveals advanced on toggle', () => {
    const { queryByTestId, getByTestId } = render(<SipCalculator />);

    // Basic inputs present.
    expect(queryByTestId('field-sip-amount-slider')).not.toBeNull();
    expect(queryByTestId('field-sip-duration-slider')).not.toBeNull();
    expect(queryByTestId('field-sip-return-slider')).not.toBeNull();

    // SWP / withdrawal / generic fields absent.
    expect(queryByTestId(TESTIDS.fieldSlider('monthlySwp'))).toBeNull();
    expect(queryByTestId(TESTIDS.fieldSlider('withdrawalReturnRate'))).toBeNull();

    // Advanced fields hidden until expanded.
    expect(queryByTestId(TESTIDS.sipAdvancedFields)).toBeNull();
    expect(queryByTestId('field-sip-stepup-slider')).toBeNull();

    fireEvent.click(getByTestId(TESTIDS.sipAdvancedToggle));

    expect(queryByTestId(TESTIDS.sipAdvancedFields)).not.toBeNull();
    expect(queryByTestId('field-sip-stepup-slider')).not.toBeNull();
    expect(queryByTestId('field-sip-inflation-slider')).not.toBeNull();
    expect(queryByTestId('field-sip-existing-slider')).not.toBeNull();
    expect(queryByTestId('field-sip-lumpsum-slider')).not.toBeNull();
  });

  it('applies the quick SIP-amount preset and recomputes the maturity value', () => {
    const { getByTestId } = render(<SipCalculator />);
    const before = getByTestId(TESTIDS.sipOutput('maturity-value')).textContent;

    fireEvent.click(getByTestId(TESTIDS.sipAmountPreset(50_000)));

    const after = getByTestId(TESTIDS.sipOutput('maturity-value')).textContent;
    expect(after).not.toBe(before);
    expect((getByTestId('field-sip-amount-input') as HTMLInputElement).value).toBe('50000');
  });

  it('applies a duration preset', () => {
    const { getByTestId } = render(<SipCalculator />);
    fireEvent.click(getByTestId(TESTIDS.sipDurationPreset(30)));
    expect((getByTestId('field-sip-duration-input') as HTMLInputElement).value).toBe('30');
  });
});

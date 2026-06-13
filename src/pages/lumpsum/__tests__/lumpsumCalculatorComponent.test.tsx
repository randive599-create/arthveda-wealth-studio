// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { LumpsumCalculator } from '../LumpsumCalculator';
import { computeLumpsum, DEFAULT_LUMPSUM_INPUTS } from '../lumpsumModel';
import { formatCurrency } from '../../../format/currency';
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

describe('LumpsumCalculator (dedicated lumpsum experience)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the lumpsum controls, summary cards, growth chart and report button', () => {
    const { queryByTestId } = render(<LumpsumCalculator />);

    expect(queryByTestId(TESTIDS.lumpsumCalculator)).not.toBeNull();
    expect(queryByTestId(TESTIDS.lumpsumControls)).not.toBeNull();
    expect(queryByTestId(TESTIDS.lumpsumSummary)).not.toBeNull();
    expect(queryByTestId(TESTIDS.lumpsumReportButton)).not.toBeNull();
    expect(queryByTestId(TESTIDS.lumpsumChart('growth'))).not.toBeNull();

    for (const key of [
      'final-corpus',
      'total-gain',
      'cagr',
      'inflation-adjusted-corpus',
      'wealth-multiplier',
    ]) {
      expect(queryByTestId(TESTIDS.lumpsumOutput(key))).not.toBeNull();
    }
  });

  it('shows the one-time-investment inputs, not the SIP / step-up fields', () => {
    const { queryByTestId, unmount } = render(<LumpsumCalculator />);
    expect(queryByTestId('field-lumpsum-investment-slider')).not.toBeNull();
    expect(queryByTestId('field-lumpsum-return-slider')).not.toBeNull();
    expect(queryByTestId('field-lumpsum-duration-slider')).not.toBeNull();
    // Generic SIP fields are gone.
    expect(queryByTestId(TESTIDS.fieldSlider('monthlySip'))).toBeNull();
    expect(queryByTestId(TESTIDS.fieldSlider('lumpsum'))).toBeNull();
    unmount();
  });

  it('renders the default final corpus computed by the model', () => {
    const { getByTestId, unmount } = render(<LumpsumCalculator />);
    const expected = formatCurrency(computeLumpsum(DEFAULT_LUMPSUM_INPUTS).finalCorpus, 'INR');
    expect(getByTestId(TESTIDS.lumpsumOutput('final-corpus')).textContent).toContain(expected);
    unmount();
  });

  it('recomputes when the one-time investment changes', () => {
    const { getByTestId, unmount } = render(<LumpsumCalculator />);
    const before = getByTestId(TESTIDS.lumpsumOutput('total-gain')).textContent;

    const input = getByTestId('field-lumpsum-investment-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5000000' } });

    const after = getByTestId(TESTIDS.lumpsumOutput('total-gain')).textContent;
    expect(after).not.toBe(before);
    unmount();
  });
});

// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { FireCalculator } from '../FireCalculator';
import { computeFire, DEFAULT_FIRE_INPUTS } from '../fireModel';
import { formatCurrency } from '../../../format/currency';
import { TESTIDS } from '../../../lib/testids';

// Recharts' ResponsiveContainer relies on ResizeObserver, which jsdom does not
// implement. A no-op stub lets the chart frames render (at zero size) without
// crashing — enough to assert the FIRE layout is wired up.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeAll(() => {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;
});

describe('FireCalculator (dedicated FIRE experience)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the FIRE controls, summary cards, charts and report button', () => {
    const { queryByTestId } = render(<FireCalculator />);

    expect(queryByTestId(TESTIDS.fireCalculator)).not.toBeNull();
    expect(queryByTestId(TESTIDS.fireControls)).not.toBeNull();
    expect(queryByTestId(TESTIDS.fireSummary)).not.toBeNull();
    expect(queryByTestId(TESTIDS.fireSuccessIndicator)).not.toBeNull();
    expect(queryByTestId(TESTIDS.fireReportButton)).not.toBeNull();

    // Six FIRE outputs (success card + five metric cards).
    for (const key of [
      'fire-number',
      'inflation-adjusted',
      'projected-corpus',
      'years-remaining',
      'wealth-gap',
    ]) {
      expect(queryByTestId(TESTIDS.fireOutput(key))).not.toBeNull();
    }

    // Three FIRE charts.
    for (const key of ['corpus', 'fire-number', 'gap']) {
      expect(queryByTestId(TESTIDS.fireChart(key))).not.toBeNull();
    }
  });

  it('shows the FIRE inputs, not the generic lumpsum/SWP fields', () => {
    const { queryByTestId, unmount } = render(<FireCalculator />);
    // FIRE-specific inputs present.
    expect(queryByTestId('field-fire-current-age-slider')).not.toBeNull();
    expect(queryByTestId('field-fire-monthly-investment-slider')).not.toBeNull();
    expect(queryByTestId('field-fire-swr-slider')).not.toBeNull();
    // Generic studio fields absent.
    expect(queryByTestId(TESTIDS.fieldSlider('lumpsum'))).toBeNull();
    expect(queryByTestId(TESTIDS.fieldSlider('monthlySwp'))).toBeNull();
    unmount();
  });

  it('renders the default FIRE number computed by the model', () => {
    const { getByTestId, unmount } = render(<FireCalculator />);
    const expected = formatCurrency(
      computeFire(DEFAULT_FIRE_INPUTS).fireNumberToday,
      'INR',
    );
    expect(getByTestId(TESTIDS.fireOutput('fire-number')).textContent).toContain(expected);
    unmount();
  });

  it('recomputes the projected corpus when an input changes', () => {
    const { getByTestId, unmount } = render(<FireCalculator />);
    const before = getByTestId(TESTIDS.fireOutput('projected-corpus')).textContent;

    // Increase monthly investment via its number input.
    const input = getByTestId('field-fire-monthly-investment-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '200000' } });

    const after = getByTestId(TESTIDS.fireOutput('projected-corpus')).textContent;
    expect(after).not.toBe(before);
    unmount();
  });
});

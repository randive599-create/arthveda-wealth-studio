// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { SwpCalculator } from '../SwpCalculator';
import { computeSwp, DEFAULT_SWP_INPUTS } from '../swpModel';
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

describe('SwpCalculator (dedicated SWP experience)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the SWP controls, summary cards, depletion chart and report button', () => {
    const { queryByTestId } = render(<SwpCalculator />);

    expect(queryByTestId(TESTIDS.swpCalculator)).not.toBeNull();
    expect(queryByTestId(TESTIDS.swpControls)).not.toBeNull();
    expect(queryByTestId(TESTIDS.swpSummary)).not.toBeNull();
    expect(queryByTestId(TESTIDS.swpSurvivalIndicator)).not.toBeNull();
    expect(queryByTestId(TESTIDS.swpReportButton)).not.toBeNull();
    expect(queryByTestId(TESTIDS.swpChart('depletion'))).not.toBeNull();

    for (const key of [
      'longevity',
      'total-withdrawals',
      'remaining-corpus',
      'inflation-adjusted-income',
      'survival-probability',
    ]) {
      expect(queryByTestId(TESTIDS.swpOutput(key))).not.toBeNull();
    }
  });

  it('shows the withdrawal inputs, not the SIP / SIP step-up fields', () => {
    const { queryByTestId, unmount } = render(<SwpCalculator />);
    expect(queryByTestId('field-swp-initial-corpus-slider')).not.toBeNull();
    expect(queryByTestId('field-swp-monthly-withdrawal-slider')).not.toBeNull();
    expect(queryByTestId('field-swp-duration-slider')).not.toBeNull();
    // Generic SIP fields are gone.
    expect(queryByTestId(TESTIDS.fieldSlider('monthlySip'))).toBeNull();
    expect(queryByTestId(TESTIDS.fieldSlider('monthlySwp'))).toBeNull();
    unmount();
  });

  it('renders the default total withdrawals computed by the model', () => {
    const { getByTestId, unmount } = render(<SwpCalculator />);
    const expected = formatCurrency(computeSwp(DEFAULT_SWP_INPUTS).totalWithdrawals, 'INR');
    expect(getByTestId(TESTIDS.swpOutput('total-withdrawals')).textContent).toContain(expected);
    unmount();
  });

  it('recomputes when the monthly withdrawal changes', () => {
    const { getByTestId, unmount } = render(<SwpCalculator />);
    const before = getByTestId(TESTIDS.swpOutput('remaining-corpus')).textContent;

    const input = getByTestId('field-swp-monthly-withdrawal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '150000' } });

    const after = getByTestId(TESTIDS.swpOutput('remaining-corpus')).textContent;
    expect(after).not.toBe(before);
    unmount();
  });
});

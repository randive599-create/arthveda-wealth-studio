// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { RetirementPlanner } from '../RetirementPlanner';
import { computeRetirement, DEFAULT_RETIREMENT_INPUTS } from '../retirementModel';
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

describe('RetirementPlanner (dedicated retirement experience)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the retirement controls, outputs, three charts and report button', () => {
    const { queryByTestId } = render(<RetirementPlanner />);

    expect(queryByTestId(TESTIDS.retirementPlanner)).not.toBeNull();
    expect(queryByTestId(TESTIDS.retirementControls)).not.toBeNull();
    expect(queryByTestId(TESTIDS.retirementSummary)).not.toBeNull();
    expect(queryByTestId(TESTIDS.retirementSustainability)).not.toBeNull();
    expect(queryByTestId(TESTIDS.retirementReportButton)).not.toBeNull();

    for (const key of [
      'required-corpus',
      'projected-corpus',
      'wealth-gap',
      'inflation-adjusted-need',
      'sustainability',
    ]) {
      expect(queryByTestId(TESTIDS.retirementOutput(key))).not.toBeNull();
    }

    for (const key of ['accumulation', 'drawdown', 'gap']) {
      expect(queryByTestId(TESTIDS.retirementChart(key))).not.toBeNull();
    }
  });

  it('shows the retirement inputs and not the generic SIP/SWP fields', () => {
    const { queryByTestId, unmount } = render(<RetirementPlanner />);
    expect(queryByTestId('field-retirement-current-age-slider')).not.toBeNull();
    expect(queryByTestId('field-retirement-retirement-age-slider')).not.toBeNull();
    expect(queryByTestId('field-retirement-income-slider')).not.toBeNull();
    // Generic studio fields are gone.
    expect(queryByTestId(TESTIDS.fieldSlider('monthlySwp'))).toBeNull();
    expect(queryByTestId(TESTIDS.fieldSlider('monthlySip'))).toBeNull();
    unmount();
  });

  it('renders the default projected corpus computed by the model', () => {
    const { getByTestId, unmount } = render(<RetirementPlanner />);
    const expected = formatCurrency(computeRetirement(DEFAULT_RETIREMENT_INPUTS).projectedCorpus, 'INR');
    expect(getByTestId(TESTIDS.retirementOutput('projected-corpus')).textContent).toContain(expected);
    unmount();
  });

  it('recomputes when the monthly investment changes', () => {
    const { getByTestId, unmount } = render(<RetirementPlanner />);
    const before = getByTestId(TESTIDS.retirementOutput('projected-corpus')).textContent;

    const input = getByTestId('field-retirement-monthly-investment-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '100000' } });

    const after = getByTestId(TESTIDS.retirementOutput('projected-corpus')).textContent;
    expect(after).not.toBe(before);
    unmount();
  });
});

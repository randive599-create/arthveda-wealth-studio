// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { SipVsStepUpCalculator } from '../SipVsStepUpCalculator';
import { STEPUP_FAQ } from '../stepUpContent';
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

describe('SipVsStepUpCalculator', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders controls, the method toggle, outputs, four charts and the comparison table', () => {
    const { queryByTestId } = render(<SipVsStepUpCalculator />);

    expect(queryByTestId(TESTIDS.stepUpCalculator)).not.toBeNull();
    expect(queryByTestId(TESTIDS.stepUpControls)).not.toBeNull();
    expect(queryByTestId(TESTIDS.stepUpMethodToggle)).not.toBeNull();
    expect(queryByTestId(TESTIDS.stepUpSummary)).not.toBeNull();
    expect(queryByTestId(TESTIDS.stepUpUnique)).not.toBeNull();
    expect(queryByTestId(TESTIDS.stepUpComparison)).not.toBeNull();
    expect(queryByTestId(TESTIDS.stepUpReportButton)).not.toBeNull();
    expect(queryByTestId(TESTIDS.stepUpExample)).not.toBeNull();

    for (const key of [
      'normal-corpus',
      'stepup-corpus',
      'additional-wealth',
      'difference',
      'total-invested',
      'total-gain',
      'wealth-multiplier',
      'years-saved',
      'equivalent-sip',
      'acceleration',
      'extra-wealth',
    ]) {
      expect(queryByTestId(TESTIDS.stepUpOutput(key))).not.toBeNull();
    }

    for (const key of ['growth', 'difference', 'invested-vs-wealth', 'sip-progression']) {
      expect(queryByTestId(TESTIDS.stepUpChart(key))).not.toBeNull();
    }
  });

  it('toggles between percentage and fixed-amount step-up methods', () => {
    const { queryByTestId, getByTestId } = render(<SipVsStepUpCalculator />);

    // Percentage is the default.
    expect(queryByTestId('field-stepup-percent-slider')).not.toBeNull();
    expect(queryByTestId('field-stepup-step-amount-slider')).toBeNull();

    fireEvent.click(getByTestId(TESTIDS.stepUpMethodOption('amount')));

    expect(queryByTestId('field-stepup-step-amount-slider')).not.toBeNull();
    expect(queryByTestId('field-stepup-percent-slider')).toBeNull();
  });

  it('applies a SIP preset and recomputes the step-up corpus', () => {
    const { getByTestId } = render(<SipVsStepUpCalculator />);
    const before = getByTestId(TESTIDS.stepUpOutput('stepup-corpus')).textContent;

    fireEvent.click(getByTestId(TESTIDS.stepUpAmountPreset(50_000)));

    expect((getByTestId('field-stepup-amount-input') as HTMLInputElement).value).toBe('50000');
    expect(getByTestId(TESTIDS.stepUpOutput('stepup-corpus')).textContent).not.toBe(before);
  });

  it('has 10 FAQ entries available for the FAQPage schema', () => {
    expect(STEPUP_FAQ).toHaveLength(10);
  });
});

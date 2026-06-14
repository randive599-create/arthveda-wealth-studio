// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ExploreCalculators } from '../ExploreCalculators';
import { CALCULATORS } from '../../../lib/calculators';
import { TESTIDS } from '../../../lib/testids';

describe('ExploreCalculators', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a card for every calculator', () => {
    const { queryByTestId, unmount } = render(
      <ExploreCalculators currentPath="/retirement-calculator" />,
    );
    expect(queryByTestId(TESTIDS.exploreCalculators)).not.toBeNull();
    for (const calc of CALCULATORS) {
      expect(queryByTestId(TESTIDS.exploreCalculatorCard(calc.path))).not.toBeNull();
    }
    expect(CALCULATORS).toHaveLength(6);
    unmount();
  });

  it('marks the current calculator active (not a link) and links the rest', () => {
    const { getByTestId, unmount } = render(
      <ExploreCalculators currentPath="/retirement-calculator" />,
    );

    const current = getByTestId(TESTIDS.exploreCalculatorCard('/retirement-calculator'));
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(current.tagName).not.toBe('A');

    for (const calc of CALCULATORS) {
      if (calc.path === '/retirement-calculator') continue;
      const card = getByTestId(TESTIDS.exploreCalculatorCard(calc.path));
      expect(card.tagName).toBe('A');
      expect(card.getAttribute('href')).toBe(calc.path);
      expect(card.getAttribute('aria-current')).toBeNull();
    }
    unmount();
  });
});

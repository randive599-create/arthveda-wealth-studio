// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { CalculatorNav } from '../CalculatorNav';
import { NAV_ITEMS } from '../../../lib/calculators';
import { TESTIDS } from '../../../lib/testids';

function setPath(path: string) {
  window.history.pushState({}, '', path);
}

describe('CalculatorNav', () => {
  afterEach(() => {
    setPath('/');
    document.body.innerHTML = '';
  });

  it('renders Home plus every calculator link in the desktop menu', () => {
    setPath('/');
    const { queryByTestId, unmount } = render(<CalculatorNav />);

    expect(queryByTestId(TESTIDS.calculatorNav)).not.toBeNull();
    expect(queryByTestId(TESTIDS.navBrand)).not.toBeNull();
    for (const item of NAV_ITEMS) {
      expect(queryByTestId(TESTIDS.navLink(item.path))).not.toBeNull();
    }
    // Home + 6 calculators + About Us + Contact Us + Privacy + Terms + Disclaimer.
    // "Learn" is intentionally excluded until at least one article is published.
    expect(NAV_ITEMS).toHaveLength(12);
    unmount();
  });

  it('marks the active route with aria-current="page" and leaves the rest unmarked', () => {
    setPath('/retirement-calculator');
    const { getByTestId, unmount } = render(<CalculatorNav />);

    expect(getByTestId(TESTIDS.navLink('/retirement-calculator')).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(getByTestId(TESTIDS.navLink('/sip-calculator')).getAttribute('aria-current')).toBeNull();
    expect(getByTestId(TESTIDS.navLink('/')).getAttribute('aria-current')).toBeNull();
    unmount();
  });

  it('highlights Home on the root path', () => {
    setPath('/');
    const { getByTestId, unmount } = render(<CalculatorNav />);
    expect(getByTestId(TESTIDS.navLink('/')).getAttribute('aria-current')).toBe('page');
    unmount();
  });

  it('toggles the mobile collapsible menu via the hamburger button', () => {
    setPath('/swp-calculator');
    const { getByTestId, queryByTestId, unmount } = render(<CalculatorNav />);

    // Collapsed by default.
    expect(queryByTestId(TESTIDS.navMenuMobile)).toBeNull();
    const toggle = getByTestId(TESTIDS.navToggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    // Open.
    fireEvent.click(toggle);
    expect(queryByTestId(TESTIDS.navMenuMobile)).not.toBeNull();
    expect(getByTestId(TESTIDS.navToggle).getAttribute('aria-expanded')).toBe('true');

    // The active route is also highlighted inside the mobile menu.
    expect(getByTestId(`${TESTIDS.navLink('/swp-calculator')}-mobile`).getAttribute('aria-current')).toBe(
      'page',
    );

    // Close.
    fireEvent.click(getByTestId(TESTIDS.navToggle));
    expect(queryByTestId(TESTIDS.navMenuMobile)).toBeNull();
    unmount();
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { AppShell } from '../AppShell';
import { TESTIDS } from '../../../lib/testids';

/**
 * The brand hero (StudioHeader, with its oversized "ArthVeda" wordmark <h1>)
 * must appear only on the home Wealth Projection Studio. Calculator landing
 * pages opt out via `showHero={false}` so their own page <h1> + intro lead the
 * page and there is no duplicate, generic <h1>.
 */
describe('AppShell hero visibility', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the ArthVeda brand hero by default (home page)', () => {
    const { queryByTestId, unmount } = render(
      <AppShell parameters={<div>params</div>} studio={<div>studio</div>} />,
    );

    expect(queryByTestId(TESTIDS.appShell)).not.toBeNull();
    expect(queryByTestId(TESTIDS.header)).not.toBeNull();
    expect(queryByTestId(TESTIDS.brandWordmark)).not.toBeNull();
    expect(queryByTestId(TESTIDS.brandWordmark)?.textContent).toBe('ArthVeda');
    unmount();
  });

  it('hides the brand hero when showHero is false (calculator pages)', () => {
    const { queryByTestId, queryByText, unmount } = render(
      <AppShell
        showHero={false}
        parameters={<div>params</div>}
        studio={
          <div>
            <h1>Retirement Calculator India</h1>
          </div>
        }
      />,
    );

    // Shell still renders, but the hero header and ArthVeda wordmark are gone.
    expect(queryByTestId(TESTIDS.appShell)).not.toBeNull();
    expect(queryByTestId(TESTIDS.header)).toBeNull();
    expect(queryByTestId(TESTIDS.brandWordmark)).toBeNull();

    // The page's own H1 is the only <h1> in the document.
    const headings = document.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Retirement Calculator India');
    expect(queryByText('Retirement Calculator India')).not.toBeNull();
    unmount();
  });
});

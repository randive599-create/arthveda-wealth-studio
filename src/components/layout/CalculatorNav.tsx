/**
 * Sitewide top navigation bar.
 *
 * Rendered by AppShell so it appears on every page (home + all calculator
 * landing pages). On lg+ the links lay out horizontally; below lg they collapse
 * behind a hamburger toggle into a stacked menu. The link matching the current
 * route is highlighted (and marked aria-current="page").
 *
 * There is no client-side router — each item is a plain anchor that triggers a
 * full navigation — so the active route is simply the current pathname.
 */

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '../../lib/calculators';
import { getCurrentPath, isActivePath } from '../../lib/path';
import { TESTIDS } from '../../lib/testids';
import { BrandMark } from './BrandMark';

const LINK_BASE =
  'rounded-[var(--radius-control)] px-3 py-2 text-[13px] font-medium transition-colors';
const LINK_ACTIVE = 'bg-accent text-canvas';
const LINK_IDLE = 'text-ink-secondary hover:bg-mist hover:text-ink';

export function CalculatorNav() {
  const [open, setOpen] = useState(false);
  const current = getCurrentPath();

  return (
    <nav
      aria-label="Primary"
      data-testid={TESTIDS.calculatorNav}
      className="border-b border-hairline bg-canvas"
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-3 sm:px-8">
        <a
          href="/"
          data-testid={TESTIDS.navBrand}
          className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <BrandMark size={28} />
          <span className="font-heading text-xl font-bold leading-none text-ink">ArthVeda</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-ink-secondary sm:inline">
            Calculators
          </span>
        </a>

        {/* Desktop: horizontal links */}
        <ul
          className="hidden items-center gap-1 xl:flex"
          data-testid={TESTIDS.navMenuDesktop}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(current, item.path);
            return (
              <li key={item.path}>
                <a
                  href={item.path}
                  aria-current={active ? 'page' : undefined}
                  data-testid={TESTIDS.navLink(item.path)}
                  className={`${LINK_BASE} ${active ? LINK_ACTIVE : LINK_IDLE}`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Mobile: hamburger toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="primary-nav-mobile"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          data-testid={TESTIDS.navToggle}
          className="inline-flex items-center justify-center rounded-[var(--radius-control)] border border-hairline p-2 text-ink transition-colors hover:bg-mist xl:hidden"
        >
          {open ? (
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile: collapsible stacked menu */}
      {open ? (
        <ul
          id="primary-nav-mobile"
          data-testid={TESTIDS.navMenuMobile}
          className="flex flex-col gap-1 border-t border-hairline px-5 pb-3 pt-2 sm:px-8 xl:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(current, item.path);
            return (
              <li key={item.path}>
                <a
                  href={item.path}
                  aria-current={active ? 'page' : undefined}
                  data-testid={`${TESTIDS.navLink(item.path)}-mobile`}
                  className={`block ${LINK_BASE} ${active ? LINK_ACTIVE : LINK_IDLE}`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </nav>
  );
}

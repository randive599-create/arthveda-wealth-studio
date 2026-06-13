/**
 * "Explore Other Calculators" cross-link section.
 *
 * Rendered near the bottom of every calculator landing page (inside its SEO
 * content, so it is part of the prerendered HTML as well as the client render).
 * Shows a card for every ArthVeda calculator; the card for the current page is
 * marked as active (aria-current="page") and is not a link, while the others
 * link to their routes. Built from the existing Card / SectionHeading
 * primitives — no new visual language.
 */

import { ArrowUpRight } from 'lucide-react';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';
import { CALCULATORS } from '../../lib/calculators';
import { isActivePath } from '../../lib/path';
import { TESTIDS } from '../../lib/testids';

export interface ExploreCalculatorsProps {
  /** Route of the page rendering this section, used to mark the active card. */
  currentPath: string;
}

export function ExploreCalculators({ currentPath }: ExploreCalculatorsProps) {
  return (
    <Card className="p-6" data-testid={TESTIDS.exploreCalculators}>
      <SectionHeading
        eyebrow="Explore"
        title="Explore Other Calculators"
        description="Jump to any of the ArthVeda wealth calculators — each powered by the same projection engine."
      />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map((calc) => {
          const active = isActivePath(currentPath, calc.path);

          if (active) {
            return (
              <div
                key={calc.path}
                aria-current="page"
                data-testid={TESTIDS.exploreCalculatorCard(calc.path)}
                className="rounded-[var(--radius-control)] border border-accent bg-mist p-4"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-heading text-lg font-bold leading-snug text-accent">
                    {calc.label}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                    You are here
                  </span>
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-secondary">
                  {calc.description}
                </span>
              </div>
            );
          }

          return (
            <a
              key={calc.path}
              href={calc.path}
              data-testid={TESTIDS.exploreCalculatorCard(calc.path)}
              className="
                group flex flex-col rounded-[var(--radius-control)] border border-hairline p-4
                transition-colors hover:border-accent
              "
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-heading text-lg font-bold leading-snug text-ink group-hover:text-accent">
                  {calc.label}
                </span>
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-secondary transition-colors group-hover:text-accent"
                />
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-secondary">
                {calc.description}
              </span>
            </a>
          );
        })}
      </div>
    </Card>
  );
}

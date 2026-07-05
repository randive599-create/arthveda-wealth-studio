/**
 * Related Calculators — cross-links from an article to the relevant ArthVeda
 * calculators, resolved from the shared CALCULATORS registry by path. Reuses the
 * card language from ExploreCalculators. Presentational and server-safe.
 */

import { ArrowUpRight } from 'lucide-react';
import { CALCULATORS } from '../../lib/calculators';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';

export interface RelatedCalculatorsProps {
  /** Calculator paths (into CALCULATORS). Unknown paths are ignored. */
  paths?: string[];
}

export function RelatedCalculators({ paths }: RelatedCalculatorsProps) {
  const items = (paths ?? [])
    .map((path) => CALCULATORS.find((c) => c.path === path))
    .filter((c): c is (typeof CALCULATORS)[number] => Boolean(c));

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="p-6" data-testid="article-related-calculators">
      <SectionHeading
        eyebrow="Try it"
        title="Related Calculators"
        description="Put these ideas to work with the calculators behind this guide."
      />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((calc) => (
          <a
            key={calc.path}
            href={calc.path}
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
        ))}
      </div>
    </Card>
  );
}

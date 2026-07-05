/**
 * Key Takeaways — a scannable summary card placed near the top of an article.
 * Presentational and server-safe.
 */

import { Check } from 'lucide-react';
import { Card } from '../primitives/Card';

export interface KeyTakeawaysProps {
  items: string[];
}

export function KeyTakeaways({ items }: KeyTakeawaysProps) {
  if (items.length === 0) {
    return null;
  }
  return (
    <Card variant="accent" className="p-6" data-testid="article-key-takeaways">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Key takeaways</p>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 text-sm leading-relaxed text-ink sm:text-base">
            <Check
              size={18}
              strokeWidth={2}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-accent"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

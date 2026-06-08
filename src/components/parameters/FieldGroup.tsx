/**
 * FieldGroup — a labelled grouping of related controls inside the parameters
 * panel, with an optional inline control on the right of the heading (e.g. a
 * mode toggle). Provides consistent spacing and an optional top divider.
 */

import type { ReactNode } from 'react';

export interface FieldGroupProps {
  title: string;
  /** Optional control rendered on the right of the group heading. */
  action?: ReactNode;
  children: ReactNode;
  /** Draw a hairline divider above the group. */
  divided?: boolean;
}

export function FieldGroup({ title, action, children, divided = true }: FieldGroupProps) {
  return (
    <section className={divided ? 'border-t border-hairline pt-5' : undefined}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary">
          {title}
        </h3>
        {action}
      </div>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

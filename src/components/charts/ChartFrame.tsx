/**
 * ChartFrame — a titled, bordered container shared by the studio charts.
 *
 * Provides the institutional card chrome (eyebrow, serif title, optional
 * supporting note and right-aligned legend) so individual chart components
 * focus on the visualization itself.
 */

import type { ReactNode } from 'react';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';

export interface ChartFrameProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Optional legend / controls rendered at the top-right. */
  aside?: ReactNode;
  children: ReactNode;
  testId?: string;
}

export function ChartFrame({ eyebrow, title, description, aside, children, testId }: ChartFrameProps) {
  return (
    <Card className="p-6" data-testid={testId}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </Card>
  );
}

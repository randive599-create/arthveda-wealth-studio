/**
 * ChartSkeleton — a calm loading placeholder shown while a lazily-loaded chart
 * chunk is being fetched. Mirrors the ChartFrame chrome so the layout does not
 * shift when the real chart resolves.
 */

import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';

export interface ChartSkeletonProps {
  eyebrow: string;
  title: string;
}

export function ChartSkeleton({ eyebrow, title }: ChartSkeletonProps) {
  return (
    <Card className="p-6">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="mt-6 h-[280px] w-full animate-pulse rounded-[var(--radius-control)] bg-mist sm:h-[360px]" />
    </Card>
  );
}

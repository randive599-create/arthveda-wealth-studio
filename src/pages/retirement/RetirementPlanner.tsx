/**
 * RetirementPlanner — the dedicated Retirement Planner experience.
 *
 * Self-contained: holds its own retirement inputs in local state (it
 * deliberately does NOT touch the shared studio store, so no other calculator
 * is affected), recomputes via the pure `computeRetirement`, and lays out a
 * sticky inputs column beside the retirement outputs, the accumulation /
 * drawdown / gap charts, and the retirement-specific PDF download.
 */

import { useMemo, useState } from 'react';
import { TESTIDS } from '../../lib/testids';
import { computeRetirement, DEFAULT_RETIREMENT_INPUTS, type RetirementInputs } from './retirementModel';
import { RetirementControls } from './RetirementControls';
import { RetirementSummaryCards } from './RetirementSummaryCards';
import { RetirementCharts } from './RetirementCharts';
import { RetirementReportButton } from './RetirementReportButton';

export function RetirementPlanner() {
  const [inputs, setInputs] = useState<RetirementInputs>(DEFAULT_RETIREMENT_INPUTS);
  const result = useMemo(() => computeRetirement(inputs), [inputs]);

  const update = (patch: Partial<RetirementInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
      data-testid={TESTIDS.retirementPlanner}
    >
      <aside className="lg:col-span-4" aria-label="Retirement inputs">
        <div className="lg:sticky lg:top-6">
          <RetirementControls inputs={inputs} onChange={update} />
        </div>
      </aside>

      <div className="space-y-8 lg:col-span-8" aria-label="Retirement results">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
            Retirement Projection
          </p>
          <RetirementReportButton inputs={inputs} result={result} />
        </div>

        <RetirementSummaryCards result={result} />
        <RetirementCharts result={result} />
      </div>
    </div>
  );
}

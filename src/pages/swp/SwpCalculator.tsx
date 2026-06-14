/**
 * SwpCalculator — the dedicated SWP calculator experience.
 *
 * Self-contained: holds its own SWP inputs in local state (it deliberately does
 * NOT touch the shared studio store, so no other calculator is affected),
 * recomputes the SWP result on every change via the pure `computeSwp`, and lays
 * out a sticky inputs column beside the SWP outputs, the corpus depletion curve,
 * and the SWP-specific PDF download.
 */

import { useMemo, useState } from 'react';
import { TESTIDS } from '../../lib/testids';
import { computeSwp, DEFAULT_SWP_INPUTS, type SwpInputs } from './swpModel';
import { SwpControls } from './SwpControls';
import { SwpSummaryCards } from './SwpSummaryCards';
import { SwpChart } from './SwpChart';
import { SwpReportButton } from './SwpReportButton';

export function SwpCalculator() {
  const [inputs, setInputs] = useState<SwpInputs>(DEFAULT_SWP_INPUTS);
  const result = useMemo(() => computeSwp(inputs), [inputs]);

  const update = (patch: Partial<SwpInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
      data-testid={TESTIDS.swpCalculator}
    >
      <aside className="lg:col-span-4" aria-label="SWP inputs">
        <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh_-_3rem)] lg:overflow-y-auto lg:overflow-x-hidden">
          <SwpControls inputs={inputs} onChange={update} />
        </div>
      </aside>

      <div className="space-y-8 lg:col-span-8" aria-label="SWP results">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
            SWP Projection
          </p>
          <SwpReportButton inputs={inputs} result={result} />
        </div>

        <SwpSummaryCards result={result} />
        <SwpChart result={result} />
      </div>
    </div>
  );
}

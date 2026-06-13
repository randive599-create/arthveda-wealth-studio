/**
 * FireCalculator — the dedicated FIRE calculator experience.
 *
 * Self-contained: holds its own FIRE inputs in local state (it deliberately
 * does NOT touch the shared studio store, so no other calculator is affected),
 * recomputes the FIRE result on every change via the pure `computeFire`, and
 * lays out a sticky inputs column beside the FIRE outputs, charts, and the
 * FIRE-specific PDF download.
 */

import { useMemo, useState } from 'react';
import { TESTIDS } from '../../lib/testids';
import { computeFire, DEFAULT_FIRE_INPUTS, type FireInputs } from './fireModel';
import { FireControls } from './FireControls';
import { FireSummaryCards } from './FireSummaryCards';
import { FireCharts } from './FireCharts';
import { FireReportButton } from './FireReportButton';

export function FireCalculator() {
  const [inputs, setInputs] = useState<FireInputs>(DEFAULT_FIRE_INPUTS);
  const result = useMemo(() => computeFire(inputs), [inputs]);
  const fireAge = inputs.currentAge + result.yearsToFire;

  const update = (patch: Partial<FireInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
      data-testid={TESTIDS.fireCalculator}
    >
      <aside className="lg:col-span-4" aria-label="FIRE inputs">
        <div className="lg:sticky lg:top-6">
          <FireControls inputs={inputs} onChange={update} />
        </div>
      </aside>

      <div className="space-y-8 lg:col-span-8" aria-label="FIRE results">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
            FIRE Projection
          </p>
          <FireReportButton inputs={inputs} result={result} />
        </div>

        <FireSummaryCards result={result} fireAge={fireAge} />
        <FireCharts result={result} />
      </div>
    </div>
  );
}

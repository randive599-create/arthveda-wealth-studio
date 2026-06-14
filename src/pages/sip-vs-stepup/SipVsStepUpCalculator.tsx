/**
 * SipVsStepUpCalculator — the dedicated SIP vs Step-Up SIP comparison experience.
 *
 * Self-contained: holds its own inputs (including the active step-up method) in
 * local state (it does NOT touch the shared studio store, so no other calculator
 * is affected), recomputes via the pure `computeStepUp`, and lays out a sticky
 * inputs column beside the comparison outputs, the four charts, the comparison
 * table, and the comparison PDF download.
 */

import { useMemo, useState } from 'react';
import { TESTIDS } from '../../lib/testids';
import { computeStepUp, DEFAULT_STEPUP_INPUTS, type StepUpInputs } from './stepUpModel';
import { StepUpControls } from './StepUpControls';
import { StepUpSummary } from './StepUpSummary';
import { StepUpCharts } from './StepUpCharts';
import { StepUpComparisonTable } from './StepUpComparisonTable';
import { StepUpReportButton } from './StepUpReportButton';

export function SipVsStepUpCalculator() {
  const [inputs, setInputs] = useState<StepUpInputs>(DEFAULT_STEPUP_INPUTS);
  const result = useMemo(() => computeStepUp(inputs), [inputs]);

  const update = (patch: Partial<StepUpInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
      data-testid={TESTIDS.stepUpCalculator}
    >
      <aside className="lg:col-span-4" aria-label="Comparison inputs">
        <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh_-_3rem)] lg:overflow-y-auto lg:overflow-x-hidden">
          <StepUpControls inputs={inputs} onChange={update} />
        </div>
      </aside>

      <div className="space-y-8 lg:col-span-8" aria-label="Comparison results">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
            Wealth Comparison
          </p>
          <StepUpReportButton inputs={inputs} result={result} />
        </div>

        <StepUpSummary result={result} />
        <StepUpCharts result={result} />
        <StepUpComparisonTable result={result} />
      </div>
    </div>
  );
}

/**
 * LumpsumCalculator — the dedicated Lumpsum calculator experience.
 *
 * Self-contained: holds its own lumpsum inputs in local state (it deliberately
 * does NOT touch the shared studio store, so no other calculator is affected),
 * recomputes the result on every change via the pure `computeLumpsum`, and lays
 * out a sticky inputs column beside the lumpsum outputs, the investment growth
 * curve, and the lumpsum-specific PDF download.
 */

import { useMemo, useState } from 'react';
import { TESTIDS } from '../../lib/testids';
import { computeLumpsum, DEFAULT_LUMPSUM_INPUTS, type LumpsumInputs } from './lumpsumModel';
import { LumpsumControls } from './LumpsumControls';
import { LumpsumSummaryCards } from './LumpsumSummaryCards';
import { LumpsumChart } from './LumpsumChart';
import { LumpsumReportButton } from './LumpsumReportButton';

export function LumpsumCalculator() {
  const [inputs, setInputs] = useState<LumpsumInputs>(DEFAULT_LUMPSUM_INPUTS);
  const result = useMemo(() => computeLumpsum(inputs), [inputs]);

  const update = (patch: Partial<LumpsumInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
      data-testid={TESTIDS.lumpsumCalculator}
    >
      <aside className="lg:col-span-4" aria-label="Lumpsum inputs">
        <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh_-_3rem)] lg:overflow-y-auto lg:overflow-x-hidden">
          <LumpsumControls inputs={inputs} onChange={update} />
        </div>
      </aside>

      <div className="space-y-8 lg:col-span-8" aria-label="Lumpsum results">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
            Lumpsum Projection
          </p>
          <LumpsumReportButton inputs={inputs} result={result} />
        </div>

        <LumpsumSummaryCards result={result} />
        <LumpsumChart result={result} />
      </div>
    </div>
  );
}

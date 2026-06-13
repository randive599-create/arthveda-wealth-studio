/**
 * SipCalculator — the dedicated SIP Calculator India experience.
 *
 * Self-contained: holds its own SIP inputs and Basic/Advanced mode in local
 * state (it deliberately does NOT touch the shared studio store, so no other
 * calculator and not the homepage are affected), recomputes via the pure
 * `computeSip`, and lays out a sticky inputs column beside the SIP results,
 * charts, the SIP comparison table, and the SIP-specific PDF download.
 */

import { useMemo, useState } from 'react';
import { TESTIDS } from '../../lib/testids';
import { computeSip, DEFAULT_SIP_INPUTS, type SipInputs } from './sipModel';
import { SipControls } from './SipControls';
import { SipSummary } from './SipSummary';
import { SipCharts } from './SipCharts';
import { SipComparison } from './SipComparison';
import { SipReportButton } from './SipReportButton';

export function SipCalculator() {
  const [inputs, setInputs] = useState<SipInputs>(DEFAULT_SIP_INPUTS);
  const [advanced, setAdvanced] = useState(false);
  const result = useMemo(() => computeSip(inputs), [inputs]);

  const update = (patch: Partial<SipInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
      data-testid={TESTIDS.sipCalculator}
    >
      <aside className="lg:col-span-4" aria-label="SIP inputs">
        <div className="lg:sticky lg:top-6">
          <SipControls
            inputs={inputs}
            advanced={advanced}
            onChange={update}
            onToggleAdvanced={() => setAdvanced((v) => !v)}
          />
        </div>
      </aside>

      <div className="space-y-8 lg:col-span-8" aria-label="SIP results">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-secondary">
            SIP Projection
          </p>
          <SipReportButton inputs={inputs} result={result} />
        </div>

        <SipSummary result={result} />
        <SipCharts result={result} />
        <SipComparison inputs={inputs} />
      </div>
    </div>
  );
}

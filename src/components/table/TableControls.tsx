/**
 * Controls for the Projection Ledger: phase filter, year search, and the
 * Table / Card view toggle. Purely presentational — state lives in the parent
 * ProjectionTable so the controls and the rendered rows stay in sync.
 */

import { LayoutGrid, Search, Table2 } from 'lucide-react';
import { useId } from 'react';
import { TESTIDS } from '../../lib/testids';
import { ToggleGroup } from '../primitives/ToggleGroup';
import type { PhaseFilter } from './projectionRows';

export type TableView = 'table' | 'card';

export interface TableControlsProps {
  phase: PhaseFilter;
  onPhaseChange: (phase: PhaseFilter) => void;
  query: string;
  onQueryChange: (query: string) => void;
  view: TableView;
  onViewChange: (view: TableView) => void;
}

const PHASE_OPTIONS: { value: PhaseFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'accumulation', label: 'Accumulation' },
  { value: 'growth', label: 'Growth' },
  { value: 'withdrawal', label: 'Withdrawal' },
];

export function TableControls({
  phase,
  onPhaseChange,
  query,
  onQueryChange,
  view,
  onViewChange,
}: TableControlsProps) {
  const searchId = useId();

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup<PhaseFilter>
          ariaLabel="Filter by phase"
          value={phase}
          onChange={onPhaseChange}
          testId={TESTIDS.tablePhaseFilter}
          options={PHASE_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
            testId: TESTIDS.tablePhaseOption(o.value),
          }))}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-secondary"
          />
          <label htmlFor={searchId} className="sr-only">
            Search by year
          </label>
          <input
            id={searchId}
            type="text"
            inputMode="numeric"
            placeholder="Year 10"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            data-testid={TESTIDS.tableSearch}
            className="
              w-32 rounded-[var(--radius-control)] border border-hairline bg-canvas py-1.5 pl-8 pr-2.5
              font-mono text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent
            "
          />
        </div>

        <ToggleGroup<TableView>
          ariaLabel="Switch view"
          value={view}
          onChange={onViewChange}
          testId={TESTIDS.tableViewToggle}
          options={[
            {
              value: 'table',
              label: (
                <span className="inline-flex items-center gap-1.5">
                  <Table2 size={13} strokeWidth={1.75} aria-hidden="true" />
                  Table
                </span>
              ),
              testId: TESTIDS.tableViewOption('table'),
            },
            {
              value: 'card',
              label: (
                <span className="inline-flex items-center gap-1.5">
                  <LayoutGrid size={13} strokeWidth={1.75} aria-hidden="true" />
                  Cards
                </span>
              ),
              testId: TESTIDS.tableViewOption('card'),
            },
          ]}
        />
      </div>
    </div>
  );
}

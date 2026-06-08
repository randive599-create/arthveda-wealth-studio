/**
 * Projection Ledger — the institutional year-by-year table.
 *
 * Features:
 *   - Sticky header and sticky first (Year) column.
 *   - Sortable columns (year, contribution, withdrawal, return, corpus).
 *   - Phase filter, quick year search, and a Table / Card view toggle.
 *   - Virtualized body when the (filtered) row count exceeds the threshold.
 *   - Always-visible summary footer with whole-projection totals.
 *   - Currency-aware, right-aligned IBM Plex Mono figures.
 *
 * All data transformation lives in `projectionRows.ts` so the PDF export can
 * reuse the identical rows and totals. This component owns only view state
 * (sort, filter, search, view mode, scroll position).
 */

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { useStudioStore } from '../../state/useStudioStore';
import { selectCurrency, selectResult } from '../../state/selectors';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { Card } from '../primitives/Card';
import { SectionHeading } from '../primitives/SectionHeading';
import { PhaseBadge } from './PhaseBadge';
import { TableControls, type TableView } from './TableControls';
import {
  buildProjectionRows,
  computeTableSummary,
  computeWindow,
  filterRows,
  PHASE_LABEL,
  ROW_HEIGHT,
  searchRows,
  sortRows,
  VIRTUALIZE_THRESHOLD,
  type PhaseFilter,
  type ProjectionTableRow,
  type SortDir,
  type SortKey,
} from './projectionRows';

interface ColumnDef {
  key: SortKey | 'phase' | 'totalInvestment' | 'inflationAdjustedCorpus';
  label: string;
  sortable: boolean;
  numeric: boolean;
}

const VIEWPORT_HEIGHT = 480;

export function ProjectionTable() {
  const result = useStudioStore(selectResult);
  const currency = useStudioStore(selectCurrency);

  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [phase, setPhase] = useState<PhaseFilter>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<TableView>('table');
  const [scrollTop, setScrollTop] = useState(0);

  const inflationEnabled = result.inflation !== null;
  const money = (value: number) => formatCurrency(value, currency);

  // Base rows are derived once per projection; the summary always reflects the
  // full projection regardless of filters/search.
  const baseRows = useMemo(() => buildProjectionRows(result), [result]);
  const summary = useMemo(() => computeTableSummary(baseRows), [baseRows]);

  const visibleRows = useMemo(() => {
    const filtered = filterRows(baseRows, phase);
    const searched = searchRows(filtered, query);
    return sortRows(searched, sortKey, sortDir);
  }, [baseRows, phase, query, sortKey, sortDir]);

  const columns = useMemo<ColumnDef[]>(() => {
    const cols: ColumnDef[] = [
      { key: 'year', label: 'Year', sortable: true, numeric: false },
      { key: 'phase', label: 'Phase', sortable: false, numeric: false },
      { key: 'sipContribution', label: 'SIP Contribution', sortable: true, numeric: true },
      { key: 'totalInvestment', label: 'Total Investment', sortable: false, numeric: true },
      { key: 'withdrawal', label: 'Withdrawal', sortable: true, numeric: true },
      { key: 'investmentReturn', label: 'Investment Return', sortable: true, numeric: true },
      { key: 'endCorpus', label: 'End Corpus', sortable: true, numeric: true },
    ];
    if (inflationEnabled) {
      cols.push({
        key: 'inflationAdjustedCorpus',
        label: 'Inflation Adj. Corpus',
        sortable: false,
        numeric: true,
      });
    }
    return cols;
  }, [inflationEnabled]);

  const colCount = columns.length;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'year' ? 'asc' : 'desc');
    }
  };

  const virtualize = visibleRows.length > VIRTUALIZE_THRESHOLD;
  const window = virtualize
    ? computeWindow(scrollTop, VIEWPORT_HEIGHT, ROW_HEIGHT, visibleRows.length)
    : { start: 0, end: visibleRows.length, topPad: 0, bottomPad: 0 };
  const renderedRows = visibleRows.slice(window.start, window.end);

  return (
    <Card className="p-6" data-testid={TESTIDS.projectionTable}>
      <SectionHeading
        eyebrow="Projection Ledger"
        title="Year-by-Year Projection"
        description="Year-by-year view of capital contributions, withdrawals, returns and projected wealth."
      />

      <div className="mt-6">
        <TableControls
          phase={phase}
          onPhaseChange={setPhase}
          query={query}
          onQueryChange={setQuery}
          view={view}
          onViewChange={setView}
        />
      </div>

      {visibleRows.length === 0 ? (
        <p
          className="mt-6 rounded-[var(--radius-control)] border border-dashed border-hairline bg-mist px-4 py-8 text-center text-sm text-ink-secondary"
          data-testid={TESTIDS.tableEmpty}
        >
          No projection years match the current filter or search.
        </p>
      ) : view === 'table' ? (
        <div
          className="mt-5 overflow-auto rounded-[var(--radius-control)] border border-hairline"
          style={{ maxHeight: VIEWPORT_HEIGHT }}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        >
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Projection ledger, {visibleRows.length} years, values in {currency}
            </caption>
            <thead className="sticky top-0 z-20">
              <tr className="bg-mist">
                {columns.map((col, index) => {
                  const isSorted = col.sortable && col.key === sortKey;
                  const sticky =
                    index === 0
                      ? 'sticky left-0 z-30 bg-mist'
                      : '';
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={
                        isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                      }
                      className={`
                        border-b border-hairline px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-secondary
                        ${col.numeric ? 'text-right' : 'text-left'} ${sticky}
                      `}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key as SortKey)}
                          data-testid={TESTIDS.tableSortHeader(col.key)}
                          className={`inline-flex items-center gap-1 outline-none hover:text-ink focus-visible:text-ink ${
                            col.numeric ? 'flex-row-reverse' : ''
                          }`}
                        >
                          {col.label}
                          {isSorted ? (
                            sortDir === 'asc' ? (
                              <ArrowUp size={12} strokeWidth={2} aria-hidden="true" />
                            ) : (
                              <ArrowDown size={12} strokeWidth={2} aria-hidden="true" />
                            )
                          ) : (
                            <ChevronsUpDown
                              size={12}
                              strokeWidth={2}
                              aria-hidden="true"
                              className="text-hairline"
                            />
                          )}
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {window.topPad > 0 ? (
                <tr aria-hidden="true">
                  <td colSpan={colCount} style={{ height: window.topPad }} />
                </tr>
              ) : null}

              {renderedRows.map((row) => (
                <tr
                  key={row.year}
                  data-testid={TESTIDS.tableRow(row.year)}
                  className="transition-colors duration-100 hover:bg-mist"
                  style={{ height: ROW_HEIGHT }}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-hairline bg-canvas px-3 py-2.5 text-left font-mono text-sm font-semibold text-ink"
                  >
                    {row.year}
                  </th>
                  <td className="border-b border-hairline px-3 py-2.5">
                    <PhaseBadge phase={row.phase} />
                  </td>
                  <td className="border-b border-hairline px-3 py-2.5 text-right font-mono text-ink">
                    {money(row.sipContribution)}
                  </td>
                  <td className="border-b border-hairline px-3 py-2.5 text-right font-mono text-ink">
                    {money(row.totalInvestment)}
                  </td>
                  <td className="border-b border-hairline px-3 py-2.5 text-right font-mono text-ink">
                    {money(row.withdrawal)}
                  </td>
                  <td className="border-b border-hairline px-3 py-2.5 text-right font-mono text-ink">
                    {money(row.investmentReturn)}
                  </td>
                  <td className="border-b border-hairline px-3 py-2.5 text-right font-mono font-semibold text-ink">
                    {money(row.endCorpus)}
                  </td>
                  {inflationEnabled ? (
                    <td className="border-b border-hairline px-3 py-2.5 text-right font-mono text-ink-secondary">
                      {row.inflationAdjustedCorpus !== null
                        ? money(row.inflationAdjustedCorpus)
                        : '—'}
                    </td>
                  ) : null}
                </tr>
              ))}

              {window.bottomPad > 0 ? (
                <tr aria-hidden="true">
                  <td colSpan={colCount} style={{ height: window.bottomPad }} />
                </tr>
              ) : null}
            </tbody>
            <tfoot className="sticky bottom-0 z-20">
              <tr className="bg-mist">
                <th
                  scope="row"
                  className="sticky left-0 z-30 border-t-2 border-accent bg-mist px-3 py-3 text-left font-mono text-[11px] uppercase tracking-[0.12em] text-ink"
                >
                  Total
                </th>
                <td className="border-t-2 border-accent px-3 py-3" />
                <td className="border-t-2 border-accent px-3 py-3 text-right font-mono text-sm text-ink-secondary">
                  —
                </td>
                <td
                  className="border-t-2 border-accent px-3 py-3 text-right font-mono text-sm font-semibold text-ink"
                  data-testid={TESTIDS.tableSummaryInvestment}
                >
                  {money(summary.totalInvestment)}
                </td>
                <td
                  className="border-t-2 border-accent px-3 py-3 text-right font-mono text-sm font-semibold text-ink"
                  data-testid={TESTIDS.tableSummaryWithdrawal}
                >
                  {money(summary.totalWithdrawal)}
                </td>
                <td
                  className="border-t-2 border-accent px-3 py-3 text-right font-mono text-sm font-semibold text-ink"
                  data-testid={TESTIDS.tableSummaryReturns}
                >
                  {money(summary.totalReturns)}
                </td>
                <td
                  className="border-t-2 border-accent px-3 py-3 text-right font-mono text-sm font-semibold text-ink"
                  data-testid={TESTIDS.tableSummaryFinalCorpus}
                >
                  {money(summary.finalCorpus)}
                </td>
                {inflationEnabled ? (
                  <td className="border-t-2 border-accent px-3 py-3 text-right font-mono text-sm text-ink-secondary">
                    —
                  </td>
                ) : null}
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <CardView rows={visibleRows} currency={currency} inflationEnabled={inflationEnabled} />
      )}

      {view === 'card' && visibleRows.length > 0 ? (
        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-[var(--radius-control)] border-t-2 border-accent bg-mist p-4 sm:grid-cols-4">
          <SummaryStat
            label="Total Investment"
            value={money(summary.totalInvestment)}
            testId={TESTIDS.tableSummaryInvestment}
          />
          <SummaryStat
            label="Total Withdrawal"
            value={money(summary.totalWithdrawal)}
            testId={TESTIDS.tableSummaryWithdrawal}
          />
          <SummaryStat
            label="Total Returns"
            value={money(summary.totalReturns)}
            testId={TESTIDS.tableSummaryReturns}
          />
          <SummaryStat
            label="Final Corpus"
            value={money(summary.finalCorpus)}
            testId={TESTIDS.tableSummaryFinalCorpus}
          />
        </dl>
      ) : null}
    </Card>
  );
}

interface SummaryStatProps {
  label: string;
  value: string;
  testId: string;
}

function SummaryStat({ label, value, testId }: SummaryStatProps) {
  return (
    <div data-testid={testId}>
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-secondary">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

interface CardViewProps {
  rows: ProjectionTableRow[];
  currency: Parameters<typeof formatCurrency>[1];
  inflationEnabled: boolean;
}

/** Mobile-friendly card representation of the ledger rows. */
function CardView({ rows, currency, inflationEnabled }: CardViewProps) {
  const money = (value: number) => formatCurrency(value, currency);
  return (
    <ul className="mt-5 space-y-3" role="list">
      {rows.map((row) => (
        <li
          key={row.year}
          data-testid={TESTIDS.tableCard(row.year)}
          className="rounded-[var(--radius-control)] border border-hairline p-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-semibold text-ink">Year {row.year}</span>
            <PhaseBadge phase={row.phase} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            <Figure label="SIP Contribution" value={money(row.sipContribution)} />
            <Figure label="Total Investment" value={money(row.totalInvestment)} />
            <Figure label="Withdrawal" value={money(row.withdrawal)} />
            <Figure label="Investment Return" value={money(row.investmentReturn)} />
            <Figure label="End Corpus" value={money(row.endCorpus)} emphasize />
            {inflationEnabled ? (
              <Figure
                label="Inflation Adj. Corpus"
                value={row.inflationAdjustedCorpus !== null ? money(row.inflationAdjustedCorpus) : '—'}
              />
            ) : null}
          </dl>
          <span className="sr-only">Phase: {PHASE_LABEL[row.phase]}</span>
        </li>
      ))}
    </ul>
  );
}

interface FigureProps {
  label: string;
  value: string;
  emphasize?: boolean;
}

function Figure({ label, value, emphasize = false }: FigureProps) {
  return (
    <div className="flex flex-col">
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-secondary">
        {label}
      </dt>
      <dd
        className={`mt-0.5 font-mono text-sm ${emphasize ? 'font-semibold text-ink' : 'text-ink'}`}
      >
        {value}
      </dd>
    </div>
  );
}

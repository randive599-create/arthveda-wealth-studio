/**
 * Year-by-year comparison table: Monthly SIP, Annual Investment, Normal SIP
 * Corpus, Step-Up SIP Corpus and the Difference, for every year of the tenure.
 */

import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { formatCompactCurrency, formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import type { StepUpResult } from './stepUpModel';

export interface StepUpComparisonTableProps {
  result: StepUpResult;
}

export function StepUpComparisonTable({ result }: StepUpComparisonTableProps) {
  const money = (value: number) => formatCurrency(value, result.currency);
  const compact = (value: number) => formatCompactCurrency(value, result.currency);

  return (
    <Card className="p-6" data-testid={TESTIDS.stepUpComparison}>
      <SectionHeading
        eyebrow="Year by year"
        title="Normal vs Step-Up SIP — full comparison"
        description="Your rising monthly SIP and how the step-up corpus pulls ahead of a normal SIP every year."
      />
      <div className="mt-6 max-h-[28rem] overflow-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead className="sticky top-0 bg-canvas">
            <tr className="border-b border-hairline">
              {['Year', 'Monthly SIP', 'Annual Investment', 'Normal SIP', 'Step-Up SIP', 'Difference'].map(
                (heading) => (
                  <th
                    key={heading}
                    className="bg-canvas py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-secondary"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {result.comparison.map((row) => (
              <tr
                key={row.year}
                className="border-b border-hairline last:border-0"
                data-testid={TESTIDS.stepUpComparisonRow(row.year)}
              >
                <td className="py-2 pr-4 font-mono text-sm font-semibold text-ink">{row.year}</td>
                <td className="py-2 pr-4 font-mono text-sm text-ink-secondary">
                  {money(row.monthlySip)}
                </td>
                <td className="py-2 pr-4 font-mono text-sm text-ink-secondary">
                  {compact(row.annualInvestment)}
                </td>
                <td className="py-2 pr-4 font-mono text-sm text-ink">{compact(row.normalCorpus)}</td>
                <td className="py-2 pr-4 font-mono text-sm font-semibold text-ink">
                  {compact(row.stepUpCorpus)}
                </td>
                <td className="py-2 font-mono text-sm text-accent">{compact(row.difference)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/**
 * SIP comparison — a quick "Monthly SIP → Corpus" table for ₹5,000 / ₹10,000 /
 * ₹25,000 / ₹50,000 / ₹1,00,000 at the currently selected duration and return
 * assumptions. All corpus figures are engine-generated.
 */

import { Card } from '../../components/primitives/Card';
import { SectionHeading } from '../../components/primitives/SectionHeading';
import { formatCurrency } from '../../format/currency';
import { TESTIDS } from '../../lib/testids';
import { computeSipComparison, SIP_CURRENCY, type SipInputs } from './sipModel';

export interface SipComparisonProps {
  inputs: SipInputs;
}

export function SipComparison({ inputs }: SipComparisonProps) {
  const rows = computeSipComparison(inputs);
  const money = (value: number) => formatCurrency(value, SIP_CURRENCY);
  const stepUpNote = inputs.annualStepUpPct > 0 ? ` with a ${inputs.annualStepUpPct}% step-up` : '';

  return (
    <Card className="p-6" data-testid={TESTIDS.sipComparison}>
      <SectionHeading
        eyebrow="Comparison"
        title="Monthly SIP → Corpus"
        description={`Projected maturity value for each monthly SIP at ${inputs.expectedReturnPct}% over ${inputs.durationYears} years${stepUpNote}.`}
      />
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[24rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline">
              <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                Monthly SIP
              </th>
              <th className="py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-secondary">
                Estimated Corpus
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.monthlySip}
                className="border-b border-hairline last:border-0"
                data-testid={TESTIDS.sipComparisonRow(row.monthlySip)}
              >
                <td className="py-2.5 pr-4 font-mono text-sm font-semibold text-ink">
                  {money(row.monthlySip)}
                </td>
                <td className="py-2.5 font-mono text-sm text-accent">{money(row.corpus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

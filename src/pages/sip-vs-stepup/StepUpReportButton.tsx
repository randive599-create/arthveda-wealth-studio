/**
 * Download SIP vs Step-Up SIP report button. Generates the comparison PDF
 * client-side, reusing the existing PDF engine (jsPDF dynamically imported).
 */

import { useCallback, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { TESTIDS } from '../../lib/testids';
import type { StepUpInputs, StepUpResult } from './stepUpModel';

type Status = 'idle' | 'generating' | 'success' | 'error';

export interface StepUpReportButtonProps {
  inputs: StepUpInputs;
  result: StepUpResult;
}

export function StepUpReportButton({ inputs, result }: StepUpReportButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const busyRef = useRef(false);

  const handleClick = useCallback(async () => {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    setStatus('generating');
    setMessage('');
    try {
      const { generateStepUpReport } = await import('./stepUpReport');
      const fileName = await generateStepUpReport(inputs, result);
      setStatus('success');
      setMessage(`Saved ${fileName}`);
    } catch {
      setStatus('error');
      setMessage('The report could not be generated. Please try again.');
    } finally {
      busyRef.current = false;
    }
  }, [inputs, result]);

  const generating = status === 'generating';

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={generating}
        aria-busy={generating}
        data-testid={TESTIDS.stepUpReportButton}
        className="
          inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] border border-accent
          bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors
          hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70
        "
      >
        {generating ? (
          <Loader2 size={16} strokeWidth={2} aria-hidden="true" className="animate-spin" />
        ) : (
          <Download size={16} strokeWidth={2} aria-hidden="true" />
        )}
        {generating ? 'Generating…' : 'Download Comparison Report'}
      </button>

      <div aria-live="polite" className="min-h-[1.25rem] text-right">
        {status === 'success' ? (
          <p
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-accent"
            data-testid={TESTIDS.stepUpReportSuccess}
          >
            <CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" />
            {message}
          </p>
        ) : null}
        {status === 'error' ? (
          <p
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-risk-strong"
            data-testid={TESTIDS.stepUpReportError}
          >
            <AlertCircle size={13} strokeWidth={2} aria-hidden="true" />
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

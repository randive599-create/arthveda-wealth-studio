/**
 * Download Report button.
 *
 * Generates the multi-page Wealth Projection PDF entirely client-side. Drives a
 * four-state UX: idle, generating (with a progress bar and stage label), error,
 * and success (the resolved file name). The chart DOM nodes are located by their
 * test ids at click time so the heavy chart components need not forward refs.
 *
 * Accessibility: the button reflects its busy state via `aria-busy`; progress
 * and outcome messages are announced through an `aria-live` region.
 */

import { useCallback, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { useStudioStore } from '../../state/useStudioStore';
import { selectResult } from '../../state/selectors';
import { TESTIDS } from '../../lib/testids';
import type { ReportStage } from '../../report/generateReport';

type Status = 'idle' | 'generating' | 'success' | 'error';

const STAGE_LABEL: Record<ReportStage, string> = {
  preparing: 'Preparing report…',
  charts: 'Rendering charts…',
  rendering: 'Composing document…',
  saving: 'Saving PDF…',
  done: 'Complete',
};

export function DownloadReportButton() {
  const result = useStudioStore(selectResult);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<ReportStage>('preparing');
  const [message, setMessage] = useState('');
  const busyRef = useRef(false);

  const handleClick = useCallback(async () => {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    setStatus('generating');
    setProgress(0);
    setStage('preparing');
    setMessage('');

    try {
      const mountainEl = document.querySelector<HTMLElement>(
        `[data-testid="${TESTIDS.wealthMountain}"]`,
      );
      const donutEl = document.querySelector<HTMLElement>(
        `[data-testid="${TESTIDS.wealthDonut}"]`,
      );

      // The report module (jsPDF + html2canvas-pro) is heavy and only needed on
      // demand, so it is dynamically imported here to keep it out of the
      // initial bundle.
      const { generateReport } = await import('../../report/generateReport');

      const fileName = await generateReport(result, {
        mountainEl,
        donutEl,
        onProgress: (fraction, nextStage) => {
          setProgress(fraction);
          setStage(nextStage);
        },
      });

      setStatus('success');
      setMessage(`Saved ${fileName}`);
    } catch {
      setStatus('error');
      setMessage('The report could not be generated. Please try again.');
    } finally {
      busyRef.current = false;
    }
  }, [result]);

  const generating = status === 'generating';

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={generating}
        aria-busy={generating}
        data-testid={TESTIDS.downloadReport}
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
        {generating ? 'Generating…' : 'Download Report'}
      </button>

      <div aria-live="polite" className="min-h-[1.25rem] text-right">
        {generating ? (
          <div className="w-full sm:w-64" data-testid={TESTIDS.downloadReportProgress}>
            <div className="h-1 w-full overflow-hidden rounded-full bg-hairline">
              <div
                className="h-full bg-accent transition-[width] duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-1 font-mono text-[11px] text-ink-secondary">{STAGE_LABEL[stage]}</p>
          </div>
        ) : null}

        {status === 'success' ? (
          <p
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-accent"
            data-testid={TESTIDS.downloadReportSuccess}
          >
            <CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" />
            {message}
          </p>
        ) : null}

        {status === 'error' ? (
          <p
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-risk-strong"
            data-testid={TESTIDS.downloadReportError}
          >
            <AlertCircle size={13} strokeWidth={2} aria-hidden="true" />
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

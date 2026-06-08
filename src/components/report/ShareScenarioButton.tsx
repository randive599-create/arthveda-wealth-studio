/**
 * Share Scenario button.
 *
 * Builds a compact, self-contained shareable URL for the current scenario
 * (via the store's `getShareableUrl`, which uses the lz-string codec) and copies
 * it to the clipboard. A transient toast confirms success or reports failure.
 * The whole scenario lives in the URL, so no backend or persistence is needed.
 *
 * Clipboard access can be unavailable (insecure context, permissions); in that
 * case the URL is surfaced via a prompt fallback so sharing still works.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { useStudioStore } from '../../state/useStudioStore';
import { TESTIDS } from '../../lib/testids';

type ShareState = 'idle' | 'copied' | 'error';

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the prompt fallback below.
  }
  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    window.prompt('Copy this link to share your scenario:', text);
    return true;
  }
  return false;
}

export function ShareScenarioButton() {
  const [state, setState] = useState<ShareState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const flash = useCallback((next: ShareState) => {
    setState(next);
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setState('idle'), 2400);
  }, []);

  const handleShare = useCallback(async () => {
    // Read the freshest URL (flush any pending debounced sync first).
    useStudioStore.getState().flushRecompute();
    const url = useStudioStore.getState().getShareableUrl();
    const ok = await copyToClipboard(url);
    flash(ok ? 'copied' : 'error');
  }, [flash]);

  const label =
    state === 'copied' ? 'Link copied' : state === 'error' ? 'Copy failed' : 'Share Scenario';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        data-testid={TESTIDS.shareScenario}
        className="
          inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] border border-hairline
          bg-canvas px-4 py-2.5 text-sm font-semibold text-ink transition-colors
          hover:border-accent hover:text-accent
        "
      >
        {state === 'copied' ? (
          <Check size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Link2 size={16} strokeWidth={2} aria-hidden="true" />
        )}
        Share Scenario
      </button>

      <span aria-live="polite" className="sr-only">
        {state === 'copied' ? 'Shareable link copied to clipboard' : ''}
      </span>

      {state !== 'idle' ? (
        <span
          data-testid={TESTIDS.toast}
          role="status"
          className={`
            absolute right-0 top-full z-40 mt-2 whitespace-nowrap rounded-[var(--radius-control)]
            border px-3 py-1.5 font-mono text-[11px] shadow-none
            ${
              state === 'copied'
                ? 'border-accent bg-accent-wash text-accent'
                : 'border-risk bg-canvas text-risk-strong'
            }
          `}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

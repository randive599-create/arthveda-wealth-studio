/**
 * Application error boundary.
 *
 * Catches render-time exceptions anywhere in the studio tree and presents a
 * calm, institutional fallback with a recovery action, rather than a blank
 * screen. The projection engine and store are defensively clamped, so a crash
 * here is unlikely — but a top-level boundary is required for production
 * resilience and graceful degradation.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { TESTIDS } from '../../lib/testids';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { hasError: true, message };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    // Surface to the console for diagnostics; no external telemetry is used.
    console.error('ArthVeda render error:', error, info.componentStack);
  }

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        data-testid={TESTIDS.errorBoundary}
        className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          ArthVeda · Private Office
        </p>
        <h1 className="mt-4 font-heading text-3xl font-bold text-ink">Something went wrong</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-secondary">
          The projection studio encountered an unexpected error. Your inputs are stored in the page
          address, so reloading will restore your scenario.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="mt-6 rounded-[var(--radius-control)] border border-accent bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Reload the studio
        </button>
      </div>
    );
  }
}

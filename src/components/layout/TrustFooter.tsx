/**
 * Footer disclaimer, present on every screen. Reiterates the illustrative,
 * non-advisory nature of the projections.
 */

import { TESTIDS } from '../../lib/testids';

export function TrustFooter() {
  return (
    <footer className="border-t border-hairline bg-mist" data-testid={TESTIDS.trustFooter}>
      <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8">
        <p className="font-heading text-base font-bold text-ink">ArthVeda · Private Office</p>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-ink-secondary">
          This projection is illustrative and provided for long-term financial planning purposes
          only. It is not investment advice, a recommendation, or a guarantee of future results.
          Figures assume constant rates and monthly compounding and will differ from actual market
          outcomes.
        </p>
      </div>
    </footer>
  );
}

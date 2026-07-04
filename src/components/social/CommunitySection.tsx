/**
 * "Join the ArthVeda Community" — a premium social CTA shown near the bottom of
 * the homepage, before the footer. Built from the shared Card primitive and the
 * InstagramButton, using only existing design tokens with a restrained gold
 * accent. Static content only — no layout shift.
 */

import { Instagram } from 'lucide-react';
import { Card } from '../primitives/Card';
import { InstagramButton } from './InstagramButton';
import { SOCIAL_DISPLAY_NAME } from '../../lib/social';
import { TESTIDS } from '../../lib/testids';

export function CommunitySection() {
  return (
    <Card
      className="p-6 sm:p-8"
      data-testid={TESTIDS.communitySection}
      aria-labelledby="community-heading"
    >
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span
              className="
                flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)]
                bg-gold-wash text-gold
              "
            >
              <Instagram size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
              Community
            </p>
          </div>
          <h2
            id="community-heading"
            className="mt-4 font-heading text-2xl font-bold leading-tight text-ink sm:text-3xl"
          >
            Join the ArthVeda Community
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-secondary sm:text-base">
            Follow {SOCIAL_DISPLAY_NAME} on Instagram for practical investing knowledge,
            wealth-building ideas, calculator tips, market insights, and financial education
            designed for Indian investors.
          </p>
        </div>
        <div className="shrink-0">
          <InstagramButton variant="solid" testId={TESTIDS.communityInstagram} />
        </div>
      </div>
    </Card>
  );
}

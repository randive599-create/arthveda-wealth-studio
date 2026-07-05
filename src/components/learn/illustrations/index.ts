/**
 * Registry mapping a serializable illustration `name` (stored in article data)
 * to its React component. Article content stays data-only (just a string name),
 * while the actual SVG lives here — keeping the content model dependency-free
 * and the prerender server-safe.
 */

import type { ComponentType } from 'react';
import type { LearnIllustrationName } from '../../../pages/learn/learnContent';
import { SipFlowDiagram, type IllustrationProps } from './SipFlowDiagram';
import { CompoundingTimeline } from './CompoundingTimeline';
import { RupeeCostAveraging } from './RupeeCostAveraging';

export type { IllustrationProps };

export const LEARN_ILLUSTRATIONS: Record<LearnIllustrationName, ComponentType<IllustrationProps>> = {
  'sip-flow': SipFlowDiagram,
  'compounding-timeline': CompoundingTimeline,
  'rupee-cost-averaging': RupeeCostAveraging,
};

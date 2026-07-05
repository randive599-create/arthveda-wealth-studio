/**
 * /learn — the Learn section homepage (client route).
 *
 * Reuses the shared AppShell (full-width variant, no hero) and the standard SEO
 * head: title, description, canonical, Open Graph/Twitter, plus CollectionPage
 * and BreadcrumbList JSON-LD. A prerendered static version is emitted at build
 * time via the same architecture as the calculator/informational pages.
 */

import { AppShell } from '../../components/layout/AppShell';
import { useSeoHead } from '../shared/useSeoHead';
import { LearnHome } from './LearnHome';
import { LEARN_META, buildLearnBreadcrumbJsonLd, buildLearnCollectionJsonLd } from './learnContent';

export function LearnHomePage() {
  useSeoHead({
    meta: LEARN_META,
    extraJsonLd: [
      { key: 'learn-collection', build: buildLearnCollectionJsonLd },
      { key: 'learn-breadcrumb', build: buildLearnBreadcrumbJsonLd },
    ],
  });

  return (
    <AppShell
      variant="full"
      showHero={false}
      studio={<LearnHome />}
    />
  );
}

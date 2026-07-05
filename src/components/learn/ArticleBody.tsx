/**
 * Article body renderer.
 *
 * Renders an article's structured sections and content blocks into semantic
 * HTML. Each section carries an `id` used as the Table of Contents anchor
 * target. The reading column is capped to a comfortable measure for legibility.
 * Purely presentational — no client JavaScript.
 */

import type { ArticleBlock, ArticleSection } from '../../pages/learn/learnContent';

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-sm leading-relaxed text-ink-secondary sm:text-base">{block.text}</p>;
    case 'list':
      return (
        <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-ink-secondary sm:text-base">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <p className="rounded-[var(--radius-control)] border-l-2 border-accent bg-mist px-4 py-3 text-sm leading-relaxed text-ink">
          {block.text}
        </p>
      );
    default:
      return null;
  }
}

export interface ArticleBodyProps {
  sections: ArticleSection[];
}

export function ArticleBody({ sections }: ArticleBodyProps) {
  return (
    <div className="max-w-[68ch] space-y-10" data-testid="article-body">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
          <h2 className="font-heading text-2xl font-bold leading-tight text-ink sm:text-3xl">
            {section.heading}
          </h2>
          {section.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}

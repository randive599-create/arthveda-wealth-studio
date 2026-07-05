/**
 * Article body renderer.
 *
 * Renders an article's structured sections and content blocks into semantic
 * HTML. Each section carries an `id` used as the Table of Contents anchor
 * target. The reading column is capped to a comfortable measure for legibility.
 * Purely presentational — no client JavaScript.
 */

import { ArrowRight } from 'lucide-react';
import type { ArticleBlock, ArticleSection } from '../../pages/learn/learnContent';
import { CALCULATORS } from '../../lib/calculators';
import { LEARN_ILLUSTRATIONS } from './illustrations';

/**
 * A contextual call-to-action — a real internal link.
 *
 * Points either to a calculator (`calculatorPath`, whose path/label come from
 * the shared CALCULATORS registry) or to any other internal ArthVeda page
 * (`href` + `label`, e.g. the methodology or trust pages). Never a raw Markdown
 * link, so routing, styling and crawlable internal linking stay consistent.
 */
function CtaBlock({
  text,
  calculatorPath,
  href,
  label,
}: {
  text: string;
  calculatorPath?: string;
  href?: string;
  label?: string;
}) {
  const calc = calculatorPath ? CALCULATORS.find((c) => c.path === calculatorPath) : undefined;
  const targetPath = calc?.path ?? href;
  const linkLabel = label ?? (calc ? `Open the ${calc.label}` : undefined);

  if (!targetPath || !linkLabel) {
    // Missing/unknown target — fall back to plain text so a CTA never renders a dead link.
    return <p className="text-sm leading-relaxed text-ink-secondary sm:text-base">{text}</p>;
  }
  return (
    <div className="rounded-[var(--radius-control)] border border-hairline bg-mist p-5">
      <p className="text-sm leading-relaxed text-ink sm:text-base">{text}</p>
      <a
        href={targetPath}
        className="
          mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em]
          text-accent underline-offset-2 hover:underline
        "
      >
        {linkLabel}
        <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
      </a>
    </div>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-sm leading-relaxed text-ink-secondary sm:text-base">{block.text}</p>;
    case 'subheading':
      return (
        <h3 className="pt-2 font-heading text-xl font-bold leading-snug text-ink sm:text-2xl">
          {block.text}
        </h3>
      );
    case 'list': {
      const items = block.items.map((item, index) => <li key={index}>{item}</li>);
      const listClass =
        'ml-5 space-y-2 text-sm leading-relaxed text-ink-secondary sm:text-base';
      return block.ordered ? (
        <ol className={`${listClass} list-decimal`}>{items}</ol>
      ) : (
        <ul className={`${listClass} list-disc`}>{items}</ul>
      );
    }
    case 'callout':
      return (
        <p className="rounded-[var(--radius-control)] border-l-2 border-accent bg-mist px-4 py-3 text-sm leading-relaxed text-ink">
          {block.text}
        </p>
      );
    case 'table':
      return (
        <figure className="my-2">
          <div className="overflow-x-auto rounded-[var(--radius-control)] border border-hairline">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-hairline bg-mist">
                  {block.headers.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-hairline last:border-0">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 align-top text-ink-secondary">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption ? (
            <figcaption className="mt-2 text-xs leading-relaxed text-ink-secondary">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case 'cta':
      return (
        <CtaBlock
          text={block.text}
          calculatorPath={block.calculatorPath}
          href={block.href}
          label={block.label}
        />
      );
    case 'illustration': {
      const Illustration = LEARN_ILLUSTRATIONS[block.name];
      if (!Illustration) {
        return null;
      }
      return (
        <figure className="my-2 rounded-[var(--radius-control)] border border-hairline bg-mist px-4 py-6">
          <Illustration />
          {block.caption ? (
            <figcaption className="mt-4 text-center text-xs leading-relaxed text-ink-secondary">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }
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

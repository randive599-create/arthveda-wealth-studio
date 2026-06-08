import { describe, expect, it } from 'vitest';
import { buildFaqJsonLd } from '../faqSchema';
import { FAQ_ENTRIES } from '../faqData';

describe('FAQ content', () => {
  it('provides 15–20 high-quality entries', () => {
    expect(FAQ_ENTRIES.length).toBeGreaterThanOrEqual(15);
    expect(FAQ_ENTRIES.length).toBeLessThanOrEqual(20);
  });

  it('has non-empty, unique questions with substantive answers', () => {
    const seen = new Set<string>();
    for (const entry of FAQ_ENTRIES) {
      expect(entry.question.trim().length).toBeGreaterThan(0);
      expect(entry.answer.trim().length).toBeGreaterThan(40);
      expect(seen.has(entry.question)).toBe(false);
      seen.add(entry.question);
    }
  });

  it('covers the required wealth-planning topics', () => {
    const corpus = FAQ_ENTRIES.map((e) => `${e.question} ${e.answer}`)
      .join(' ')
      .toLowerCase();
    for (const topic of ['sip', 'lumpsum', 'swp', 'inflation', 'retirement', 'currenc']) {
      expect(corpus).toContain(topic);
    }
  });
});

describe('buildFaqJsonLd', () => {
  it('serializes a valid FAQPage with one Q/A per entry', () => {
    const parsed = JSON.parse(buildFaqJsonLd()) as {
      '@type': string;
      mainEntity: { '@type': string; name: string; acceptedAnswer: { text: string } }[];
    };
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity).toHaveLength(FAQ_ENTRIES.length);
    expect(parsed.mainEntity[0]['@type']).toBe('Question');
    expect(parsed.mainEntity[0].acceptedAnswer.text.length).toBeGreaterThan(0);
  });
});

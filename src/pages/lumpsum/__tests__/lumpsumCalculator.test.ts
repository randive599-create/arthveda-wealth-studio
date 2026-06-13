import { describe, expect, it } from 'vitest';
import { LUMPSUM_CALCULATOR_PRESET } from '../../../state/defaults';
import { clampInputs } from '../../../state/schema';
import {
  LUMPSUM_FAQ,
  LUMPSUM_INTERNAL_LINKS,
  LUMPSUM_META,
  buildLumpsumExampleRows,
  buildLumpsumFaqJsonLd,
} from '../lumpsumContent';

describe('Lumpsum calculator preset', () => {
  it('uses a one-time investment scenario with no SIP', () => {
    expect(LUMPSUM_CALCULATOR_PRESET.mode).toBe('accumulation');
    expect(LUMPSUM_CALCULATOR_PRESET.lumpsum).toBe(1_000_000);
    expect(LUMPSUM_CALCULATOR_PRESET.monthlySip).toBe(0);
    expect(LUMPSUM_CALCULATOR_PRESET.durationYears).toBe(20);
  });

  it('is valid against the input schema (clamping is a no-op)', () => {
    const clamped = clampInputs(LUMPSUM_CALCULATOR_PRESET, LUMPSUM_CALCULATOR_PRESET);
    expect(clamped).toEqual(LUMPSUM_CALCULATOR_PRESET);
  });
});

describe('Lumpsum page metadata', () => {
  it('exposes the required SEO title, description and canonical', () => {
    expect(LUMPSUM_META.title).toContain('Lumpsum Calculator');
    expect(LUMPSUM_META.description.length).toBeGreaterThan(0);
    expect(LUMPSUM_META.canonical).toBe('https://arthvedawealth.in/lumpsum-calculator');
  });
});

describe('Lumpsum FAQ', () => {
  it('has exactly 10 entries with non-empty questions and answers', () => {
    expect(LUMPSUM_FAQ).toHaveLength(10);
    for (const entry of LUMPSUM_FAQ) {
      expect(entry.question.trim().length).toBeGreaterThan(0);
      expect(entry.answer.trim().length).toBeGreaterThan(0);
    }
  });

  it('produces valid FAQPage JSON-LD with 10 questions', () => {
    const parsed = JSON.parse(buildLumpsumFaqJsonLd());
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity).toHaveLength(10);
    for (const q of parsed.mainEntity) {
      expect(q['@type']).toBe('Question');
      expect(q.acceptedAnswer['@type']).toBe('Answer');
      expect(typeof q.name).toBe('string');
      expect(typeof q.acceptedAnswer.text).toBe('string');
    }
  });
});

describe('Lumpsum internal links', () => {
  it('links to the four other calculators', () => {
    const hrefs = LUMPSUM_INTERNAL_LINKS.map((l) => l.href);
    expect(hrefs).toEqual([
      '/sip-calculator',
      '/retirement-calculator',
      '/swp-calculator',
      '/fire-calculator',
    ]);
  });
});

describe('Lumpsum example table (engine-computed)', () => {
  it('returns rows for years 5, 10, 15, 20 with formatted INR figures', () => {
    const rows = buildLumpsumExampleRows();
    expect(rows.map((r) => r.year)).toEqual([5, 10, 15, 20]);
    for (const row of rows) {
      expect(row.invested).toContain('₹');
      expect(row.corpus).toContain('₹');
      expect(row.returns).toContain('₹');
    }
  });
});

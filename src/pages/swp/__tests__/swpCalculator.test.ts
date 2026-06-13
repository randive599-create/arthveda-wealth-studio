import { describe, expect, it } from 'vitest';
import { SWP_CALCULATOR_PRESET } from '../../../state/defaults';
import { clampInputs } from '../../../state/schema';
import {
  SWP_FAQ,
  SWP_INTERNAL_LINKS,
  SWP_META,
  buildSwpExampleRows,
  buildSwpFaqJsonLd,
} from '../swpContent';

describe('SWP calculator preset', () => {
  it('uses a pure withdrawal scenario from an existing corpus', () => {
    expect(SWP_CALCULATOR_PRESET.mode).toBe('income');
    expect(SWP_CALCULATOR_PRESET.lumpsum).toBe(10_000_000);
    expect(SWP_CALCULATOR_PRESET.monthlySip).toBe(0);
    expect(SWP_CALCULATOR_PRESET.sipStopYear).toBe(1);
    expect(SWP_CALCULATOR_PRESET.withdrawalStartYear).toBe(1);
    expect(SWP_CALCULATOR_PRESET.monthlySwp).toBe(50_000);
    expect(SWP_CALCULATOR_PRESET.durationYears).toBe(25);
  });

  it('is valid against the input schema (clamping is a no-op)', () => {
    const clamped = clampInputs(SWP_CALCULATOR_PRESET, SWP_CALCULATOR_PRESET);
    expect(clamped).toEqual(SWP_CALCULATOR_PRESET);
  });
});

describe('SWP page metadata', () => {
  it('exposes the required SEO title, description and canonical', () => {
    expect(SWP_META.title).toContain('SWP Calculator');
    expect(SWP_META.description.length).toBeGreaterThan(0);
    expect(SWP_META.canonical).toBe('https://arthvedawealth.in/swp-calculator');
  });
});

describe('SWP FAQ', () => {
  it('has exactly 10 entries with non-empty questions and answers', () => {
    expect(SWP_FAQ).toHaveLength(10);
    for (const entry of SWP_FAQ) {
      expect(entry.question.trim().length).toBeGreaterThan(0);
      expect(entry.answer.trim().length).toBeGreaterThan(0);
    }
  });

  it('produces valid FAQPage JSON-LD with 10 questions', () => {
    const parsed = JSON.parse(buildSwpFaqJsonLd());
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

describe('SWP internal links', () => {
  it('links to the four other calculators', () => {
    const hrefs = SWP_INTERNAL_LINKS.map((l) => l.href);
    expect(hrefs).toEqual([
      '/sip-calculator',
      '/retirement-calculator',
      '/lumpsum-calculator',
      '/fire-calculator',
    ]);
  });
});

describe('SWP example table (engine-computed)', () => {
  it('returns withdrawal rows for years 5, 10, 15, 25 with formatted INR figures', () => {
    const rows = buildSwpExampleRows();
    expect(rows.map((r) => r.year)).toEqual([5, 10, 15, 25]);
    for (const row of rows) {
      expect(row.withdrawal).toContain('₹');
      expect(row.corpus).toContain('₹');
      expect(row.totalWithdrawn).toContain('₹');
    }
  });
});

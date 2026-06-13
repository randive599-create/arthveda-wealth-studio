import { describe, expect, it } from 'vitest';
import { RETIREMENT_CALCULATOR_PRESET } from '../../../state/defaults';
import { clampInputs } from '../../../state/schema';
import {
  RETIREMENT_FAQ,
  RETIREMENT_INTERNAL_LINKS,
  RETIREMENT_META,
  buildRetirementExampleRows,
  buildRetirementFaqJsonLd,
} from '../retirementContent';

describe('Retirement calculator preset', () => {
  it('uses a full accumulation + income retirement scenario', () => {
    expect(RETIREMENT_CALCULATOR_PRESET.mode).toBe('income');
    expect(RETIREMENT_CALCULATOR_PRESET.monthlySip).toBe(30_000);
    expect(RETIREMENT_CALCULATOR_PRESET.durationYears).toBe(40);
    expect(RETIREMENT_CALCULATOR_PRESET.sipStopYear).toBe(30);
    expect(RETIREMENT_CALCULATOR_PRESET.withdrawalStartYear).toBe(30);
    expect(RETIREMENT_CALCULATOR_PRESET.monthlySwp).toBe(150_000);
  });

  it('is valid against the input schema (clamping is a no-op)', () => {
    const clamped = clampInputs(RETIREMENT_CALCULATOR_PRESET, RETIREMENT_CALCULATOR_PRESET);
    expect(clamped).toEqual(RETIREMENT_CALCULATOR_PRESET);
  });
});

describe('Retirement page metadata', () => {
  it('exposes the required SEO title, description and canonical', () => {
    expect(RETIREMENT_META.title).toContain('Retirement Calculator');
    expect(RETIREMENT_META.description.length).toBeGreaterThan(0);
    expect(RETIREMENT_META.canonical).toBe('https://arthvedawealth.in/retirement-calculator');
  });
});

describe('Retirement FAQ', () => {
  it('has exactly 10 entries with non-empty questions and answers', () => {
    expect(RETIREMENT_FAQ).toHaveLength(10);
    for (const entry of RETIREMENT_FAQ) {
      expect(entry.question.trim().length).toBeGreaterThan(0);
      expect(entry.answer.trim().length).toBeGreaterThan(0);
    }
  });

  it('produces valid FAQPage JSON-LD with 10 questions', () => {
    const parsed = JSON.parse(buildRetirementFaqJsonLd());
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

describe('Retirement internal links', () => {
  it('links to the four other calculators', () => {
    const hrefs = RETIREMENT_INTERNAL_LINKS.map((l) => l.href);
    expect(hrefs).toEqual([
      '/sip-calculator',
      '/swp-calculator',
      '/lumpsum-calculator',
      '/fire-calculator',
    ]);
  });
});

describe('Retirement example table (engine-computed)', () => {
  it('returns rows for years 10, 20, 30, 40 with formatted INR figures', () => {
    const rows = buildRetirementExampleRows();
    expect(rows.map((r) => r.year)).toEqual([10, 20, 30, 40]);
    for (const row of rows) {
      expect(row.invested).toContain('₹');
      expect(row.corpus).toContain('₹');
      expect(row.returns).toContain('₹');
    }
  });
});

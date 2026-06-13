import { describe, expect, it } from 'vitest';
import { FIRE_CALCULATOR_PRESET } from '../../../state/defaults';
import { clampInputs } from '../../../state/schema';
import {
  FIRE_FAQ,
  FIRE_INTERNAL_LINKS,
  FIRE_META,
  buildFireExampleRows,
  buildFireFaqJsonLd,
} from '../fireContent';

describe('FIRE calculator preset', () => {
  it('uses an aggressive accumulation scenario with step-up', () => {
    expect(FIRE_CALCULATOR_PRESET.mode).toBe('accumulation');
    expect(FIRE_CALCULATOR_PRESET.lumpsum).toBe(500_000);
    expect(FIRE_CALCULATOR_PRESET.monthlySip).toBe(50_000);
    expect(FIRE_CALCULATOR_PRESET.sipStepUp.percentage).toBe(10);
    expect(FIRE_CALCULATOR_PRESET.durationYears).toBe(20);
  });

  it('is valid against the input schema (clamping is a no-op)', () => {
    const clamped = clampInputs(FIRE_CALCULATOR_PRESET, FIRE_CALCULATOR_PRESET);
    expect(clamped).toEqual(FIRE_CALCULATOR_PRESET);
  });
});

describe('FIRE page metadata', () => {
  it('exposes the required SEO title, description and canonical', () => {
    expect(FIRE_META.title).toContain('FIRE Calculator');
    expect(FIRE_META.description.length).toBeGreaterThan(0);
    expect(FIRE_META.canonical).toBe('https://arthvedawealth.in/fire-calculator');
  });
});

describe('FIRE FAQ', () => {
  it('has exactly 10 entries with non-empty questions and answers', () => {
    expect(FIRE_FAQ).toHaveLength(10);
    for (const entry of FIRE_FAQ) {
      expect(entry.question.trim().length).toBeGreaterThan(0);
      expect(entry.answer.trim().length).toBeGreaterThan(0);
    }
  });

  it('produces valid FAQPage JSON-LD with 10 questions', () => {
    const parsed = JSON.parse(buildFireFaqJsonLd());
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

describe('FIRE internal links', () => {
  it('links to the four other calculators', () => {
    const hrefs = FIRE_INTERNAL_LINKS.map((l) => l.href);
    expect(hrefs).toEqual([
      '/sip-calculator',
      '/retirement-calculator',
      '/swp-calculator',
      '/lumpsum-calculator',
    ]);
  });
});

describe('FIRE example table (engine-computed)', () => {
  it('returns rows for years 5, 10, 15, 20 with formatted INR figures', () => {
    const rows = buildFireExampleRows();
    expect(rows.map((r) => r.year)).toEqual([5, 10, 15, 20]);
    for (const row of rows) {
      expect(row.invested).toContain('₹');
      expect(row.corpus).toContain('₹');
      expect(row.returns).toContain('₹');
    }
  });
});

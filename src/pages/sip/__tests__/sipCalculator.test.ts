import { describe, expect, it } from 'vitest';
import { SIP_CALCULATOR_PRESET } from '../../../state/defaults';
import { clampInputs } from '../../../state/schema';
import {
  SIP_FAQ,
  SIP_INTERNAL_LINKS,
  SIP_META,
  buildSipExampleRows,
  buildSipFaqJsonLd,
} from '../sipContent';

describe('SIP calculator preset', () => {
  it('uses the required SIP-friendly defaults', () => {
    expect(SIP_CALCULATOR_PRESET.lumpsum).toBe(0);
    expect(SIP_CALCULATOR_PRESET.monthlySip).toBe(10_000);
    expect(SIP_CALCULATOR_PRESET.sipStepUp.method).toBe('percentage');
    expect(SIP_CALCULATOR_PRESET.sipStepUp.percentage).toBe(10);
    expect(SIP_CALCULATOR_PRESET.durationYears).toBe(20);
    expect(SIP_CALCULATOR_PRESET.mode).toBe('accumulation');
  });

  it('is valid against the input schema (clamping is a no-op)', () => {
    const clamped = clampInputs(SIP_CALCULATOR_PRESET, SIP_CALCULATOR_PRESET);
    expect(clamped).toEqual(SIP_CALCULATOR_PRESET);
  });
});

describe('SIP page metadata', () => {
  it('exposes the required SEO title and description', () => {
    expect(SIP_META.title).toBe(
      'SIP Calculator India – Calculate SIP Returns & Future Wealth | ArthVeda',
    );
    expect(SIP_META.description).toBe(
      "Calculate SIP returns, future wealth, step-up SIP growth, and long-term investment " +
        "projections with ArthVeda's advanced SIP Calculator.",
    );
    expect(SIP_META.canonical).toBe('https://arthvedawealth.in/sip-calculator');
  });
});

describe('SIP FAQ', () => {
  it('has exactly 10 entries with non-empty questions and answers', () => {
    expect(SIP_FAQ).toHaveLength(10);
    for (const entry of SIP_FAQ) {
      expect(entry.question.trim().length).toBeGreaterThan(0);
      expect(entry.answer.trim().length).toBeGreaterThan(0);
    }
  });

  it('produces valid FAQPage JSON-LD with 10 questions', () => {
    const parsed = JSON.parse(buildSipFaqJsonLd());
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

describe('SIP internal links', () => {
  it('links to the four other calculators', () => {
    const hrefs = SIP_INTERNAL_LINKS.map((l) => l.href);
    expect(hrefs).toEqual([
      '/retirement-calculator',
      '/swp-calculator',
      '/lumpsum-calculator',
      '/fire-calculator',
    ]);
  });
});

describe('SIP example table (engine-computed)', () => {
  it('returns rows for years 5, 10, 15, 20 with formatted INR figures', () => {
    const rows = buildSipExampleRows();
    expect(rows.map((r) => r.year)).toEqual([5, 10, 15, 20]);
    for (const row of rows) {
      // Rupee-formatted strings produced by the shared currency formatter.
      expect(row.invested).toContain('₹');
      expect(row.corpus).toContain('₹');
      expect(row.returns).toContain('₹');
    }
  });
});

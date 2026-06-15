import { describe, expect, it } from 'vitest';
import {
  ABOUT_DISCLAIMERS,
  ABOUT_META,
  ABOUT_OFFERINGS,
  buildAboutOrganizationJsonLd,
} from '../aboutContent';

describe('About page metadata', () => {
  it('exposes the required SEO title, description and canonical', () => {
    expect(ABOUT_META.title).toBe(
      'About ArthVeda | Wealth Planning & Financial Projection Platform',
    );
    expect(ABOUT_META.description.length).toBeGreaterThan(0);
    expect(ABOUT_META.canonical).toBe('https://arthvedawealth.in/about-us');
  });
});

describe('About Organization JSON-LD', () => {
  it('is valid Organization schema with name, url and email', () => {
    const parsed = JSON.parse(buildAboutOrganizationJsonLd());
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('Organization');
    expect(parsed.name).toBe('ArthVeda');
    expect(parsed.url).toBe('https://arthvedawealth.in');
    expect(parsed.email).toBe('info@arthvedawealth.in');
  });
});

describe('About offerings (internal links)', () => {
  it('links to the studio (home) plus all six calculators', () => {
    const hrefs = ABOUT_OFFERINGS.map((o) => o.href);
    expect(hrefs).toEqual([
      '/',
      '/sip-calculator',
      '/retirement-calculator',
      '/swp-calculator',
      '/lumpsum-calculator',
      '/fire-calculator',
      '/sip-vs-stepup-sip-calculator',
    ]);
  });
});

describe('About disclaimers', () => {
  it('lists the six things ArthVeda does not provide', () => {
    expect(ABOUT_DISCLAIMERS).toEqual([
      'Investment advice',
      'Stock recommendations',
      'Mutual fund recommendations',
      'Portfolio management',
      'Tax advice',
      'Legal advice',
    ]);
  });
});

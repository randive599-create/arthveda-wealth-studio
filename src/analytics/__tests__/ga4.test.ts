import { describe, expect, it } from 'vitest';
import { createGa4, isValidMeasurementId } from '../ga4';

/**
 * GA4 is exercised against an injected fake window/document so its behaviour is
 * verified deterministically — no real browser, no real Google endpoint.
 */
function fakeScope(opts: { doNotTrack?: string | null; gpc?: boolean } = {}) {
  const scripts: Array<Record<string, unknown>> = [];
  const head = { appendChild: (el: unknown) => scripts.push(el as Record<string, unknown>) };
  const win = {
    dataLayer: undefined as unknown[] | undefined,
    gtag: undefined as ((...a: unknown[]) => void) | undefined,
    doNotTrack: opts.doNotTrack ?? null,
    navigator: { doNotTrack: null as string | null, globalPrivacyControl: opts.gpc ?? false },
  };
  const doc = {
    createElement: (_tag: 'script') => {
      const el: Record<string, unknown> = {
        async: false,
        src: '',
        setAttribute(name: string, value: string) {
          el[name] = value;
        },
      };
      return el as unknown as { async: boolean; src: string; setAttribute(n: string, v: string): void };
    },
    querySelector: () => (scripts.length > 0 ? (scripts[0] as unknown) : null),
    head,
    body: head,
  };
  return { win, doc, scripts };
}

const ID = 'G-ABC1234XYZ';

function cmd(dataLayer: unknown[] | undefined, kind: string): unknown[] | undefined {
  return (dataLayer ?? []).find((entry) => Array.isArray(entry) && entry[0] === kind) as
    | unknown[]
    | undefined;
}

describe('isValidMeasurementId', () => {
  it('accepts well-formed GA4 ids and rejects everything else', () => {
    expect(isValidMeasurementId('G-ABC1234XYZ')).toBe(true);
    expect(isValidMeasurementId('G-12345')).toBe(true);
    expect(isValidMeasurementId(undefined)).toBe(false);
    expect(isValidMeasurementId('')).toBe(false);
    expect(isValidMeasurementId('UA-123456-1')).toBe(false);
    expect(isValidMeasurementId('G-AB')).toBe(false); // too short
    expect(isValidMeasurementId('GTM-XXXX')).toBe(false);
  });
});

describe('createGa4 — no tracking until configured', () => {
  it('is a disabled no-op when no Measurement ID is provided', () => {
    const { doc, win, scripts } = fakeScope();
    const ga = createGa4({ window: win, document: doc });
    expect(ga.enabled).toBe(false);
    expect(ga.measurementId).toBeUndefined();
    expect(scripts).toHaveLength(0);
    expect(win.dataLayer).toBeUndefined();
    // Calling the API does nothing and never throws.
    ga.trackEvent('x');
    ga.setConsent(true);
    expect(win.dataLayer).toBeUndefined();
  });

  it('is a disabled no-op for an invalid Measurement ID', () => {
    const { doc, win, scripts } = fakeScope();
    const ga = createGa4({ measurementId: 'UA-123', window: win, document: doc });
    expect(ga.enabled).toBe(false);
    expect(scripts).toHaveLength(0);
  });
});

describe('createGa4 — GDPR-friendly initialisation', () => {
  it('injects gtag.js once and denies storage by default (Consent Mode v2)', () => {
    const { doc, win, scripts } = fakeScope();
    const ga = createGa4({ measurementId: ID, window: win, document: doc });

    expect(ga.enabled).toBe(true);
    expect(ga.measurementId).toBe(ID);

    // Exactly one async script pointing at the official gtag endpoint.
    expect(scripts).toHaveLength(1);
    expect(scripts[0].async).toBe(true);
    expect(scripts[0].src).toBe(`https://www.googletagmanager.com/gtag/js?id=${ID}`);
    expect(scripts[0]['data-ga4']).toBe('arthveda');

    // Consent defaults: analytics + ads denied before anything loads.
    const consent = cmd(win.dataLayer, 'consent');
    expect(consent?.[1]).toBe('default');
    const flags = consent?.[2] as Record<string, string>;
    expect(flags.analytics_storage).toBe('denied');
    expect(flags.ad_storage).toBe('denied');
    expect(flags.ad_user_data).toBe('denied');
    expect(flags.ad_personalization).toBe('denied');

    // Config enables IP anonymisation and disables Google Signals / ad signals.
    const config = cmd(win.dataLayer, 'config');
    expect(config?.[1]).toBe(ID);
    const cfg = config?.[2] as Record<string, unknown>;
    expect(cfg.anonymize_ip).toBe(true);
    expect(cfg.allow_google_signals).toBe(false);
    expect(cfg.allow_ad_personalization_signals).toBe(false);
  });

  it('honours an explicit granted default consent', () => {
    const { doc, win } = fakeScope();
    createGa4({ measurementId: ID, defaultAnalyticsConsent: 'granted', window: win, document: doc });
    const flags = cmd(win.dataLayer, 'consent')?.[2] as Record<string, string>;
    expect(flags.analytics_storage).toBe('granted');
  });

  it('does not initialise when Do-Not-Track or GPC is enabled', () => {
    const dnt = fakeScope({ doNotTrack: '1' });
    expect(createGa4({ measurementId: ID, window: dnt.win, document: dnt.doc }).enabled).toBe(false);
    expect(dnt.scripts).toHaveLength(0);

    const gpc = fakeScope({ gpc: true });
    expect(createGa4({ measurementId: ID, window: gpc.win, document: gpc.doc }).enabled).toBe(false);

    // Unless explicitly told not to respect it.
    const override = fakeScope({ doNotTrack: '1' });
    expect(
      createGa4({
        measurementId: ID,
        respectDoNotTrack: false,
        window: override.win,
        document: override.doc,
      }).enabled,
    ).toBe(true);
  });

  it('does not inject a second script if one already exists', () => {
    const { doc, win, scripts } = fakeScope();
    createGa4({ measurementId: ID, window: win, document: doc });
    createGa4({ measurementId: ID, window: win, document: doc });
    expect(scripts).toHaveLength(1);
  });
});

describe('createGa4 — consent + event API', () => {
  it('pushes a consent update when consent is granted', () => {
    const { doc, win } = fakeScope();
    const ga = createGa4({ measurementId: ID, window: win, document: doc });
    ga.setConsent(true);
    const update = (win.dataLayer ?? []).find(
      (e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'update',
    ) as unknown[] | undefined;
    expect((update?.[2] as Record<string, string>).analytics_storage).toBe('granted');
  });

  it('forwards custom events and page views to the data layer', () => {
    const { doc, win } = fakeScope();
    const ga = createGa4({ measurementId: ID, window: win, document: doc });
    ga.trackEvent('download_report', { format: 'pdf' });
    ga.trackPageView('/studio');

    const events = (win.dataLayer ?? []).filter(
      (e) => Array.isArray(e) && e[0] === 'event',
    ) as unknown[][];
    const download = events.find((e) => e[1] === 'download_report');
    expect((download?.[2] as Record<string, unknown>).format).toBe('pdf');
    const view = events.find((e) => e[1] === 'page_view');
    expect((view?.[2] as Record<string, unknown>).page_path).toBe('/studio');
  });
});

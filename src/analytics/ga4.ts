/**
 * Google Analytics 4 (gtag.js) integration — privacy-first and opt-in by
 * configuration.
 *
 * Design goals:
 *  - **Environment-driven:** the GA4 Measurement ID comes from
 *    `VITE_GA4_MEASUREMENT_ID`. Nothing is loaded or tracked unless a valid ID
 *    is configured, so local development and un-configured deployments stay
 *    completely tracking-free.
 *  - **GDPR-friendly:** Google Consent Mode v2 is initialised with every
 *    storage type denied by default (analytics included). GA then runs in
 *    cookieless "consent pending" mode — no analytics cookies or personal data
 *    are stored until the visitor explicitly grants consent via
 *    {@link Ga4Controller.setConsent}. IP anonymisation is on and Google
 *    Signals / ad-personalisation are disabled. The browser's Do-Not-Track
 *    signal is honoured.
 *  - **Production-ready & testable:** no third-party dependency (the official
 *    gtag snippet is reproduced), no double initialisation, SSR/no-DOM safe,
 *    and the DOM/window are injectable so the behaviour is unit-tested without
 *    a real browser or a real Google endpoint.
 *
 * A future consent banner only needs to call `getAnalytics()?.setConsent(true)`
 * once the user accepts analytics cookies.
 */

/** GA4 Measurement IDs look like `G-XXXXXXXXXX`. */
export const GA4_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,}$/i;

export type ConsentState = 'granted' | 'denied';

/** A minimal, structurally-typed view of the DOM bits we touch (testable). */
interface MinimalScript {
  async: boolean;
  src: string;
  setAttribute(name: string, value: string): void;
}
interface MinimalNode {
  appendChild(child: unknown): unknown;
}
interface MinimalDocument {
  createElement(tag: 'script'): MinimalScript;
  querySelector(selector: string): unknown;
  head: MinimalNode | null;
  body: MinimalNode | null;
}
interface MinimalWindow {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  doNotTrack?: string | null;
  navigator?: { doNotTrack?: string | null; globalPrivacyControl?: boolean };
}

export interface Ga4Options {
  /** Measurement ID. Defaults to `import.meta.env.VITE_GA4_MEASUREMENT_ID`. */
  measurementId?: string | undefined;
  /**
   * Default consent for `analytics_storage`. GDPR-friendly default is
   * `'denied'`; deployments in regions without a consent requirement may pass
   * `'granted'` (or set `VITE_GA4_DEFAULT_CONSENT=granted`).
   */
  defaultAnalyticsConsent?: ConsentState;
  /** Honour the browser Do-Not-Track / Global Privacy Control signal. */
  respectDoNotTrack?: boolean;
  /** Injectable window (defaults to the global `window`). */
  window?: MinimalWindow | undefined;
  /** Injectable document (defaults to the global `document`). */
  document?: MinimalDocument | undefined;
}

/** Controls a (possibly disabled) GA4 instance. */
export interface Ga4Controller {
  /** Whether GA4 was actually initialised (valid ID, DOM present, not DNT). */
  readonly enabled: boolean;
  /** The resolved Measurement ID, or `undefined` when disabled. */
  readonly measurementId: string | undefined;
  /** Update analytics consent (call from a cookie banner). No-op when disabled. */
  setConsent(granted: boolean): void;
  /** Send a custom event. No-op when disabled. */
  trackEvent(name: string, params?: Record<string, unknown>): void;
  /** Send a page_view (useful for SPA route changes). No-op when disabled. */
  trackPageView(path?: string, params?: Record<string, unknown>): void;
}

/** Validate a GA4 Measurement ID. */
export function isValidMeasurementId(id: string | undefined | null): id is string {
  return typeof id === 'string' && GA4_MEASUREMENT_ID_PATTERN.test(id.trim());
}

const DISABLED: Ga4Controller = {
  enabled: false,
  measurementId: undefined,
  setConsent() {},
  trackEvent() {},
  trackPageView() {},
};

function doNotTrackEnabled(win: MinimalWindow): boolean {
  const signal = win.doNotTrack ?? win.navigator?.doNotTrack;
  return signal === '1' || signal === 'yes' || win.navigator?.globalPrivacyControl === true;
}

/**
 * Create a GA4 controller. Returns a disabled (no-op) controller when no valid
 * Measurement ID is configured, when there is no DOM, or when Do-Not-Track is
 * active — guaranteeing zero tracking and zero network/DOM side effects in
 * those cases.
 */
export function createGa4(options: Ga4Options = {}): Ga4Controller {
  const id = options.measurementId?.trim();
  if (!isValidMeasurementId(id)) {
    return DISABLED;
  }

  const win =
    options.window ?? (typeof window !== 'undefined' ? (window as unknown as MinimalWindow) : undefined);
  const doc =
    options.document ??
    (typeof document !== 'undefined' ? (document as unknown as MinimalDocument) : undefined);
  if (!win || !doc) {
    return DISABLED;
  }

  const respectDoNotTrack = options.respectDoNotTrack ?? true;
  if (respectDoNotTrack && doNotTrackEnabled(win)) {
    return DISABLED;
  }

  const defaultAnalyticsConsent: ConsentState = options.defaultAnalyticsConsent ?? 'denied';

  // The official gtag bootstrap: commands are queued on dataLayer before the
  // remote script loads, so ordering is preserved once it executes.
  const dataLayer: unknown[] = (win.dataLayer = win.dataLayer ?? []);
  const gtag =
    win.gtag ??
    ((...args: unknown[]) => {
      dataLayer.push(args);
    });
  win.gtag = gtag;

  // Consent Mode v2 — deny everything up front (GDPR-friendly). GA runs
  // cookieless until consent is granted.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: defaultAnalyticsConsent,
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  });

  gtag('js', new Date());
  gtag('config', id, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  // Inject the remote gtag.js exactly once.
  if (!doc.querySelector('script[data-ga4="arthveda"]')) {
    const script = doc.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    script.setAttribute('data-ga4', 'arthveda');
    const mount = doc.head ?? doc.body;
    mount?.appendChild(script);
  }

  return {
    enabled: true,
    measurementId: id,
    setConsent(granted: boolean) {
      gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: 'denied',
      });
    },
    trackEvent(name: string, params?: Record<string, unknown>) {
      gtag('event', name, params ?? {});
    },
    trackPageView(path?: string, params?: Record<string, unknown>) {
      gtag('event', 'page_view', {
        ...(path ? { page_path: path } : {}),
        ...params,
      });
    },
  };
}

let singleton: Ga4Controller | null = null;

/**
 * Initialise analytics from environment configuration. Idempotent: repeated
 * calls return the same controller. Safe to call unconditionally at startup —
 * it is a no-op unless `VITE_GA4_MEASUREMENT_ID` is set to a valid ID.
 */
export function initAnalytics(): Ga4Controller {
  if (singleton) {
    return singleton;
  }
  const defaultConsent: ConsentState =
    import.meta.env.VITE_GA4_DEFAULT_CONSENT === 'granted' ? 'granted' : 'denied';
  singleton = createGa4({
    measurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID,
    defaultAnalyticsConsent: defaultConsent,
  });
  return singleton;
}

/** Access the initialised analytics controller, or `null` before init. */
export function getAnalytics(): Ga4Controller | null {
  return singleton;
}

/** Reset the singleton. Intended for tests only. */
export function __resetAnalyticsForTests(): void {
  singleton = null;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Google Analytics 4 Measurement ID (e.g. "G-XXXXXXXXXX"). Analytics is
   * completely disabled — no script, no cookies, no requests — unless this is
   * set to a valid ID.
   */
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  /**
   * Optional default analytics consent: "granted" or "denied". Defaults to
   * "denied" (GDPR-friendly) when unset.
   */
  readonly VITE_GA4_DEFAULT_CONSENT?: 'granted' | 'denied';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

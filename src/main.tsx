/**
 * React entry point. Mounts the studio into #root and loads global styles.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { initAnalytics } from './analytics/ga4';
import './index.css';

// Initialise Google Analytics 4. No-op unless VITE_GA4_MEASUREMENT_ID is set;
// GDPR-friendly (Consent Mode v2 denied by default until consent is granted).
initAnalytics();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Analytics />
    </ErrorBoundary>
  </StrictMode>,
);

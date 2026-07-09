/**
 * Chart capture via html2canvas-pro.
 *
 * Charts are the only part of the report rasterized to an image; all text and
 * tables are drawn with jsPDF's native vector API for crisp output and reliable
 * pagination. html2canvas-pro is used (rather than classic html2canvas) because
 * the studio's Tailwind v4 styles may emit modern color functions that the
 * classic library cannot parse.
 *
 * The capture is isolated here behind a small interface so the PDF renderer can
 * be tested with an injected stub (no real DOM rasterization needed in tests).
 */

import html2canvas from 'html2canvas-pro';

/** A captured chart image plus its natural pixel dimensions. */
export interface CapturedImage {
  /** PNG data URL. */
  dataUrl: string;
  width: number;
  height: number;
}

/** Function that turns a DOM element into a {@link CapturedImage}. */
export type ChartCapturer = (element: HTMLElement) => Promise<CapturedImage>;

// The brand-logo loader lives in ./brandLogo, kept free of the html2canvas
// dependency so the lightweight per-calculator report bundles can import it.
// Re-exported here for the wealth-projection report pipeline (generateReport).
export { loadBrandLogo, type BrandLogoImage } from './brandLogo';

/**
 * Capture a DOM element to a high-resolution PNG. Uses a 2x scale for crisp
 * output on the page and a white background to match the report surface.
 */
export const captureChart: ChartCapturer = async (element) => {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
  });
  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
  };
};

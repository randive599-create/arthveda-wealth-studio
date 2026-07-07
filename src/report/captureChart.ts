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

/**
 * Load the official ArthVeda logo as a {@link CapturedImage} for embedding in
 * the PDF header. Uses the small transparent web derivative (not the 1 MB+
 * master) drawn through a canvas to obtain a PNG data URL. Best-effort: returns
 * `undefined` if the DOM/canvas is unavailable or the image fails to load, so
 * report generation never fails on branding.
 */
export async function loadBrandLogo(
  url = '/brand/arthveda-logo-192.png',
): Promise<CapturedImage | undefined> {
  try {
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
      return undefined;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) {
      return undefined;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }
    ctx.drawImage(img, 0, 0);
    return { dataUrl: canvas.toDataURL('image/png'), width, height };
  } catch {
    return undefined;
  }
}

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

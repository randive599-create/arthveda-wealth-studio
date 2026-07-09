/**
 * Shared PDF branding: loading the official ArthVeda logo and drawing the
 * report letterhead (logo + wordmark + contact + hairline).
 *
 * This module deliberately has NO dependency on html2canvas (unlike
 * captureChart.ts), so the lightweight per-calculator report bundles can import
 * it without pulling in the chart-rasterizer.
 *
 * Two details make the logo render reliably in the PDF:
 *   1. The asset is same-origin, so NO `crossOrigin` is set (it was unnecessary
 *      and made the image/canvas load brittle).
 *   2. The logo is flattened onto white before export, producing an OPAQUE PNG.
 *      jsPDF embeds opaque PNGs reliably (exactly like the opaque chart images);
 *      its alpha/soft-mask path silently dropped the transparent logo, so the
 *      mark never appeared. The PDF page is white, so a white backing looks
 *      identical to the transparent logo.
 */

import { A4, MARGIN } from './pageLayout';
import { REPORT_FONT_MONO, REPORT_FONT_SERIF } from './registerFonts';

const INK = '#111827';
const INK_SECONDARY = '#4b5563';
const ACCENT = '#064e3b';
const HAIRLINE = '#e5e7eb';
const WEBSITE = 'arthvedawealth.in';
const EMAIL = 'info@arthvedawealth.in';
const LOGO_SIZE = 30;

export interface BrandLogoImage {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Load the logo (small web derivative) as an opaque PNG data URL, ready for
 * `jsPDF.addImage`. Best-effort: returns `undefined` if the DOM/canvas is
 * unavailable or the image fails to load, so report generation never fails on
 * branding (the wordmark still carries the header).
 */
export async function loadBrandLogo(
  url = '/brand/arthveda-logo-192.png',
): Promise<BrandLogoImage | undefined> {
  try {
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
      return undefined;
    }
    const img = new Image();
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
    // Flatten onto white so the exported PNG is opaque (see module doc comment).
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);
    return { dataUrl: canvas.toDataURL('image/png'), width, height };
  } catch {
    return undefined;
  }
}

/** Minimal slice of jsPDF used to draw the letterhead. */
interface LetterheadDoc {
  setFont(family: string, style?: string): unknown;
  setFontSize(size: number): unknown;
  setTextColor(color: string): unknown;
  setDrawColor(color: string): unknown;
  setLineWidth(width: number): unknown;
  text(text: string, x: number, y: number, options?: { align?: string }): unknown;
  line(x1: number, y1: number, x2: number, y2: number): unknown;
  addImage(data: string, format: string, x: number, y: number, w: number, h: number): unknown;
}

/**
 * Draw the shared report letterhead at the top of page 1: the official logo and
 * "ArthVeda / WEALTH STUDIO" wordmark on the left, the website + email on the
 * right, and a hairline beneath. When `logo` is undefined the wordmark sits at
 * the left margin exactly as before (graceful fallback).
 */
export function drawReportLetterhead(doc: LetterheadDoc, logo: BrandLogoImage | undefined): void {
  if (logo) {
    doc.addImage(logo.dataUrl, 'PNG', MARGIN.left, MARGIN.top - 8, LOGO_SIZE, LOGO_SIZE);
  }
  const brandX = logo ? MARGIN.left + LOGO_SIZE + 10 : MARGIN.left;

  doc.setFont(REPORT_FONT_SERIF, 'bold');
  doc.setFontSize(15);
  doc.setTextColor(INK);
  doc.text('ArthVeda', brandX, MARGIN.top + 4);
  doc.setFont(REPORT_FONT_MONO, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(ACCENT);
  doc.text('WEALTH STUDIO', brandX, MARGIN.top + 16);

  const rightX = A4.width - MARGIN.right;
  doc.setFontSize(8);
  doc.setTextColor(INK_SECONDARY);
  doc.text(WEBSITE, rightX, MARGIN.top + 4, { align: 'right' });
  doc.text(EMAIL, rightX, MARGIN.top + 16, { align: 'right' });

  doc.setDrawColor(HAIRLINE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN.left, MARGIN.top + 26, rightX, MARGIN.top + 26);
}

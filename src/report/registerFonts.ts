/**
 * Registers the embedded Unicode report fonts with a jsPDF document.
 *
 * jsPDF's built-in fonts (helvetica/courier/times) are WinAnsi-encoded and
 * cannot render the Indian Rupee sign (U+20B9) — it corrupts to a superscript
 * "¹" and forces a byte path that mis-spaces digits. Embedding a TTF that
 * contains the rupee glyph and selecting it makes jsPDF use its UTF-8 text
 * path, so ₹ and all digits render correctly.
 *
 * Two logical families are registered:
 *   - REPORT_FONT_MONO  — IBM Plex Mono (values, labels, body, ledger)
 *   - REPORT_FONT_SERIF — IBM Plex Serif Bold (headings, cover)
 */

import { REPORT_MONO_FONT_BASE64, REPORT_SERIF_FONT_BASE64 } from './fonts/reportFonts';

export const REPORT_FONT_MONO = 'PlexMono';
export const REPORT_FONT_SERIF = 'PlexSerif';

/** The minimal jsPDF surface needed to register a VFS font. */
export interface FontRegistrarDoc {
  addFileToVFS(fileName: string, data: string): unknown;
  addFont(fileName: string, fontName: string, fontStyle: string): unknown;
}

/**
 * Add the embedded fonts to a jsPDF document's virtual file system and register
 * them. Safe to call once per document immediately after construction.
 */
export function registerReportFonts(doc: FontRegistrarDoc): void {
  doc.addFileToVFS('PlexMono.ttf', REPORT_MONO_FONT_BASE64);
  doc.addFont('PlexMono.ttf', REPORT_FONT_MONO, 'normal');
  // The mono subset is a single weight; map "bold" to the same file so callers
  // can request a bold style without a missing-font fallback.
  doc.addFont('PlexMono.ttf', REPORT_FONT_MONO, 'bold');

  doc.addFileToVFS('PlexSerif.ttf', REPORT_SERIF_FONT_BASE64);
  doc.addFont('PlexSerif.ttf', REPORT_FONT_SERIF, 'normal');
  doc.addFont('PlexSerif.ttf', REPORT_FONT_SERIF, 'bold');
}

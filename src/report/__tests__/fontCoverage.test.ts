import { describe, expect, it } from 'vitest';
import { REPORT_MONO_FONT_BASE64, REPORT_SERIF_FONT_BASE64 } from '../fonts/reportFonts';

/**
 * Glyph-coverage guard for the embedded PDF fonts.
 *
 * The header email once truncated to "info" because the embedded subset was
 * missing the '@' glyph — and jsPDF silently drops text from the first
 * unmapped character. That defect was invisible to the string-recording fakes
 * used elsewhere, so this test parses the real TTF `cmap` and asserts every
 * character the report renders maps to a non-zero glyph id. No font library is
 * used (none is a dependency); a compact format-4/format-12 cmap reader does
 * the lookup directly on the embedded bytes.
 */

function decode(base64: string): DataView {
  const bytes = Uint8Array.from(Buffer.from(base64, 'base64'));
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

/** Locate the `cmap` table offset within the sfnt. */
function cmapOffset(dv: DataView): number {
  const numTables = dv.getUint16(4);
  for (let i = 0; i < numTables; i += 1) {
    const rec = 12 + i * 16;
    const tag = String.fromCharCode(
      dv.getUint8(rec),
      dv.getUint8(rec + 1),
      dv.getUint8(rec + 2),
      dv.getUint8(rec + 3),
    );
    if (tag === 'cmap') {
      return dv.getUint32(rec + 8);
    }
  }
  throw new Error('cmap table not found');
}

function lookupFormat4(dv: DataView, sub: number, cp: number): number {
  const segX2 = dv.getUint16(sub + 6);
  const segCount = segX2 / 2;
  const endBase = sub + 14;
  const startBase = endBase + segX2 + 2;
  const deltaBase = startBase + segX2;
  const rangeBase = deltaBase + segX2;
  for (let i = 0; i < segCount; i += 1) {
    const end = dv.getUint16(endBase + i * 2);
    if (cp > end) continue;
    const start = dv.getUint16(startBase + i * 2);
    if (cp < start) return 0;
    const delta = dv.getInt16(deltaBase + i * 2);
    const rangeOffset = dv.getUint16(rangeBase + i * 2);
    if (rangeOffset === 0) {
      return (cp + delta) & 0xffff;
    }
    const glyphAddr = rangeBase + i * 2 + rangeOffset + (cp - start) * 2;
    const gid = dv.getUint16(glyphAddr);
    return gid === 0 ? 0 : (gid + delta) & 0xffff;
  }
  return 0;
}

function lookupFormat12(dv: DataView, sub: number, cp: number): number {
  const nGroups = dv.getUint32(sub + 12);
  for (let g = 0; g < nGroups; g += 1) {
    const rec = sub + 16 + g * 12;
    const start = dv.getUint32(rec);
    const end = dv.getUint32(rec + 4);
    if (cp >= start && cp <= end) {
      return dv.getUint32(rec + 8) + (cp - start);
    }
  }
  return 0;
}

/** Resolve a codepoint to a glyph id across every Unicode cmap subtable. */
function glyphId(dv: DataView, cp: number): number {
  const cmap = cmapOffset(dv);
  const numSub = dv.getUint16(cmap + 2);
  for (let i = 0; i < numSub; i += 1) {
    const rec = cmap + 4 + i * 8;
    const subOffset = cmap + dv.getUint32(rec + 4);
    const format = dv.getUint16(subOffset);
    const gid = format === 4 ? lookupFormat4(dv, subOffset, cp) : format === 12 ? lookupFormat12(dv, subOffset, cp) : 0;
    if (gid !== 0) return gid;
  }
  return 0;
}

// Every character the report can render in the header, footer, body and ledger.
const REQUIRED = Array.from(
  new Set(
    (
      'https://arthvedawealth.in' +
      'info@arthvedawealth.in' +
      'ArthVeda Private Office' +
      'Illustrative projections only. Not investment advice.' +
      'Page of' +
      'abcdefghijklmnopqrstuvwxyz' +
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
      '0123456789' +
      ' .,:;/@_-()%+·–—…₹€$'
    ).split(''),
  ),
);

describe.each([
  ['mono', REPORT_MONO_FONT_BASE64],
  ['serif', REPORT_SERIF_FONT_BASE64],
])('embedded %s font glyph coverage', (_name, base64) => {
  const dv = decode(base64);

  it('maps every report character (including @) to a real glyph', () => {
    const missing = REQUIRED.filter((ch) => glyphId(dv, ch.codePointAt(0)!) === 0);
    expect(missing).toEqual([]);
  });

  it('maps the full contact email so it cannot truncate', () => {
    for (const ch of 'info@arthvedawealth.in') {
      expect(glyphId(dv, ch.codePointAt(0)!)).toBeGreaterThan(0);
    }
    // The '@' specifically — the original truncation point.
    expect(glyphId(dv, 0x40)).toBeGreaterThan(0);
  });

  it('still maps the Indian Rupee sign (₹) for currency values', () => {
    expect(glyphId(dv, 0x20b9)).toBeGreaterThan(0);
  });
});

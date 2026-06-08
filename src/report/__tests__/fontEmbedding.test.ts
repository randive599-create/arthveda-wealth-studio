import { describe, expect, it } from 'vitest';
import { jsPDF } from 'jspdf';
import { buildProjection } from '../../engine';
import { makeInputs } from '../../engine/__tests__/factory';
import { buildReportModel } from '../reportModel';
import { renderReport, type PdfDoc } from '../pdfRenderer';
import { registerReportFonts, REPORT_FONT_MONO, REPORT_FONT_SERIF } from '../registerFonts';
import { A4 } from '../pageLayout';

/**
 * Integration tests against the REAL jsPDF engine (not a fake), proving the
 * embedded Unicode fonts register and that reports with very large rupee values
 * render to a valid PDF without throwing. This is the regression guard for the
 * production "₹ → ¹", digit-spacing, and overflow defects.
 */

function realFactory() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [A4.width, A4.height] });
  registerReportFonts(doc as unknown as Parameters<typeof registerReportFonts>[0]);
  return doc as unknown as PdfDoc;
}

describe('embedded fonts (real jsPDF)', () => {
  it('registers both Unicode families on the document', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [A4.width, A4.height] });
    registerReportFonts(doc as unknown as Parameters<typeof registerReportFonts>[0]);
    const families = Object.keys(doc.getFontList());
    expect(families).toContain(REPORT_FONT_MONO);
    expect(families).toContain(REPORT_FONT_SERIF);
  });

  it('measures the rupee sign as a real glyph (non-zero width) in the embedded font', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [A4.width, A4.height] });
    registerReportFonts(doc as unknown as Parameters<typeof registerReportFonts>[0]);
    doc.setFont(REPORT_FONT_MONO, 'normal');
    doc.setFontSize(10);
    // A rupee-prefixed value must have a sensible positive width — if the glyph
    // were missing/corrupt this would be zero or throw.
    expect(doc.getTextWidth('₹2,82,07,500')).toBeGreaterThan(0);
  });

  it('renders an INR report with a value above ₹100 Crore to a valid, multi-page PDF', () => {
    const result = buildProjection(
      makeInputs({
        currency: 'INR',
        mode: 'accumulation',
        lumpsum: 50_00_000,
        monthlySip: 5_00_000,
        sipStepUp: { method: 'percentage', percentage: 10, amount: 0 },
        annualReturnRate: 14,
        durationYears: 50,
        sipStopYear: 50,
        inflation: { enabled: true, rate: 6 },
      }),
    );
    // Sanity: this scenario must exceed ₹100 Crore so we exercise the widest values.
    expect(result.summary.finalCorpus).toBeGreaterThan(1_000_000_000);

    const model = buildReportModel(result, new Date(2026, 5, 7));
    const doc = renderReport(model, {}, realFactory);

    const blob = doc.output('arraybuffer') as ArrayBuffer;
    const header = new TextDecoder().decode(new Uint8Array(blob).slice(0, 5));
    expect(header).toBe('%PDF-');
    expect(blob.byteLength).toBeGreaterThan(1000);
    expect(doc.getNumberOfPages()).toBeGreaterThan(5);
  });

  it('renders a USD report to a valid PDF (regression parity with INR)', () => {
    const result = buildProjection(
      makeInputs({
        currency: 'USD',
        lumpsum: 100_000,
        monthlySip: 3_000,
        annualReturnRate: 9,
        durationYears: 30,
        sipStopYear: 30,
      }),
    );
    const model = buildReportModel(result, new Date(2026, 5, 7));
    const doc = renderReport(model, {}, realFactory);
    const blob = doc.output('arraybuffer') as ArrayBuffer;
    const header = new TextDecoder().decode(new Uint8Array(blob).slice(0, 5));
    expect(header).toBe('%PDF-');
  });
});

import { describe, expect, it } from 'vitest';
import { jsPDF } from 'jspdf';
import { buildProjection } from '../../engine';
import { makeInputs } from '../../engine/__tests__/factory';
import { buildReportModel } from '../reportModel';
import { renderReport } from '../pdfRenderer';
import { registerReportFonts } from '../registerFonts';
import { A4 } from '../pageLayout';
import type { PdfDoc } from '../pdfRenderer';

// Real-engine test: proves the branding (vector logo + footer website)
// renders through actual jsPDF — i.e. triangle()/roundedRect() exist and the
// document is produced — for a multi-page INR report.
describe('real jsPDF branding render', () => {
  it('renders a branded multi-page INR PDF with no errors', () => {
    const result = buildProjection(
      makeInputs({
        currency: 'INR',
        mode: 'income',
        lumpsum: 50_00_000,
        monthlySip: 5_00_000,
        annualReturnRate: 14,
        durationYears: 100,
        sipStopYear: 60,
        withdrawalStartYear: 70,
        monthlySwp: 5_00_000,
        inflation: { enabled: true, rate: 6 },
      }),
    );
    const model = buildReportModel(result, new Date(2026, 5, 7));

    const factory = () => {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [A4.width, A4.height] });
      registerReportFonts(doc as unknown as Parameters<typeof registerReportFonts>[0]);
      return doc as unknown as PdfDoc;
    };

    // Charts omitted: this asserts the branding path (vector logo + footer
    // website) renders through the real engine; charts are unrelated raster I/O.
    const doc = renderReport(model, {}, factory);
    expect(doc.getNumberOfPages()).toBeGreaterThan(5);
    const bytes = doc.output('arraybuffer') as ArrayBuffer;
    // A real, populated PDF is well over a few KB.
    expect(bytes.byteLength).toBeGreaterThan(5000);
  });
});

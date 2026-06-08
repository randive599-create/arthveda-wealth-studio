/**
 * Report generation orchestrator.
 *
 * Ties together the pure report model, the jsPDF renderer, and the optional
 * chart capture. jsPDF is dynamically imported so its weight is only paid when
 * a user actually requests a report (it stays out of the initial bundle).
 *
 * Chart capture is optional and best-effort: if an element is missing or
 * rasterization fails, the report is still produced with the remaining content
 * rather than failing outright. A `onProgress` callback drives the button's UI.
 */

import type { ProjectionResult } from '../engine/types';
import { captureChart, type CapturedImage, type ChartCapturer } from './captureChart';
import { A4 } from './pageLayout';
import { renderReport, type PdfDoc, type PdfFactory } from './pdfRenderer';
import { registerReportFonts } from './registerFonts';
import { buildReportFileName, buildReportModel } from './reportModel';

/** Stage labels surfaced to the UI during generation. */
export type ReportStage = 'preparing' | 'charts' | 'rendering' | 'saving' | 'done';

export interface GenerateReportOptions {
  /** Live chart DOM nodes to rasterize (optional). */
  mountainEl?: HTMLElement | null;
  donutEl?: HTMLElement | null;
  /** Progress callback (0–1) with a human-readable stage. */
  onProgress?: (fraction: number, stage: ReportStage) => void;
  /** Generation timestamp (injectable for tests). */
  now?: Date;
  /** Override the chart capturer (injectable for tests). */
  capturer?: ChartCapturer;
  /** Override the jsPDF factory (injectable for tests). */
  factory?: PdfFactory;
}

/** The default jsPDF factory: an A4 portrait document measured in points. */
async function defaultFactory(): Promise<PdfFactory> {
  const { jsPDF } = await import('jspdf');
  return () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [A4.width, A4.height],
    });
    // Register the embedded Unicode fonts so the rupee sign and all digits
    // render correctly (the WinAnsi built-ins corrupt ₹ and mis-space numbers).
    registerReportFonts(doc as unknown as Parameters<typeof registerReportFonts>[0]);
    return doc as unknown as PdfDoc;
  };
}

async function safeCapture(
  el: HTMLElement | null | undefined,
  capturer: ChartCapturer,
): Promise<CapturedImage | undefined> {
  if (!el) {
    return undefined;
  }
  try {
    return await capturer(el);
  } catch {
    return undefined;
  }
}

/**
 * Generate and save the Wealth Projection Report. Returns the resolved file
 * name. Throws if rendering fails (the caller surfaces the error in the UI).
 */
export async function generateReport(
  result: ProjectionResult,
  options: GenerateReportOptions = {},
): Promise<string> {
  const { onProgress, now = new Date() } = options;
  const capturer = options.capturer ?? captureChart;
  const report = (fraction: number, stage: ReportStage) => onProgress?.(fraction, stage);

  report(0.05, 'preparing');
  const model = buildReportModel(result, now);

  report(0.25, 'charts');
  const [mountain, donut] = await Promise.all([
    safeCapture(options.mountainEl, capturer),
    safeCapture(options.donutEl, capturer),
  ]);

  report(0.6, 'rendering');
  const factory = options.factory ?? (await defaultFactory());
  const doc = renderReport(model, { mountain, donut }, factory);

  report(0.9, 'saving');
  const fileName = buildReportFileName(now);
  doc.save(fileName);

  report(1, 'done');
  return fileName;
}

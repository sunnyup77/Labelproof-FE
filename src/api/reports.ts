// Reports API — GET /reports/{scan_id}.{format}
// The route returns a 302 redirect to the artifact's public S3 URL.
// We navigate to that URL directly rather than fetching through the API.

import { artifactUrl } from './client';
import type { ReportFormat, ScanArtifacts } from '../types/contracts';

// Build the report download URL by navigating through the Lambda redirect.
// Use this as an <a href> or window.open() — the browser follows the 302 to S3.
export function reportDownloadUrl(scanId: string, format: ReportFormat, apiBase?: string): string {
  const base = apiBase || (import.meta.env.VITE_API_BASE_URL as string) || '';
  return `${base}/reports/${scanId}.${format}`;
}

// Alternatively, if we have the artifacts object, we can link directly to the
// public S3 URL (no Lambda round-trip needed). Prefer this when available.
export function artifactDownloadUrl(artifacts: ScanArtifacts, format: ReportFormat): string {
  const keyMap: Record<ReportFormat, keyof ScanArtifacts> = {
    pdf: 'report_pdf',
    json: 'report_json',
    csv: 'report_csv',
  };
  return artifactUrl(artifacts[keyMap[format]]);
}

export function displayImageUrl(artifacts: ScanArtifacts): string {
  return artifactUrl(artifacts.display_image);
}

export function annotatedImageUrl(artifacts: ScanArtifacts): string {
  return artifactUrl(artifacts.annotated_image);
}

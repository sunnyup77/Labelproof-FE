// Scans API — GET /scans/{id} and GET /scans

import { apiGet } from './client';
import type { ScanRecord, ScansListParams, ScansListResponse } from '../types/contracts';

// GET /scans/{scan_id} — fetch a single scan record (used for polling + report)
export async function getScan(scanId: string): Promise<ScanRecord> {
  return apiGet<ScanRecord>(`/scans/${scanId}`);
}

// GET /scans — scan history list with optional search + filter + pagination
export async function listScans(params?: ScansListParams): Promise<ScansListResponse> {
  return apiGet<ScansListResponse>('/scans', {
    query: params?.query,
    rule_id: params?.rule_id,
    status: params?.status,
    limit: params?.limit,
    last_key: params?.last_key,
  });
}

// Terminal scan statuses — polling must stop when any of these is reached
export const TERMINAL_STATUSES = new Set(['DONE', 'NEEDS_REVIEW', 'FAILED'] as const);

export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.has(status as 'DONE' | 'NEEDS_REVIEW' | 'FAILED');
}

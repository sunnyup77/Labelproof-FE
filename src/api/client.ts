// Base API client — all requests go through here.
// Never call fetch directly from a component or page.

import type { ApiError } from '../types/contracts';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';

export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

async function parseError(res: Response): Promise<ApiRequestError> {
  try {
    const body = (await res.json()) as ApiError;
    return new ApiRequestError(res.status, body.error.code, body.error.message);
  } catch {
    return new ApiRequestError(res.status, 'INTERNAL', `HTTP ${res.status}`);
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiPost<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<TResponse>;
}

// Direct PUT to a presigned URL (not the Lambda API — no API_BASE prefix)
export async function presignedPut(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) {
    throw new ApiRequestError(res.status, 'UPLOAD_FAILED', `S3 upload failed: HTTP ${res.status}`);
  }
}

// Build a public artifact URL from an S3 key
export function artifactUrl(s3Key: string): string {
  const base = (import.meta.env.VITE_OUTPUTS_BASE_URL as string) || '';
  return `${base}/${s3Key}`;
}

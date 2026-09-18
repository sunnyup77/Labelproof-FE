// Upload API — POST /upload + presigned PUT to S3
// Accepted content_type: image/jpeg, image/png, application/pdf (CONTRACTS.md §3)

import { apiPost, presignedPut } from './client';
import type { UploadRequest, UploadResponse } from '../types/contracts';

export const ACCEPTED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;
export type AcceptedContentType = (typeof ACCEPTED_CONTENT_TYPES)[number];

// Max file size is enforced by the backend (20 MB), but we also gate on the FE
// to give immediate feedback before wasting a presign round-trip.
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export function getContentType(file: File): AcceptedContentType | null {
  if (ACCEPTED_CONTENT_TYPES.includes(file.type as AcceptedContentType)) {
    return file.type as AcceptedContentType;
  }
  return null;
}

// Step 1: request presigned URL from Lambda
export async function requestUpload(params: {
  file: File;
  labelWidthMm?: number;
}): Promise<UploadResponse> {
  const contentType = getContentType(params.file);
  if (!contentType) {
    throw new Error(`Unsupported file type: ${params.file.type}. Accepted: JPEG, PNG, PDF.`);
  }

  const body: UploadRequest = {
    filename: params.file.name,
    content_type: contentType,
    ...(params.labelWidthMm != null && params.labelWidthMm > 0
      ? { label_width_mm: params.labelWidthMm }
      : {}),
  };

  return apiPost<UploadRequest, UploadResponse>('/upload', body);
}

// Step 2: PUT file bytes directly to S3
export async function uploadToS3(uploadUrl: string, file: File): Promise<void> {
  return presignedPut(uploadUrl, file);
}

// Combined helper: request + upload in one call
// Returns the scan_id so the caller can start polling.
export async function initiateUpload(params: {
  file: File;
  labelWidthMm?: number;
  onProgress?: (phase: 'requesting' | 'uploading' | 'done') => void;
}): Promise<string> {
  params.onProgress?.('requesting');
  const { scan_id, upload_url } = await requestUpload({
    file: params.file,
    labelWidthMm: params.labelWidthMm,
  });

  params.onProgress?.('uploading');
  await uploadToS3(upload_url, params.file);

  params.onProgress?.('done');
  return scan_id;
}

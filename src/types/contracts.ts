// CONTRACTS.md v1.0 — TypeScript mirror
// Do NOT add fields that are not in CONTRACTS.md.
// Every field key always exists; absent values are null (never missing key).

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ScanStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'NEEDS_REVIEW' | 'FAILED';

export type RuleResultStatus = 'PASS' | 'FAIL' | 'NA' | 'NEEDS_REVIEW';

export type SourceType = 'photo' | 'pdf';

export type Language = 'en' | 'hi' | 'mixed' | 'unknown';

export type NetQuantityUnit = 'g' | 'kg' | 'ml' | 'l' | 'pcs';

export type ReportFormat = 'pdf' | 'json' | 'csv';

// Bounding box: [left, top, right, bottom] in pixels from top-left of processed image
export type BoundingBox = [number, number, number, number];

// ─── Extraction JSON (§1) ────────────────────────────────────────────────────

export interface ExtractionFieldBase {
  raw: string | null;
  parsed: unknown;
  confidence: number;
  box: BoundingBox | null;
}

export interface NetQuantityParsed {
  value: number;
  unit: NetQuantityUnit;
}

export interface MrpParsed {
  value: number;
  currency: 'INR';
}

export interface MfgDateParsed {
  month: number; // 1–12
  year: number;
}

export interface ConsumerCareParsed {
  phone: string | null;
  email: string | null;
}

export interface ExtractionFields {
  manufacturer_name: ExtractionFieldBase & { parsed: null };
  manufacturer_address: ExtractionFieldBase & { parsed: null };
  generic_name: ExtractionFieldBase & { parsed: null };
  net_quantity: ExtractionFieldBase & { parsed: NetQuantityParsed | null };
  mrp: ExtractionFieldBase & { parsed: MrpParsed | null };
  mfg_date: ExtractionFieldBase & { parsed: MfgDateParsed | null };
  consumer_care: ExtractionFieldBase & { parsed: ConsumerCareParsed | null };
  brand_guess: ExtractionFieldBase & { parsed: null };
}

export interface ExtractionImageDimensions {
  width: number;
  height: number;
}

export interface ExtractionJSON {
  schema_version: '1.0';
  source_type: SourceType;
  image: ExtractionImageDimensions;
  language: Language;
  fields: ExtractionFields;
}

// ─── Rule Result (§2 results[]) ──────────────────────────────────────────────

export type RuleId = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8' | 'R9' | 'R10' | 'R11';

// R8 measurement shape (locked — decision log 2026-09-18)
export interface R8Measurement {
  measured_mm: number;
  sigma_mm: number;
  required_mm: number;
  pdp_area_cm2: number;
  area_uncertainty_cm2: number | null; // null on pdf_exact
  pack_class: 'A<50cm2' | '50<A<100cm2' | '100<A<500cm2' | '500<A<2500cm2' | '>2500cm2';
  method: 'calibrated_photo' | 'pdf_exact';
}

// R9 / R10 carry their own measurement shapes (same wrapper, different values)
export type GeometryMeasurement = R8Measurement | Record<string, unknown>;

export interface RuleResult {
  rule_id: RuleId;
  name: string;
  citation: string;
  status: RuleResultStatus;
  evidence: string | null;
  fix: string | null;          // null for PASS/NA; concrete instruction for every FAIL
  box: BoundingBox | null;
  measurement: GeometryMeasurement | null; // only geometry checks R8–R10
}

// ─── Scan Record (§2) ────────────────────────────────────────────────────────

export interface ScanInput {
  filename: string;
  content_type: 'image/jpeg' | 'image/png' | 'application/pdf';
  source_type: SourceType;
  label_width_mm: number | null;
  s3_key: string;
  size_bytes: number;
}

export interface ScanProduct {
  brand_guess: string | null;
  generic_name: string | null;
}

export interface ScanSummary {
  pass: number;
  fail: number;
  na: number;
  needs_review: number;
  found_declarations: number; // count of 7 declaration fields that reached VERIFIED
  exempt: number;             // count of NA_EXEMPT results (0 on normal scans)
}

export interface ScanArtifacts {
  annotated_image: string; // S3 key — combine with VITE_OUTPUTS_BASE_URL
  report_pdf: string;
  report_json: string;
  report_csv: string;
  display_image: string;   // resized original (max 1600px), for the toggle viewer
}

export interface ScanExemption {
  applied: boolean;
  citation: string;
  reason: string;
}

export interface ScanError {
  code: 'OVERSIZED_FILE' | 'STALE_PROCESSING' | 'UPLOAD_TIMEOUT' | 'EVENT_NOT_RECEIVED' | 'EXTRACTION_FAILED' | 'INTERNAL';
  message: string;
}

export interface ScanRecord {
  scan_id: string;
  status: ScanStatus;
  created_at: string;   // ISO 8601 UTC
  updated_at: string;
  input: ScanInput;
  product: ScanProduct;
  extraction: ExtractionJSON | null;
  summary: ScanSummary | null;     // null while PENDING/PROCESSING
  results: RuleResult[] | null;    // null while PENDING/PROCESSING
  artifacts: ScanArtifacts | null; // null while PENDING/PROCESSING
  exemption: ScanExemption | null;
  error: ScanError | null;         // null unless status === 'FAILED'
}

// ─── API Responses (§3) ──────────────────────────────────────────────────────

// POST /upload
export interface UploadRequest {
  filename: string;
  content_type: 'image/jpeg' | 'image/png' | 'application/pdf';
  label_width_mm?: number; // optional; enables R8 on photos
}

export interface UploadResponse {
  scan_id: string;
  upload_url: string;
  expires_in: number; // seconds (900)
}

// GET /scans
export interface ScansListResponse {
  items: ScanRecord[];
  last_key: string | null; // opaque base64 cursor; null when no more pages
}

export interface ScansListParams {
  query?: string;      // fuzzy match on brand/product
  rule_id?: RuleId;    // filter scans having this rule failed
  status?: ScanStatus;
  limit?: number;      // default 20, max 100
  last_key?: string;   // pass back verbatim from previous response
}

// GET /stats
export interface RuleStats {
  pass: number;
  fail: number;
  na: number;
  needs_review: number;
}

export interface StatsResponse {
  total_scans: number;
  overall: RuleStats;
  by_rule: Partial<Record<RuleId, RuleStats>>;
  most_failed_rules: Array<{ rule_id: RuleId; count: number }>;
}

// Error response (every route, every failure)
export interface ApiError {
  error: {
    code: 'BAD_REQUEST' | 'NOT_FOUND' | 'METHOD_NOT_ALLOWED' | 'INTERNAL';
    message: string;
  };
}

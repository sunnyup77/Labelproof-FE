// Status display utilities — colors, labels, icons for PASS/FAIL/NA/NEEDS_REVIEW
// These are display-only helpers. The FE NEVER independently decides compliance.

import type { RuleResultStatus, ScanStatus } from '../types/contracts';

export interface StatusDisplay {
  label: string;
  cssClass: string;
  color: string;      // CSS custom property name (--color-*)
  icon: string;       // emoji/symbol for compact display
  description: string;
}

export const RULE_STATUS_DISPLAY: Record<RuleResultStatus, StatusDisplay> = {
  PASS: {
    label: 'Pass',
    cssClass: 'status-pass',
    color: 'var(--color-pass)',
    icon: '✓',
    description: 'Compliant',
  },
  FAIL: {
    label: 'Fail',
    cssClass: 'status-fail',
    color: 'var(--color-fail)',
    icon: '✗',
    description: 'Non-compliant — action required',
  },
  NA: {
    label: 'N/A',
    cssClass: 'status-na',
    color: 'var(--color-na)',
    icon: '–',
    description: 'Not applicable',
  },
  NEEDS_REVIEW: {
    label: 'Review',
    cssClass: 'status-review',
    color: 'var(--color-review)',
    icon: '?',
    description: 'Requires manual review',
  },
};

export const SCAN_STATUS_DISPLAY: Record<ScanStatus, StatusDisplay> = {
  PENDING: {
    label: 'Pending',
    cssClass: 'status-pending',
    color: 'var(--color-na)',
    icon: '○',
    description: 'Awaiting upload',
  },
  PROCESSING: {
    label: 'Processing',
    cssClass: 'status-processing',
    color: 'var(--color-review)',
    icon: '◌',
    description: 'Analysis in progress',
  },
  DONE: {
    label: 'Done',
    cssClass: 'status-done',
    color: 'var(--color-pass)',
    icon: '●',
    description: 'Analysis complete',
  },
  NEEDS_REVIEW: {
    label: 'Needs Review',
    cssClass: 'status-review',
    color: 'var(--color-review)',
    icon: '◑',
    description: 'Requires manual review',
  },
  FAILED: {
    label: 'Failed',
    cssClass: 'status-failed',
    color: 'var(--color-fail)',
    icon: '✗',
    description: 'Processing failed',
  },
};

export function getRuleStatusDisplay(status: RuleResultStatus): StatusDisplay {
  return RULE_STATUS_DISPLAY[status];
}

export function getScanStatusDisplay(status: ScanStatus): StatusDisplay {
  return SCAN_STATUS_DISPLAY[status];
}

// Format a file size in bytes to a human-readable string
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Format an ISO timestamp to local date/time
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Format a relative time (e.g. "2 minutes ago")
export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

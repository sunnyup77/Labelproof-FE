import type { RuleResultStatus, ScanStatus } from '../../types/contracts';
import { RULE_STATUS_DISPLAY, SCAN_STATUS_DISPLAY } from '../../utils/status';
import './StatusBadge.css';

interface RuleStatusBadgeProps {
  status: RuleResultStatus;
  size?: 'sm' | 'md';
}

interface ScanStatusBadgeProps {
  status: ScanStatus;
  size?: 'sm' | 'md';
}

export function RuleStatusBadge({ status, size = 'md' }: RuleStatusBadgeProps) {
  const d = RULE_STATUS_DISPLAY[status];
  return (
    <span className={`badge badge-${status.toLowerCase().replace('_', '-')} ${size === 'sm' ? 'badge-sm' : ''}`}
      aria-label={d.description}
      title={d.description}
    >
      <span className="badge-icon" aria-hidden="true">{d.icon}</span>
      {d.label}
    </span>
  );
}

export function ScanStatusBadge({ status, size = 'md' }: ScanStatusBadgeProps) {
  const d = SCAN_STATUS_DISPLAY[status];
  const cls = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    DONE: 'done',
    NEEDS_REVIEW: 'review',
    FAILED: 'failed',
  }[status];
  return (
    <span
      className={`badge badge-${cls} ${size === 'sm' ? 'badge-sm' : ''}`}
      aria-label={d.description}
      title={d.description}
    >
      {status === 'PROCESSING' && <span className="badge-spinner" aria-hidden="true" />}
      {d.label}
    </span>
  );
}

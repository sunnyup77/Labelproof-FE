import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePollScan } from '../../hooks/usePollScan';
import { SummaryBar } from '../../components/SummaryBar';
import { RuleResultCard } from '../../components/RuleResultCard';
import { AnnotatedViewer } from '../../components/AnnotatedViewer';
import { ExemptionBanner } from '../../components/ExemptionBanner';
import { ScanStatusBadge } from '../../components/StatusBadge';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { displayImageUrl, annotatedImageUrl, artifactDownloadUrl } from '../../api/reports';
import { formatTimestamp, formatRelativeTime } from '../../utils/status';
import type { RuleResult, ScanRecord } from '../../types/contracts';
import './ReportPage.css';

export function ReportPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();

  // Poll while PENDING/PROCESSING; stops automatically on terminal status
  const { scan, error, isPolling } = usePollScan(scanId ?? null);

  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Scroll to a rule card
  const scrollToRule = useCallback((ruleId: string) => {
    const el = document.getElementById(`rule-${ruleId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedRuleId(ruleId);
    }
  }, []);

  const handleBoxClick = useCallback((result: RuleResult) => {
    scrollToRule(result.rule_id);
  }, [scrollToRule]);

  const handleHighlight = useCallback((result: RuleResult) => {
    setHighlightedRuleId(prev => prev === result.rule_id ? null : result.rule_id);
  }, []);

  if (!scanId) {
    return <div className="container"><ErrorState error={new Error('No scan ID provided.')} /></div>;
  }

  if (error) {
    return (
      <div className="container">
        <ErrorState error={error} onRetry={() => navigate(0)} />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="report-page container">
        <LoadingSpinner size="lg" label="Loading scan…" />
      </div>
    );
  }

  // Processing/Pending state
  if (scan.status === 'PENDING' || scan.status === 'PROCESSING') {
    return <ProcessingView scan={scan} isPolling={isPolling} />;
  }

  // Failed state
  if (scan.status === 'FAILED') {
    return <FailedView scan={scan} />;
  }

  // Terminal: DONE or NEEDS_REVIEW — render full report
  return <CompletedReport
    scan={scan}
    highlightedRuleId={highlightedRuleId}
    filterStatus={filterStatus}
    onFilterChange={setFilterStatus}
    onHighlight={handleHighlight}
    onBoxClick={handleBoxClick}
  />;
}

// ── Processing state ────────────────────────────────────────────────────────

function ProcessingView({ scan, isPolling }: { scan: ScanRecord; isPolling: boolean }) {
  return (
    <div className="report-page container">
      <div className="processing-view">
        <div className="processing-view__scan-id">
          <span className="font-mono text-muted">{scan.scan_id}</span>
          <ScanStatusBadge status={scan.status} />
        </div>

        <div className="processing-view__animation" aria-hidden="true">
          <div className="processing-scan-line" />
          <div className="processing-icon">🏷</div>
        </div>

        <h1 className="processing-view__title">Analysing label…</h1>
        <p className="processing-view__sub">
          {scan.status === 'PENDING'
            ? 'Upload received. Starting pipeline…'
            : 'Running 11 compliance checks against the Legal Metrology Rules, 2011.'}
        </p>

        <div className="processing-steps">
          <ProcessingStep label="Upload received"       done />
          <ProcessingStep label="Pre-processing image"  done={scan.status === 'PROCESSING'} active={scan.status === 'PROCESSING'} />
          <ProcessingStep label="AI extraction (Bedrock)" done={false} />
          <ProcessingStep label="Verification gauntlet" done={false} />
          <ProcessingStep label="11 compliance checks"  done={false} />
          <ProcessingStep label="Generating report"     done={false} />
        </div>

        {isPolling && (
          <p className="processing-view__polling-note">
            <span className="animate-pulse">●</span> Checking for results every 2 seconds…
          </p>
        )}

        <p className="processing-view__time text-muted text-sm">
          Started {formatRelativeTime(scan.created_at)}
        </p>
      </div>
    </div>
  );
}

function ProcessingStep({ label, done, active }: { label: string; done: boolean; active?: boolean }) {
  return (
    <div className={`proc-step ${done ? 'proc-step--done' : ''} ${active ? 'proc-step--active' : ''}`}>
      <div className="proc-step__dot" aria-hidden="true">
        {done ? '✓' : active ? '◌' : '○'}
      </div>
      <span className="proc-step__label">{label}</span>
    </div>
  );
}

// ── Failed state ─────────────────────────────────────────────────────────────

function FailedView({ scan }: { scan: ScanRecord }) {
  const ERROR_LABELS: Record<string, string> = {
    OVERSIZED_FILE:      'File exceeds the 20 MB limit.',
    STALE_PROCESSING:    'Processing timed out (>5 min). Please re-upload.',
    UPLOAD_TIMEOUT:      'Upload was not received within 16 minutes. Please try again.',
    EVENT_NOT_RECEIVED:  'The file was uploaded but the processing trigger was not received.',
    EXTRACTION_FAILED:   'AI extraction failed on both primary and fallback models.',
    INTERNAL:            'An internal error occurred. Please try again.',
  };

  return (
    <div className="report-page container">
      <div className="failed-view">
        <div className="failed-view__icon" aria-hidden="true">✗</div>
        <h1 className="failed-view__title">Processing failed</h1>
        <p className="failed-view__scan-id font-mono text-muted">{scan.scan_id}</p>
        {scan.error && (
          <>
            <div className="failed-view__reason">
              {ERROR_LABELS[scan.error.code] || scan.error.message}
            </div>
            <div className="failed-view__code font-mono text-muted text-sm">
              Error code: {scan.error.code}
            </div>
          </>
        )}
        <Link to="/" className="btn btn-primary">Upload a new label</Link>
      </div>
    </div>
  );
}

// ── Completed report ─────────────────────────────────────────────────────────

interface CompletedReportProps {
  scan: ScanRecord;
  highlightedRuleId: string | null;
  filterStatus: string;
  onFilterChange: (s: string) => void;
  onHighlight: (r: RuleResult) => void;
  onBoxClick: (r: RuleResult) => void;
}

function CompletedReport({
  scan,
  highlightedRuleId,
  filterStatus,
  onFilterChange,
  onHighlight,
  onBoxClick,
}: CompletedReportProps) {
  const { summary, results, artifacts, exemption, extraction, input } = scan;

  const filteredResults = results?.filter(r =>
    filterStatus === 'all' ? true : r.status === filterStatus
  ) ?? [];

  const hasViewer = artifacts && extraction;
  const imageDims = extraction?.image ?? null;

  return (
    <div className="report-page container">
      {/* ── Header ── */}
      <div className="report-header">
        <div className="report-header__meta">
          <div className="report-header__breadcrumb">
            <Link to="/" className="report-header__back">← New scan</Link>
            <span className="text-muted">/</span>
            <Link to="/history" className="report-header__back">History</Link>
            <span className="text-muted">/</span>
            <span className="font-mono text-sm text-muted">{scan.scan_id}</span>
          </div>

          <div className="report-header__title-row">
            <h1 className="report-header__title">
              {scan.product.generic_name ?? input.filename}
            </h1>
            <ScanStatusBadge status={scan.status} />
          </div>

          {scan.product.brand_guess && (
            <div className="report-header__brand text-muted text-sm">{scan.product.brand_guess}</div>
          )}

          <div className="report-header__info text-sm text-muted">
            <span>{input.filename}</span>
            <span>·</span>
            <span>{input.source_type === 'pdf' ? 'PDF' : 'Photo'}</span>
            {input.label_width_mm && (
              <>
                <span>·</span>
                <span>Width: {input.label_width_mm} mm</span>
              </>
            )}
            <span>·</span>
            <span>Scanned {formatTimestamp(scan.created_at)}</span>
          </div>
        </div>

        {/* Downloads */}
        {artifacts && (
          <div className="report-header__downloads">
            <DownloadButton artifacts={artifacts} format="pdf" label="PDF report" />
            <DownloadButton artifacts={artifacts} format="csv" label="CSV" />
            <DownloadButton artifacts={artifacts} format="json" label="JSON" />
          </div>
        )}
      </div>

      {/* ── Exemption banner (if any) ── */}
      {exemption && <div className="report-section"><ExemptionBanner exemption={exemption} /></div>}

      {/* ── Summary bar ── */}
      {summary && (
        <div className="report-section card-elevated">
          <SummaryBar summary={summary} foundDeclarations={summary.found_declarations} />
        </div>
      )}

      {/* ── Main content: viewer + rules ── */}
      <div className="report-body">
        {/* Annotated viewer */}
        {hasViewer && imageDims && results && (
          <div className="report-viewer-col">
            <div className="card">
              <div className="report-section-title">Label</div>
              <AnnotatedViewer
                displayImageUrl={displayImageUrl(artifacts)}
                annotatedImageUrl={annotatedImageUrl(artifacts)}
                imageDims={imageDims}
                results={results}
                highlightedRuleId={highlightedRuleId}
                onBoxClick={onBoxClick}
              />
            </div>
          </div>
        )}

        {/* Rule results */}
        <div className="report-rules-col">
          {/* Filter */}
          <div className="report-rules-header">
            <h2 className="report-section-title">Rule Results</h2>
            <div className="report-filter" role="group" aria-label="Filter by status">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`report-filter-btn ${filterStatus === opt.value ? 'active' : ''}`}
                  onClick={() => onFilterChange(opt.value)}
                  aria-pressed={filterStatus === opt.value}
                >
                  {opt.label}
                  {opt.value !== 'all' && summary && (
                    <span className="report-filter-count">
                      {summary[opt.summaryKey as keyof typeof summary] as number}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="report-rules-list">
            {filteredResults.length === 0 ? (
              <div className="report-rules-empty text-muted text-sm">
                No results for this filter.
              </div>
            ) : (
              filteredResults.map(result => (
                <RuleResultCard
                  key={result.rule_id}
                  result={result}
                  imageDims={imageDims}
                  onHighlight={onHighlight}
                  isHighlighted={highlightedRuleId === result.rule_id}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Scan-level NEEDS_REVIEW note ── */}
      {scan.status === 'NEEDS_REVIEW' && !exemption && (
        <div className="report-review-note">
          <span>⚑</span>
          <div>
            <strong>Scan requires review:</strong> one or more checks could not produce a conclusive verdict.
            Items marked <em>Review</em> need manual inspection against the physical label.
          </div>
        </div>
      )}
    </div>
  );
}

function DownloadButton({ artifacts, format, label }: {
  artifacts: NonNullable<ScanRecord['artifacts']>;
  format: 'pdf' | 'json' | 'csv';
  label: string;
}) {
  const url = artifactDownloadUrl(artifacts, format);
  return (
    <a
      href={url}
      download
      className="btn btn-secondary btn-sm"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Download ${label}`}
    >
      ↓ {label}
    </a>
  );
}

const FILTER_OPTIONS = [
  { value: 'all',          label: 'All',    summaryKey: '' },
  { value: 'FAIL',         label: 'Fail',   summaryKey: 'fail' },
  { value: 'NEEDS_REVIEW', label: 'Review', summaryKey: 'needs_review' },
  { value: 'PASS',         label: 'Pass',   summaryKey: 'pass' },
  { value: 'NA',           label: 'N/A',    summaryKey: 'na' },
];

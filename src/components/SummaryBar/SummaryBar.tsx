import type { ScanSummary } from '../../types/contracts';
import './SummaryBar.css';

interface SummaryBarProps {
  summary: ScanSummary;
  foundDeclarations?: number;
}

export function SummaryBar({ summary, foundDeclarations }: SummaryBarProps) {
  const total = summary.pass + summary.fail + summary.na + summary.needs_review;

  const segments = [
    { key: 'pass',         value: summary.pass,         label: 'Pass',   cls: 'seg-pass' },
    { key: 'fail',         value: summary.fail,         label: 'Fail',   cls: 'seg-fail' },
    { key: 'needs_review', value: summary.needs_review, label: 'Review', cls: 'seg-review' },
    { key: 'na',           value: summary.na,           label: 'N/A',    cls: 'seg-na' },
  ];

  return (
    <div className="summary-bar-wrapper">
      {/* Stacked bar */}
      <div className="summary-bar" role="img" aria-label="Compliance summary bar" title={`${summary.pass} pass, ${summary.fail} fail, ${summary.needs_review} review, ${summary.na} N/A`}>
        {total > 0 && segments.map(s =>
          s.value > 0 ? (
            <div
              key={s.key}
              className={`summary-bar-seg ${s.cls}`}
              style={{ width: `${(s.value / total) * 100}%` }}
            />
          ) : null
        )}
      </div>

      {/* Counts */}
      <div className="summary-counts">
        <div className="summary-count">
          <span className="count-value count-pass">{summary.pass}</span>
          <span className="count-label">Pass</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-count">
          <span className="count-value count-fail">{summary.fail}</span>
          <span className="count-label">Fail</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-count">
          <span className="count-value count-review">{summary.needs_review}</span>
          <span className="count-label">Review</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-count">
          <span className="count-value count-na">{summary.na}</span>
          <span className="count-label">N/A</span>
        </div>

        {foundDeclarations !== undefined && (
          <>
            <div className="summary-divider" />
            <div className="summary-count">
              <span className="count-value count-declarations">{foundDeclarations}<span className="count-of">/7</span></span>
              <span className="count-label">Declarations found</span>
            </div>
          </>
        )}

        {summary.exempt > 0 && (
          <>
            <div className="summary-divider" />
            <div className="summary-count">
              <span className="count-value count-exempt">{summary.exempt}</span>
              <span className="count-label">Exempt</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

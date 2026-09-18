import { useState, useCallback } from 'react';
import type { RuleResult, BoundingBox, ExtractionImageDimensions } from '../../types/contracts';
import { normalizeBox } from '../../utils/boxes';
import './AnnotatedViewer.css';

interface AnnotatedViewerProps {
  displayImageUrl: string;
  annotatedImageUrl: string;
  imageDims: ExtractionImageDimensions;
  results: RuleResult[];
  highlightedRuleId?: string | null;
  onBoxClick?: (result: RuleResult) => void;
}

type ViewMode = 'original' | 'annotated';

const STATUS_BOX_COLORS: Record<string, string> = {
  FAIL: 'var(--color-fail)',
  PASS: 'var(--color-pass)',
  NEEDS_REVIEW: 'var(--color-review)',
  NA: 'var(--color-na)',
};

export function AnnotatedViewer({
  displayImageUrl,
  annotatedImageUrl,
  imageDims,
  results,
  highlightedRuleId,
  onBoxClick,
}: AnnotatedViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const [hoveredRuleId, setHoveredRuleId] = useState<string | null>(null);

  const imgSrc = viewMode === 'annotated' ? annotatedImageUrl : displayImageUrl;

  // Only show boxes in 'original' mode (annotated already has them drawn by backend)
  const showOverlayBoxes = viewMode === 'original';

  // Collect results that have boxes for overlay
  const boxedResults = results.filter(r => r.box != null);

  const handleBoxClick = useCallback((result: RuleResult) => {
    onBoxClick?.(result);
  }, [onBoxClick]);

  return (
    <div className="av-wrapper">
      {/* Toggle */}
      <div className="av-toggle-bar">
        <div className="av-toggle" role="group" aria-label="View mode">
          <button
            className={`av-toggle-btn ${viewMode === 'original' ? 'active' : ''}`}
            onClick={() => setViewMode('original')}
            aria-pressed={viewMode === 'original'}
          >
            Original
          </button>
          <button
            className={`av-toggle-btn ${viewMode === 'annotated' ? 'active' : ''}`}
            onClick={() => setViewMode('annotated')}
            aria-pressed={viewMode === 'annotated'}
          >
            Annotated
          </button>
        </div>

        <span className="av-mode-hint">
          {viewMode === 'original'
            ? 'Click a rule card to highlight its region'
            : 'Backend-annotated with all rule results'}
        </span>
      </div>

      {/* Image container */}
      <div className="av-image-container">
        <img
          src={imgSrc}
          alt={viewMode === 'annotated' ? 'Annotated label with compliance boxes' : 'Label image'}
          className="av-image"
          draggable={false}
        />

        {/* Overlay boxes — original mode only */}
        {showOverlayBoxes && boxedResults.map(result => {
          const box = result.box as BoundingBox;
          const norm = normalizeBox(box, imageDims);
          const isActive = highlightedRuleId === result.rule_id || hoveredRuleId === result.rule_id;
          const color = STATUS_BOX_COLORS[result.status] || 'var(--color-na)';

          return (
            <button
              key={result.rule_id}
              className={`av-box ${isActive ? 'av-box--active' : ''}`}
              style={{
                left:   `${norm.left}%`,
                top:    `${norm.top}%`,
                width:  `${norm.width}%`,
                height: `${norm.height}%`,
                '--box-color': color,
              } as React.CSSProperties}
              onClick={() => handleBoxClick(result)}
              onMouseEnter={() => setHoveredRuleId(result.rule_id)}
              onMouseLeave={() => setHoveredRuleId(null)}
              aria-label={`${result.rule_id}: ${result.name} — ${result.status}`}
              title={`${result.rule_id}: ${result.name} — ${result.status}`}
            >
              <span className="av-box-label">{result.rule_id}</span>
            </button>
          );
        })}
      </div>

      {/* Box legend */}
      {showOverlayBoxes && boxedResults.length > 0 && (
        <div className="av-legend">
          {(['FAIL', 'NEEDS_REVIEW', 'PASS', 'NA'] as const).map(status => {
            const count = boxedResults.filter(r => r.status === status).length;
            if (count === 0) return null;
            return (
              <div key={status} className="av-legend-item">
                <span className="av-legend-dot" style={{ background: STATUS_BOX_COLORS[status] }} />
                <span>{status === 'NEEDS_REVIEW' ? 'Review' : status} ({count})</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

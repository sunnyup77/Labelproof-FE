import { useState } from 'react';
import type { RuleResult } from '../../types/contracts';
import type { ExtractionImageDimensions } from '../../types/contracts';
import { RuleStatusBadge } from '../StatusBadge';
import { MeasurementBlock } from '../MeasurementBlock';
import { RULE_META } from '../../constants/rules';
import './RuleResultCard.css';

interface RuleResultCardProps {
  result: RuleResult;
  imageDims: ExtractionImageDimensions | null;
  onHighlight?: (result: RuleResult) => void;
  isHighlighted?: boolean;
}

export function RuleResultCard({ result, imageDims, onHighlight, isHighlighted }: RuleResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = RULE_META[result.rule_id];
  const hasDetails = result.evidence || result.fix || result.measurement || result.box;

  return (
    <div
      className={`rule-card ${isHighlighted ? 'rule-card--highlighted' : ''} rule-card--${result.status.toLowerCase().replace('_', '-')}`}
      id={`rule-${result.rule_id}`}
    >
      {/* Header row */}
      <div className="rule-card__header" onClick={() => hasDetails && setExpanded(e => !e)}>
        <div className="rule-card__id-col">
          <span className="rule-card__id">{result.rule_id}</span>
        </div>

        <div className="rule-card__main">
          <div className="rule-card__title-row">
            <span className="rule-card__name">{result.name}</span>
            <RuleStatusBadge status={result.status} />
          </div>
          <div className="rule-card__citation">{result.citation}</div>
        </div>

        <div className="rule-card__actions">
          {result.box && imageDims && onHighlight && (
            <button
              className={`btn btn-ghost btn-sm rule-card__highlight-btn ${isHighlighted ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onHighlight(result); }}
              title="Highlight on label"
              aria-label="Highlight on label image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          )}
          {hasDetails && (
            <button
              className="rule-card__expand-btn"
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
              onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="rule-card__details animate-fade-in">
          {result.evidence && (
            <div className="rule-card__section">
              <div className="rule-card__section-label">Evidence</div>
              <div className="rule-card__evidence">{result.evidence}</div>
            </div>
          )}

          {result.fix && (
            <div className="rule-card__section">
              <div className="rule-card__section-label rule-card__section-label--fix">Fix required</div>
              <div className="rule-card__fix">
                <span className="rule-card__fix-icon">→</span>
                {result.fix}
              </div>
            </div>
          )}

          {result.measurement && (
            <div className="rule-card__section">
              <div className="rule-card__section-label">Measurement</div>
              <MeasurementBlock measurement={result.measurement} />
            </div>
          )}

          {result.rule_id && meta && (
            <div className="rule-card__section">
              <div className="rule-card__section-label">Rule description</div>
              <div className="rule-card__description">{meta.description}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

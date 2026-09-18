import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listScans } from '../../api/scans';
import { ScanStatusBadge } from '../../components/StatusBadge';
import { ErrorState, EmptyState } from '../../components/ErrorState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatRelativeTime, formatBytes } from '../../utils/status';
import type { ScanRecord, ScansListParams, ScanStatus, RuleId } from '../../types/contracts';
import { RULE_IDS } from '../../constants/rules';
import './HistoryPage.css';

const SCAN_STATUSES: ScanStatus[] = ['DONE', 'NEEDS_REVIEW', 'FAILED', 'PROCESSING', 'PENDING'];

export function HistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems]         = useState<ScanRecord[]>([]);
  const [lastKey, setLastKey]     = useState<string | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<Error | null>(null);

  // Controlled search params
  const query    = searchParams.get('query') || '';
  const ruleId   = (searchParams.get('rule_id') || '') as RuleId | '';
  const status   = (searchParams.get('status')  || '') as ScanStatus | '';

  const buildParams = useCallback((): ScansListParams => ({
    query:   query   || undefined,
    rule_id: ruleId  || undefined,
    status:  status  || undefined,
    limit: 20,
  }), [query, ruleId, status]);

  const load = useCallback(async (cursor?: string, replace = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listScans({ ...buildParams(), last_key: cursor });
      setItems(prev => replace ? res.items : [...prev, ...res.items]);
      setLastKey(res.last_key);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  // Reload when filters change
  useEffect(() => {
    setItems([]);
    setLastKey(undefined);
    load();
  }, [query, ruleId, status]);

  const handleParamChange = (key: string, value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    });
  };

  const handleLoadMore = () => {
    if (lastKey) load(lastKey, false);
  };

  return (
    <div className="history-page container">
      <div className="history-header">
        <h1 className="history-title">Scan History</h1>
        <Link to="/" className="btn btn-primary btn-sm">+ New scan</Link>
      </div>

      {/* Filters */}
      <div className="history-filters card-sm">
        <div className="history-search-wrap">
          <input
            type="search"
            className="form-input history-search"
            placeholder="Search brand or product…"
            value={query}
            onChange={e => handleParamChange('query', e.target.value)}
            aria-label="Search scans by brand or product"
            id="history-search"
          />
        </div>

        <select
          className="form-input history-select"
          value={status}
          onChange={e => handleParamChange('status', e.target.value)}
          aria-label="Filter by scan status"
          id="history-status-filter"
        >
          <option value="">All statuses</option>
          {SCAN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="form-input history-select"
          value={ruleId}
          onChange={e => handleParamChange('rule_id', e.target.value)}
          aria-label="Filter by failed rule"
          id="history-rule-filter"
        >
          <option value="">All rules</option>
          {RULE_IDS.map(r => <option key={r} value={r}>{r} failed</option>)}
        </select>

        {(query || ruleId || status) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSearchParams({})}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {error ? (
        <ErrorState error={error} onRetry={() => load()} />
      ) : items.length === 0 && isLoading ? (
        <LoadingSpinner size="lg" label="Loading scans…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No scans found"
          description={query || ruleId || status
            ? 'Try adjusting your filters.'
            : 'Upload your first label to get started.'}
          action={<Link to="/" className="btn btn-primary">Scan a label</Link>}
        />
      ) : (
        <>
          <div className="history-list">
            {items.map(scan => (
              <ScanHistoryRow key={scan.scan_id} scan={scan} />
            ))}
          </div>

          {lastKey && (
            <div className="history-load-more">
              <button
                className="btn btn-secondary"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}

          {isLoading && items.length > 0 && (
            <div className="history-loading-more">
              <LoadingSpinner size="sm" label="Loading more…" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ScanHistoryRow({ scan }: { scan: ScanRecord }) {
  const hasResults = scan.summary && scan.results;

  return (
    <Link to={`/scans/${scan.scan_id}`} className="history-row">
      <div className="history-row__left">
        <div className="history-row__name">
          {scan.product.generic_name ?? scan.input.filename}
        </div>
        {scan.product.brand_guess && (
          <div className="history-row__brand text-muted text-sm">{scan.product.brand_guess}</div>
        )}
        <div className="history-row__meta text-muted text-xs">
          <span className="font-mono">{scan.scan_id}</span>
          <span>·</span>
          <span>{formatRelativeTime(scan.created_at)}</span>
          <span>·</span>
          <span>{scan.input.source_type === 'pdf' ? 'PDF' : 'Photo'}</span>
          <span>·</span>
          <span>{formatBytes(scan.input.size_bytes)}</span>
        </div>
      </div>

      <div className="history-row__right">
        {hasResults && scan.summary && (
          <div className="history-row__counts">
            {scan.summary.fail > 0 && (
              <span className="history-count history-count--fail">
                {scan.summary.fail} fail
              </span>
            )}
            {scan.summary.needs_review > 0 && (
              <span className="history-count history-count--review">
                {scan.summary.needs_review} review
              </span>
            )}
            {scan.summary.pass > 0 && (
              <span className="history-count history-count--pass">
                {scan.summary.pass} pass
              </span>
            )}
          </div>
        )}

        {/* Failed rules */}
        {scan.results && (
          <div className="history-row__failed-rules">
            {scan.results
              .filter(r => r.status === 'FAIL')
              .slice(0, 4)
              .map(r => (
                <span key={r.rule_id} className="history-rule-chip font-mono">{r.rule_id}</span>
              ))}
            {scan.results.filter(r => r.status === 'FAIL').length > 4 && (
              <span className="history-rule-chip history-rule-chip--more">
                +{scan.results.filter(r => r.status === 'FAIL').length - 4}
              </span>
            )}
          </div>
        )}

        <ScanStatusBadge status={scan.status} size="sm" />
        <span className="history-row__arrow" aria-hidden="true">→</span>
      </div>
    </Link>
  );
}

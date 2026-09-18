import { useEffect, useState } from 'react';
import { getStats } from '../../api/stats';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { RULE_META, RULE_IDS } from '../../constants/rules';
import type { StatsResponse } from '../../types/contracts';
import './StatsPage.css';

export function StatsPage() {
  const [stats, setStats]   = useState<StatsResponse | null>(null);
  const [error, setError]   = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await getStats());
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="stats-page container"><LoadingSpinner size="lg" label="Loading statistics…" /></div>;
  if (error)   return <div className="stats-page container"><ErrorState error={error} onRetry={load} /></div>;
  if (!stats)  return null;

  const total = stats.overall.pass + stats.overall.fail + stats.overall.na + stats.overall.needs_review;

  return (
    <div className="stats-page container">
      <div className="stats-header">
        <h1 className="stats-title">Dashboard</h1>
        <p className="stats-subtitle">Aggregate compliance statistics across {stats.total_scans.toLocaleString()} scans</p>
      </div>

      {/* Overall summary cards */}
      <div className="stats-overview">
        <StatCard
          label="Total scans"
          value={stats.total_scans.toLocaleString()}
          color="var(--color-accent-hover)"
        />
        <StatCard
          label="Total checks run"
          value={total.toLocaleString()}
          color="var(--color-text-secondary)"
        />
        <StatCard
          label="Pass rate"
          value={total > 0 ? `${Math.round((stats.overall.pass / total) * 100)}%` : '—'}
          color="var(--color-pass)"
        />
        <StatCard
          label="Fail rate"
          value={total > 0 ? `${Math.round((stats.overall.fail / total) * 100)}%` : '—'}
          color="var(--color-fail)"
        />
        <StatCard
          label="Review rate"
          value={total > 0 ? `${Math.round((stats.overall.needs_review / total) * 100)}%` : '—'}
          color="var(--color-review)"
        />
      </div>

      {/* Overall breakdown bar */}
      <div className="stats-section card-elevated">
        <h2 className="stats-section-title">Overall check results</h2>
        <div className="stats-bar-row">
          {(['pass', 'fail', 'needs_review', 'na'] as const).map(key => {
            const count = stats.overall[key];
            const pct   = total > 0 ? (count / total) * 100 : 0;
            const COLORS = { pass: 'var(--color-pass)', fail: 'var(--color-fail)', needs_review: 'var(--color-review)', na: 'var(--color-na)' };
            const LABELS = { pass: 'Pass', fail: 'Fail', needs_review: 'Needs Review', na: 'N/A' };
            return (
              <div key={key} className="stats-bar-segment-wrap">
                <div className="stats-bar-label" style={{ color: COLORS[key] }}>{LABELS[key]}</div>
                <div className="stats-bar-track">
                  <div className="stats-bar-fill" style={{ width: `${pct}%`, background: COLORS[key] }} />
                </div>
                <div className="stats-bar-value">{count.toLocaleString()} <span className="stats-bar-pct">({pct.toFixed(1)}%)</span></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most failed rules */}
      {stats.most_failed_rules.length > 0 && (
        <div className="stats-section">
          <h2 className="stats-section-title">Most frequently failed rules</h2>
          <div className="stats-top-rules">
            {stats.most_failed_rules.slice(0, 5).map((item, i) => {
              const meta = RULE_META[item.rule_id];
              const maxCount = stats.most_failed_rules[0]?.count ?? 1;
              return (
                <div key={item.rule_id} className="top-rule-row">
                  <span className="top-rule-rank text-muted">{i + 1}</span>
                  <div className="top-rule-info">
                    <div className="top-rule-header">
                      <span className="top-rule-id font-mono">{item.rule_id}</span>
                      <span className="top-rule-name">{meta?.name}</span>
                    </div>
                    <div className="top-rule-bar-wrap">
                      <div className="top-rule-bar">
                        <div
                          className="top-rule-bar-fill"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="top-rule-count">{item.count.toLocaleString()} fails</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-rule breakdown */}
      <div className="stats-section">
        <h2 className="stats-section-title">Per-rule breakdown</h2>
        <div className="stats-rule-grid">
          {RULE_IDS
            .filter(id => stats.by_rule[id])
            .map(id => {
              const r = stats.by_rule[id]!;
              const rTotal = r.pass + r.fail + r.na + r.needs_review;
              const meta = RULE_META[id];
              return (
                <div key={id} className="stats-rule-card card-sm">
                  <div className="stats-rule-header">
                    <span className="stats-rule-id font-mono">{id}</span>
                    <span className="stats-rule-name">{meta?.name}</span>
                  </div>
                  <div className="stats-rule-bar">
                    {rTotal > 0 && (
                      <>
                        {r.pass > 0 && <div className="stats-mini-seg" style={{ width: `${(r.pass/rTotal)*100}%`, background: 'var(--color-pass)' }} title={`Pass: ${r.pass}`} />}
                        {r.fail > 0 && <div className="stats-mini-seg" style={{ width: `${(r.fail/rTotal)*100}%`, background: 'var(--color-fail)' }} title={`Fail: ${r.fail}`} />}
                        {r.needs_review > 0 && <div className="stats-mini-seg" style={{ width: `${(r.needs_review/rTotal)*100}%`, background: 'var(--color-review)' }} title={`Review: ${r.needs_review}`} />}
                        {r.na > 0 && <div className="stats-mini-seg" style={{ width: `${(r.na/rTotal)*100}%`, background: 'var(--color-na)' }} title={`N/A: ${r.na}`} />}
                      </>
                    )}
                  </div>
                  <div className="stats-rule-counts">
                    {r.fail > 0    && <span className="srcount srcount--fail">{r.fail} fail</span>}
                    {r.needs_review > 0 && <span className="srcount srcount--review">{r.needs_review} review</span>}
                    {r.pass > 0    && <span className="srcount srcount--pass">{r.pass} pass</span>}
                    {r.na > 0      && <span className="srcount srcount--na">{r.na} N/A</span>}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat-card card-sm">
      <div className="stat-card__value" style={{ color }}>{value}</div>
      <div className="stat-card__label text-muted">{label}</div>
    </div>
  );
}

import type { GeometryMeasurement } from '../../types/contracts';
import './MeasurementBlock.css';

interface MeasurementBlockProps {
  measurement: GeometryMeasurement;
}

// R8 measurement shape — only this has the full locked schema
function isR8Measurement(m: GeometryMeasurement): m is {
  measured_mm: number; sigma_mm: number; required_mm: number;
  pdp_area_cm2: number; area_uncertainty_cm2: number | null;
  pack_class: string; method: string;
} {
  return 'measured_mm' in m && 'required_mm' in m;
}

export function MeasurementBlock({ measurement }: MeasurementBlockProps) {
  if (isR8Measurement(measurement)) {
    const m = measurement;
    const passes = (m.measured_mm - 3 * m.sigma_mm) >= m.required_mm;
    const fails  = (m.measured_mm + 3 * m.sigma_mm) < m.required_mm;
    const band   = !passes && !fails ? 'borderline' : null;

    return (
      <div className="measurement-block">
        <div className="measurement-row measurement-row--main">
          <MeasVal label="Measured" value={`${m.measured_mm.toFixed(2)} mm`} />
          <span className="measurement-vs">vs</span>
          <MeasVal label="Required" value={`≥ ${m.required_mm} mm`} highlight />
          {m.sigma_mm > 0 && (
            <MeasVal label="±3σ" value={`${(3 * m.sigma_mm).toFixed(2)} mm`} dim />
          )}
        </div>

        {band && (
          <div className="measurement-band-note">
            Result falls within the ±3σ uncertainty band — NEEDS_REVIEW (borderline zone, not a conclusive verdict)
          </div>
        )}

        <div className="measurement-row">
          <MeasVal label="PDP area" value={m.pdp_area_cm2 != null ? `${m.pdp_area_cm2.toFixed(1)} cm²` : '—'} />
          {m.area_uncertainty_cm2 != null && (
            <MeasVal label="Area ±" value={`${m.area_uncertainty_cm2.toFixed(1)} cm²`} dim />
          )}
          <MeasVal label="Pack class" value={m.pack_class} />
          <MeasVal label="Method" value={m.method === 'calibrated_photo' ? 'Calibrated photo' : 'PDF exact'} />
        </div>
      </div>
    );
  }

  // Generic fallback for R9/R10 — render as key-value table
  return (
    <div className="measurement-block">
      <div className="measurement-kv">
        {Object.entries(measurement as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="measurement-kv-row">
            <span className="measurement-kv-key font-mono">{k}</span>
            <span className="measurement-kv-val">{String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeasVal({ label, value, highlight, dim }: {
  label: string; value: string; highlight?: boolean; dim?: boolean;
}) {
  return (
    <div className="measval">
      <span className="measval-label">{label}</span>
      <span className={`measval-value ${highlight ? 'measval-value--highlight' : ''} ${dim ? 'measval-value--dim' : ''}`}>
        {value}
      </span>
    </div>
  );
}

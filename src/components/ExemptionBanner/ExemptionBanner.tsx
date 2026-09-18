import type { ScanExemption } from '../../types/contracts';
import './ExemptionBanner.css';

interface ExemptionBannerProps {
  exemption: ScanExemption;
}

// An exempt scan MUST NOT render as compliant.
// This banner is shown whenever exemption is non-null,
// regardless of whether applied is true or false.
export function ExemptionBanner({ exemption }: ExemptionBannerProps) {
  return (
    <div className={`exemption-banner ${exemption.applied ? 'exemption-banner--exempt' : 'exemption-banner--review'}`}
      role="alert"
      aria-live="polite"
    >
      <div className="exemption-banner__icon" aria-hidden="true">
        {exemption.applied ? '⚖' : '⚠'}
      </div>
      <div className="exemption-banner__content">
        <div className="exemption-banner__title">
          {exemption.applied
            ? 'Exemption applied — Chapter II checks not applicable'
            : 'Exemption uncertain — manual review required'}
        </div>
        <div className="exemption-banner__reason">{exemption.reason}</div>
        {exemption.citation && (
          <div className="exemption-banner__citation">{exemption.citation}</div>
        )}
        {exemption.applied && (
          <div className="exemption-banner__warning">
            ⚠ An exempt scan is not the same as a compliant scan. All checks are N/A, not passes.
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { initiateUpload } from '../../api/upload';
import { UploadDropzone } from '../../components/UploadDropzone';
import { ApiRequestError } from '../../api/client';
import './UploadPage.css';

type UploadPhase = 'requesting' | 'uploading' | 'done' | null;

export function UploadPage() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File, labelWidthMm?: number) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadPhase(null);

    try {
      const scanId = await initiateUpload({
        file,
        labelWidthMm,
        onProgress: phase => setUploadPhase(phase),
      });
      // Navigate to the processing/polling page
      navigate(`/scans/${scanId}`);
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Upload failed. Please try again.';
      setUploadError(message);
      setIsUploading(false);
      setUploadPhase(null);
    }
  }, [navigate]);

  return (
    <div className="upload-page container">
      <div className="upload-page__layout">
        {/* Left: Form */}
        <div className="upload-page__form-col">
          <div className="upload-page__hero-section">
            <div className="upload-page__hero-text">
              <span className="upload-page__eyebrow">AI-POWERED LABEL COMPLIANCE</span>
              <h1 className="upload-page__title">Scan a <span className="text-gradient">Label</span></h1>
              <p className="upload-page__subtitle">
                Upload a packaged commodity label image or PDF. Our system extracts mandatory declarations,
                validates them against the Legal Metrology (Packaged Commodities) Rules, 2011,
                and generates an annotated compliance report.
              </p>

              <div className="upload-page__features">
                <div className="upload-feature">
                  <div className="upload-feature-icon icon-blue"><SettingsIcon /></div>
                  <div className="upload-feature-text">
                    <strong>Fast Analysis</strong>
                    <span>Get results in seconds</span>
                  </div>
                </div>
                <div className="upload-feature">
                  <div className="upload-feature-icon icon-green"><ShieldIcon /></div>
                  <div className="upload-feature-text">
                    <strong>Accurate Checks</strong>
                    <span>11 compliance rules</span>
                  </div>
                </div>
                <div className="upload-feature">
                  <div className="upload-feature-icon icon-pink"><DocIcon /></div>
                  <div className="upload-feature-text">
                    <strong>Detailed Report</strong>
                    <span>With annotations</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="upload-page__hero-image">
              <img src="/chips_bag_scan.jpg" alt="AI Scan Example" className="hero-chips-img" />
            </div>
          </div>

          <UploadDropzone
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
            uploadPhase={uploadPhase}
            error={uploadError}
          />
        </div>

        {/* Right: Info panel */}
        <div className="upload-page__info-col">
          <div className="upload-page__what-we-check card-sm">
            <div className="sidebar-card-header">
              <div className="sidebar-card-icon icon-blue"><DocSearchIcon /></div>
              <div>
                <h2 className="sidebar-card-title">What We Check</h2>
                <p className="sidebar-card-subtitle">11 mandatory declarations under LMPC Rules, 2011</p>
              </div>
            </div>
            
            <div className="upload-page__checks-list">
              {CHECKS_SUMMARY.map((c) => (
                <div key={c.id} className="upload-page__check-item">
                  <span className="upload-page__check-id font-mono">{c.id}</span>
                  <span className="upload-page__check-name">{c.name}</span>
                </div>
              ))}
            </div>
            <p className="upload-page__scope-note">
              Checks cover Chapter II, Rules 6–17 of the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>
          </div>

          <div className="upload-page__tips card-sm relative-card">
            <TargetIcon className="watermark-icon" />
            <div className="sidebar-card-header">
              <div className="sidebar-card-icon icon-yellow"><LightbulbIcon /></div>
              <div>
                <h2 className="sidebar-card-title">Tips for Best Results</h2>
                <p className="sidebar-card-subtitle">Follow these tips for accurate analysis</p>
              </div>
            </div>
            
            <ul className="upload-page__tips-list">
              <li>Photograph the front label flat under good lighting</li>
              <li>Ensure all text is in focus and legible</li>
              <li>Measure and enter the label's physical width for font-size checks</li>
              <li>PDF artwork gives the most precise geometry results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const CHECKS_SUMMARY = [
  { id: 'R1', name: 'Manufacturer name + address' },
  { id: 'R2', name: 'Generic commodity name' },
  { id: 'R3', name: 'Net quantity in correct unit' },
  { id: 'R4', name: 'Month & year of manufacture' },
  { id: 'R5', name: 'MRP prescribed wording' },
  { id: 'R6', name: 'Consumer care details' },
  { id: 'R7', name: 'Language (Hindi/English)' },
  { id: 'R8', name: 'Minimum numeral height' },
  { id: 'R9', name: 'Clear space around quantity' },
  { id: 'R10', name: 'Numeral contrast' },
  { id: 'R11', name: 'No misleading qualifiers' },
];

function SettingsIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function ShieldIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

function DocIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}

function DocSearchIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="M13.25 16.25 15 18"/></svg>;
}

function LightbulbIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
}

function TargetIcon({ className }: { className?: string }) {
  return <svg className={className} width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}

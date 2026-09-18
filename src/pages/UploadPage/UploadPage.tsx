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
          <div className="upload-page__header">
            <h1 className="upload-page__title">Scan a <span className="text-gradient">Label</span></h1>
            <p className="upload-page__subtitle">
              Upload a packaged commodity label image or PDF. The system extracts mandatory declarations,
              validates them against the Legal Metrology (Packaged Commodities) Rules, 2011,
              and generates an annotated compliance report.
            </p>
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
            <h2 className="upload-page__info-title">What we check</h2>
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

          <div className="upload-page__tips card-sm">
            <h2 className="upload-page__info-title">For best results</h2>
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

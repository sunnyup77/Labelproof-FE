import { useState, useRef, useCallback } from 'react';
import { MAX_FILE_SIZE_BYTES, getContentType } from '../../api/upload';
import { formatBytes } from '../../utils/status';
import './UploadDropzone.css';

interface UploadDropzoneProps {
  onFileSelect: (file: File, labelWidthMm?: number) => void;
  isUploading?: boolean;
  uploadPhase?: 'requesting' | 'uploading' | 'done' | null;
  error?: string | null;
}

export function UploadDropzone({ onFileSelect, isUploading, uploadPhase, error }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [labelWidthMm, setLabelWidthMm] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!getContentType(file)) {
      return `Unsupported file type "${file.type}". Please use JPEG, PNG, or PDF.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File too large (${formatBytes(file.size)}). Maximum is 20 MB.`;
    }
    return null;
  }, []);

  const handleFileChosen = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) {
      setValidationError(err);
      setSelectedFile(null);
      return;
    }
    setValidationError(null);
    setSelectedFile(file);
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChosen(file);
  }, [handleFileChosen]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChosen(file);
  }, [handleFileChosen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const widthNum = labelWidthMm.trim() ? parseFloat(labelWidthMm) : undefined;
    if (labelWidthMm.trim() && (isNaN(widthNum!) || widthNum! <= 0)) {
      setValidationError('Label width must be a positive number in mm.');
      return;
    }
    setValidationError(null);
    onFileSelect(selectedFile, widthNum);
  };

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="upload-form" noValidate>
      {/* Drop zone */}
      <div
        className={`dropzone ${dragging ? 'dropzone--dragging' : ''} ${selectedFile ? 'dropzone--has-file' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Drop label image or PDF here, or click to browse"
        onKeyDown={e => e.key === 'Enter' && !selectedFile && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={handleInputChange}
          className="dropzone__input"
          aria-hidden="true"
          tabIndex={-1}
          id="file-input"
        />

        {!selectedFile ? (
          <div className="dropzone__prompt">
            <CloudUploadIcon />
            <div className="dropzone__title">Drop your label image or PDF here</div>
            <div className="dropzone__sub">or click to browse</div>
            <div className="dropzone__choose-btn">
              <DocIconSmall /> Choose File
            </div>
            <div className="dropzone__sub mt-auto">Supports JPEG, PNG, PDF - Max size 20 MB</div>
            <div className="dropzone__arrow">Drag & drop<br/>or click to upload ⤵</div>
            
            <div className="dropzone__watermarks">
              <div className="watermark watermark-pdf">PDF</div>
              <div className="watermark watermark-img">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="dropzone__file-info">
            <div className="dropzone__file-icon" aria-hidden="true">
              {selectedFile.type === 'application/pdf' ? '📄' : '🖼'}
            </div>
            <div className="dropzone__file-details">
              <div className="dropzone__file-name">{selectedFile.name}</div>
              <div className="dropzone__file-meta">
                {formatBytes(selectedFile.size)} · {selectedFile.type}
              </div>
            </div>
            <button
              type="button"
              className="dropzone__remove-btn"
              onClick={e => { e.stopPropagation(); setSelectedFile(null); setValidationError(null); }}
              aria-label="Remove selected file"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Optional label width input */}
      <div className="form-field upload-width-field">
        <label className="form-label" htmlFor="label-width">
          Label physical width (mm)
          <span className="upload-width-field__opt"> Optional — enables font-size check (R8)</span>
        </label>
        
        <div className="input-wrapper">
          <PencilIcon />
          <input
            type="number"
            id="label-width"
            className="form-input upload-width-input"
            placeholder="e.g. 90"
            min="1"
            max="9999"
            step="any"
            value={labelWidthMm}
            onChange={e => setLabelWidthMm(e.target.value)}
            disabled={isUploading}
            aria-describedby="label-width-hint"
          />
          <span className="input-suffix">mm</span>
        </div>
        
        <span id="label-width-hint" className="form-hint">
          Measure the physical width in millimetres of the front label as photographed. Leave blank for PDF labels or if unknown (R8 returns N/A without this).
        </span>
      </div>

      {/* Error */}
      {displayError && (
        <div className="upload-error" role="alert">
          <span aria-hidden="true">⚠</span> {displayError}
        </div>
      )}

      {/* Progress */}
      {isUploading && uploadPhase && (
        <div className="upload-progress" role="status" aria-live="polite">
          <div className="upload-progress__bar">
            <div className={`upload-progress__fill upload-progress__fill--${uploadPhase}`} />
          </div>
          <div className="upload-progress__label">
            {uploadPhase === 'requesting' && 'Requesting upload slot…'}
            {uploadPhase === 'uploading'  && 'Uploading to S3…'}
            {uploadPhase === 'done'       && 'Upload complete — starting analysis…'}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="btn btn-analyse w-full"
        disabled={!selectedFile || isUploading}
        id="upload-submit-btn"
      >
        {isUploading ? (
          <>
            <span className="btn-spinner" aria-hidden="true" />
            Uploading…
          </>
        ) : (
          <>
            <LightningIcon />
            Analyse Label
            <ArrowRightIcon />
          </>
        )}
      </button>
    </form>
  );
}

function CloudUploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--color-accent-hover)" stroke="var(--color-accent-hover)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: 'var(--space-2)'}}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="none"/>
      <path d="M12 15V8" stroke="#fff" strokeWidth="2"/>
      <path d="M9 11l3-3 3 3" stroke="#fff" strokeWidth="2"/>
    </svg>
  );
}

function DocIconSmall() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}

function PencilIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
}

function LightningIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}

function ArrowRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}

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
            <div className="dropzone__icon" aria-hidden="true">📷</div>
            <div className="dropzone__title">Drop label image or PDF here</div>
            <div className="dropzone__sub">or click to browse · JPEG, PNG, PDF · max 20 MB</div>
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
          <span className="upload-width-field__opt"> — optional, enables font-size check (R8)</span>
        </label>
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
        <span id="label-width-hint" className="form-hint">
          Measure the physical width in millimetres of the front label as photographed.
          Leave blank for PDF labels or if unknown (R8 returns N/A without this).
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
        className="btn btn-primary btn-lg w-full"
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
            <span aria-hidden="true">⚡</span>
            Analyse Label
          </>
        )}
      </button>
    </form>
  );
}

import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function LoadingSpinner({ size = 'md', label = 'Loading…' }: LoadingSpinnerProps) {
  return (
    <div className={`spinner-wrapper spinner-wrapper--${size}`} role="status">
      <div className="spinner" aria-hidden="true" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}

interface PageLoadingProps { message?: string; }
export function PageLoading({ message = 'Loading…' }: PageLoadingProps) {
  return (
    <div className="page-loading">
      <LoadingSpinner size="lg" label={message} />
    </div>
  );
}

import { ApiRequestError } from '../../api/client';
import './ErrorState.css';

interface ErrorStateProps {
  error: Error | ApiRequestError | null;
  title?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, title = 'Something went wrong', onRetry }: ErrorStateProps) {
  const isNotFound = error instanceof ApiRequestError && error.status === 404;
  const isNetwork  = error instanceof TypeError && error.message.includes('fetch');

  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden="true">
        {isNotFound ? '🔍' : isNetwork ? '📡' : '⚠'}
      </div>
      <div className="error-state__title">{isNotFound ? 'Not found' : title}</div>
      <div className="error-state__message">
        {isNotFound
          ? 'The requested scan does not exist.'
          : isNetwork
            ? 'Unable to reach the server. Check your connection.'
            : error?.message || 'An unexpected error occurred.'}
      </div>
      {error instanceof ApiRequestError && error.code && (
        <div className="error-state__code">Error code: {error.code}</div>
      )}
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">📋</div>
      <div className="empty-state__title">{title}</div>
      {description && <div className="empty-state__description">{description}</div>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}



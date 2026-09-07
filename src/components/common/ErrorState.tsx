import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="fm-error-state">
      <AlertCircle size={40} strokeWidth={1.5} aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{
            borderColor: 'var(--color-fm-danger)',
            color: 'var(--color-fm-danger)',
          }}
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}

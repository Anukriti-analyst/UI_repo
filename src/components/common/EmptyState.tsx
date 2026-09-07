import { FileX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="fm-empty-state">
      <FileX
        size={48}
        strokeWidth={1.5}
        style={{ color: 'var(--color-fm-border)' }}
        aria-hidden="true"
      />
      <div>
        <p className="text-base font-medium" style={{ color: 'var(--color-fm-navy)' }}>
          {title}
        </p>
        {description && (
          <p className="text-sm mt-1" style={{ color: 'var(--color-fm-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--color-fm-navy)' }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-fm-navy-dark)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-fm-navy)')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

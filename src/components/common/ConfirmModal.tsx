import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  /* Trap focus & close on Escape */
  useEffect(() => {
    confirmRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="fm-modal max-w-md">
        <div className="fm-modal-header">
          <h2 id="confirm-title" className="text-base font-semibold" style={{ color: 'var(--color-fm-navy)' }}>
            {title}
          </h2>
        </div>
        <div className="fm-modal-body">
          <p className="text-sm" style={{ color: '#000000' }}>{message}</p>
        </div>
        <div className="fm-modal-footer">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--color-fm-border)', color: 'var(--color-fm-navy)' }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: danger ? 'var(--color-fm-danger)' : 'var(--color-fm-navy)',
            }}
          >
            {isLoading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

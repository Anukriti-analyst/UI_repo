/**
 * ToastContainer — renders the global notification toasts via React portal.
 * Positioned fixed top-right, stacked. Reads from NotificationContext.
 * Rendered once inside AppShell so toasts always display above all other UI.
 */
import { createPortal } from 'react-dom';
import { useNotification } from '@/context/NotificationContext';
import type { Toast } from '@/context/NotificationContext';

const ICON: Record<Toast['type'], string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
};

const STYLES: Record<Toast['type'], { bar: string; icon: string; bg: string }> = {
  success: {
    bg:   'bg-white border-l-4 border-[#16B041]',
    bar:  'text-[#16B041]',
    icon: 'text-[#16B041]',
  },
  error: {
    bg:   'bg-white border-l-4 border-[#DD2647]',
    bar:  'text-[#DD2647]',
    icon: 'text-[#DD2647]',
  },
  info: {
    bg:   'bg-white border-l-4 border-[#0073E6]',
    bar:  'text-[#0073E6]',
    icon: 'text-[#0073E6]',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className={[
        'fixed z-50 flex flex-col gap-2',
        /* Top-right on desktop, full-width bottom on mobile */
        'bottom-20 left-4 right-4',
        'sm:top-20 sm:bottom-auto sm:left-auto sm:right-4 sm:w-80',
      ].join(' ')}
    >
      {toasts.map((toast) => {
        const s = STYLES[toast.type];
        return (
          <div
            key={toast.id}
            role="alert"
            className={[
              'flex items-start gap-3 px-4 py-3 rounded-lg shadow-md',
              'text-sm text-[#000000]',
              'animate-in slide-in-from-right duration-300',
              s.bg,
            ].join(' ')}
          >
            <span className={['shrink-0 font-bold mt-0.5', s.icon].join(' ')} aria-hidden="true">
              {ICON[toast.type]}
            </span>
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className={[
                'shrink-0 text-[#666666] hover:text-[#383B54]',
                'transition-colors duration-150 mt-0.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6] rounded',
              ].join(' ')}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

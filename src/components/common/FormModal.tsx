import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  onClose: () => void;
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

/** Selectors for focusable elements inside the modal */
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function FormModal({ title, children, footer, size = 'md', onClose }: FormModalProps) {
  const modalRef  = useRef<HTMLDivElement>(null);
  const closeRef  = useRef<HTMLButtonElement>(null);

  /* Auto-focus close button on open; restore focus on close */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    /* Small tick to let DOM render before focusing */
    const timer = requestAnimationFrame(() => {
      /* Try to focus first focusable content element, fall back to close button */
      const first = modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)[0];
      (first ?? closeRef.current)?.focus();
    });
    return () => {
      cancelAnimationFrame(timer);
      previouslyFocused?.focus();
    };
  }, []);

  /* Keyboard: Escape closes, Tab traps focus within modal */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') return;

      const focusables = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((el) => !el.closest('[aria-hidden="true"]'));

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last  = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    },
    [onClose],
  );

  return (
    /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
    <div
      className="fm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop click closes */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        className={`fm-modal ${sizeMap[size]} relative w-full`}
      >
        <div className="fm-modal-header">
          <h2 id="modal-title" className="text-base font-semibold" style={{ color: 'var(--color-fm-navy)' }}>
            {title}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="p-1.5 rounded transition-colors hover:bg-[#F2F2F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="fm-modal-body">{children}</div>

        {footer && <div className="fm-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

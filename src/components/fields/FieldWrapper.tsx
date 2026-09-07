import type { ReactNode } from 'react';

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  htmlFor?: string;
  children: ReactNode;
}

/**
 * Wraps every form field with a consistent label → control → helper/error layout.
 * Used by ALL field components — never render a raw rds-input without this wrapper.
 */
export function FieldWrapper({
  label,
  required,
  error,
  helpText,
  htmlFor,
  children,
}: FieldWrapperProps) {
  return (
    <div className="fm-field">
      <div className="flex items-center">
        <label className="fm-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="fm-required-star" aria-hidden="true">*</span>}
        </label>
        {!error && helpText && (
          <span className="fm-helper-inline" id={htmlFor ? `${htmlFor}-help` : undefined} style={{ marginLeft: '0.5rem', fontStyle: 'italic', color: 'var(--color-fm-muted)', fontSize: '0.75rem' }}>
            {' - '}{helpText}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="fm-error-text" id={htmlFor ? `${htmlFor}-error` : undefined} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

import { useId } from 'react';

import { FieldWrapper } from './FieldWrapper';

interface ToggleInputProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
}

export function ToggleInput({
  label, value, onChange, onBlur,
  required, disabled, error, helpText,
}: ToggleInputProps) {
  const id = useId();

  return (
    <FieldWrapper label={label} required={required} error={error} helpText={helpText}>
      <label
        htmlFor={id}
        className={[
          'inline-flex items-center gap-3 cursor-pointer select-none',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={value}
          aria-required={required}
          disabled={disabled}
          onBlur={onBlur}
          onClick={() => onChange(!value)}
          className={[
            'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent',
            'transition-colors duration-200 ease-in-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
            'disabled:cursor-not-allowed',
            value ? 'bg-[#0073E6]' : 'bg-[#E0E0E5]',
          ].join(' ')}
        >
          <span
            aria-hidden="true"
            className={[
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm',
              'transform transition duration-200 ease-in-out',
              value ? 'translate-x-5' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
        <span className="text-sm" style={{ color: 'var(--color-fm-navy)' }}>
          {value ? 'Yes' : 'No'}
        </span>
      </label>
    </FieldWrapper>
  );
}

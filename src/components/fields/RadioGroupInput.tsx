import { useId } from 'react';

import { FieldWrapper } from './FieldWrapper';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: RadioOption[];
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
}

export function RadioGroupInput({
  label, value, onChange, onBlur, options,
  orientation = 'vertical', required, disabled, error, helpText,
}: RadioGroupInputProps) {
  const id = useId();

  return (
    <FieldWrapper label={label} required={required} error={error} helpText={helpText}>
      <div
        role="radiogroup"
        aria-required={required}
        aria-invalid={!!error}
        className={[
          'flex gap-4 flex-wrap',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
        ].join(' ')}
        onBlur={onBlur}
      >
        {options.map((opt) => {
          const optId = `${id}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={[
                'inline-flex items-center gap-2 cursor-pointer select-none text-sm',
                (disabled || opt.disabled) ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
              style={{ color: 'var(--color-fm-navy)' }}
            >
              <input
                id={optId}
                type="radio"
                name={id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                disabled={disabled || opt.disabled}
                required={required}
                className="accent-[#0073E6] w-4 h-4"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}

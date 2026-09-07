import { useId } from 'react';

import { FieldWrapper } from './FieldWrapper';

interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CheckboxGroupInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  options: CheckboxOption[];
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
}

export function CheckboxGroupInput({
  label, value, onChange, onBlur, options,
  orientation = 'vertical', required, disabled, error, helpText,
}: CheckboxGroupInputProps) {
  const id = useId();

  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  return (
    <FieldWrapper label={label} required={required} error={error} helpText={helpText}>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        className={[
          'flex gap-3 flex-wrap',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
        ].join(' ')}
        onBlur={onBlur}
      >
        {options.map((opt) => {
          const optId = `${id}-${opt.value}`;
          const isChecked = value.includes(opt.value);
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
                type="checkbox"
                value={opt.value}
                checked={isChecked}
                onChange={() => toggle(opt.value)}
                disabled={disabled || opt.disabled}
                className="accent-[#0073E6] w-4 h-4 rounded"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
}

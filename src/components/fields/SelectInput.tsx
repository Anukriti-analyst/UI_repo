import { useId } from 'react';

import { FieldWrapper } from './FieldWrapper';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
}

export function SelectInput({
  label, value, onChange, onBlur, options,
  placeholder, required, disabled, error, helpText,
}: SelectInputProps) {
  const id = useId();

  const inputClass = [
    'fm-input',
    error && 'border-[#DD2647] focus:border-[#DD2647] focus:ring-[#DD2647]',
  ].filter(Boolean).join(' ');

  return (
    <FieldWrapper label={label} required={required} error={error} helpText={helpText} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        className={inputClass}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

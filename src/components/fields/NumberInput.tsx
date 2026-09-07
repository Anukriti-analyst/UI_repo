import { useId } from 'react';

import { FieldWrapper } from './FieldWrapper';

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  min?: string;
  max?: string;
}

export function NumberInput({
  label, value, onChange, onBlur, required, disabled,
  error, helpText, placeholder, min, max,
}: NumberInputProps) {
  const id = useId();

  const inputClass = [
    'fm-input',
    error && 'border-[#DD2647] focus:border-[#DD2647] focus:ring-[#DD2647]',
  ].filter(Boolean).join(' ');

  return (
    <FieldWrapper label={label} required={required} error={error} helpText={helpText} htmlFor={id}>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        className={inputClass}
      />
    </FieldWrapper>
  );
}

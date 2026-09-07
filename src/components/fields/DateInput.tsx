import { useId } from 'react';

import { FieldWrapper } from './FieldWrapper';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  min?: string;
  max?: string;
}

export function DateInput({
  label, value, onChange, onBlur,
  required, disabled, error, helpText, min, max,
}: DateInputProps) {
  const id = useId();

  const inputClass = [
    'fm-input',
    error && 'border-[#DD2647] focus:border-[#DD2647] focus:ring-[#DD2647]',
  ].filter(Boolean).join(' ');

  return (
    <FieldWrapper label={label} required={required} error={error} helpText={helpText} htmlFor={id}>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
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

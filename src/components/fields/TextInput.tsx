import { useId } from 'react';

import { FieldWrapper } from './FieldWrapper';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'url';
  multiline?: boolean;
}

export function TextInput({
  label, value, onChange, onBlur, required, disabled,
  error, helpText, placeholder, type = 'text', multiline = false,
}: TextInputProps) {
  const id = useId();

  const inputClass = [
    'fm-input',
    error && 'border-[#DD2647] focus:border-[#DD2647] focus:ring-[#DD2647]',
  ].filter(Boolean).join(' ');

  return (
    <FieldWrapper label={label} required={required} error={error} helpText={helpText} htmlFor={id}>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={inputClass}
          rows={4}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={inputClass}
        />
      )}
    </FieldWrapper>
  );
}

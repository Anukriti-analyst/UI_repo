import { useEffect, useMemo, useState } from 'react';
import { useWatch, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { FormDefinitionQuestionDto } from '@/api/types/form.types';
import { TextInput } from '@/components/fields/TextInput';
import { NumberInput } from '@/components/fields/NumberInput';
import { SelectInput } from '@/components/fields/SelectInput';
import { RadioGroupInput } from '@/components/fields/RadioGroupInput';
import { CheckboxGroupInput } from '@/components/fields/CheckboxGroupInput';
import { ToggleInput } from '@/components/fields/ToggleInput';
import { DateInput } from '@/components/fields/DateInput';

const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No',  label: 'No' },
];

interface QuestionRendererProps<T extends FieldValues> {
  question: FormDefinitionQuestionDto;
  control: Control<T>;
  /** Name prefix for nested form fields, e.g. "sections.0.answers" */
  namePrefix: string;
  /** Index of this question within its section */
  index: number;
  /** Options for Select/MultiSelect/Radio questions (from category data) */
  options?: { value: string; label: string }[];
}

/**
 * THE central component that maps a FormDefinitionQuestionDto to a UI field.
 * This is the ONLY place where questionType + renderHint → component logic lives.
 * Never duplicate this mapping elsewhere.
 */
export function QuestionRenderer<T extends FieldValues>({
  question,
  control,
  namePrefix,
  index,
  options = [],
}: QuestionRendererProps<T>) {
  const fieldName = `${namePrefix}.${index}.answerValue` as Path<T>;

  /* Derive options: prefer question.options[], fall back to prop */
  const resolvedOptions = useMemo(() => {
    const qOpts = question.options ?? [];
    if (qOpts.length > 0) {
      return qOpts
        .filter((o) => o.isActive !== false)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((o) => ({ value: o.optionValue, label: o.optionText }));
    }
    return options;
  }, [question.options, options]);

  /* Render the correct field component */
  const renderField = (value: string, onChange: (v: string) => void, onBlur: () => void, error?: string) => {
    const common = {
      label: question.questionText,
      helpText: question.description ?? undefined,
      value,
      onChange,
      onBlur,
      required: question.isRequired,
      error,
    };

    switch (question.questionType) {
      case 'Text':
        return <TextInput {...common} multiline={question.questionText.toLowerCase().includes('description') || question.questionText.length > 60} />;

      case 'Number':
        return <NumberInput {...common} />;

      case 'Date':
        return <DateInput {...common} />;

      case 'Boolean':
      case 'YesNo':
        switch (question.renderHint) {
          case 'toggle':
            return (
              <ToggleInput
                {...common}
                value={value === 'true'}
                onChange={(v) => onChange(String(v))}
              />
            );
          case 'checkbox':
            // Single checkbox — value is 'true' when checked
            return (
              <BooleanCheckboxInput
                {...common}
                value={value === 'true'}
                onChange={(v) => onChange(String(v))}
              />
            );
          case 'radio':
          default:
            // 'radio' or null → Yes/No radio buttons
            return (
              <RadioGroupInput
                {...common}
                options={YES_NO_OPTIONS}
                orientation="horizontal"
              />
            );
        }

      case 'Select':
        if (question.renderHint === 'radio') {
          return (
            <RadioGroupInput
              {...common}
              options={resolvedOptions}
              orientation="vertical"
            />
          );
        }
        return (
          <SelectInput
            {...common}
            options={resolvedOptions}
            placeholder="Select an option…"
          />
        );

      case 'MultiSelect':
        return (
          <CheckboxGroupInput
            {...common}
            value={value ? value.split(',') : []}
            onChange={(vals) => onChange(vals.join(','))}
            options={resolvedOptions}
          />
        );

      default:
        return <TextInput {...common} />;
    }
  };

  return (
    <div className="fm-section">
      {/* Main question */}
      <Controller
        name={fieldName}
        control={control}
        rules={{ required: question.isRequired ? `${question.questionText} is required` : false }}
        render={({ field, fieldState }) =>
          renderField(
            field.value as string ?? '',
            field.onChange,
            field.onBlur,
            fieldState.error?.message,
          )
        }
      />

      {/* Conditional sub-questions */}
      {(question.subQuestions ?? []).map((sub, sIdx) => (
        <ConditionalSubQuestion
          key={sub.subQuestionId}
          subQuestion={sub}
          parentFieldName={fieldName}
          control={control}
          namePrefix={`${namePrefix}.${index}.subAnswers`}
          subIndex={sIdx}
        />
      ))}
    </div>
  );
}

/* ─── Internal: single checkbox for Boolean + renderHint="checkbox" ── */
interface BooleanCheckboxInputProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
}

function BooleanCheckboxInput({ label, value, onChange, onBlur, required, disabled, error, helpText }: BooleanCheckboxInputProps) {
  const id = `bc-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="fm-field">
      <label
        htmlFor={id}
        className={[
          'inline-flex items-center gap-2 cursor-pointer select-none text-sm fm-label',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          aria-required={required}
          aria-invalid={!!error}
          className="accent-[#0073E6] w-4 h-4 rounded"
        />
        {label}
        {required && <span className="fm-required-star" aria-hidden="true">*</span>}
      </label>
      {helpText && (
        <p className="fm-helper-text">{helpText}</p>
      )}
      {error && (
        <p className="fm-error-text" role="alert">{error}</p>
      )}
    </div>
  );
}

/* ─── Internal: renders a sub-question when the parent answer matches triggerValue ── */
interface SubQuestionProps<T extends FieldValues> {
  subQuestion: FormDefinitionQuestionDto['subQuestions'][number];
  parentFieldName: Path<T>;
  control: Control<T>;
  namePrefix: string;
  subIndex: number;
}

function ConditionalSubQuestion<T extends FieldValues>({
  subQuestion,
  parentFieldName,
  control,
  namePrefix,
  subIndex,
}: SubQuestionProps<T>) {
  const parentValue = useWatch({ control, name: parentFieldName });
  const [visible, setVisible] = useState(false);

  /* All hooks MUST be above any early return */
  const resolvedOptions = useMemo(() => {
    const opts = subQuestion.options ?? [];
    return opts
      .filter((o) => (o as { isActive?: boolean }).isActive !== false)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((o) => ({ value: o.optionValue, label: o.optionText }));
  }, [subQuestion.options]);

  useEffect(() => {
    const matches = String(parentValue ?? '').toLowerCase() === subQuestion.triggerValue.toLowerCase();
    setVisible(matches);
  }, [parentValue, subQuestion.triggerValue]);

  if (!visible) return null;

  const subFieldName = `${namePrefix}.${subIndex}.answerValue` as Path<T>;
  const questionType = subQuestion.questionType ?? 'Text';

  return (
    <div className="fm-sub-question fm-sub-question-enter">
      <Controller
        name={subFieldName}
        control={control}
        render={({ field, fieldState }) => {
          const common = {
            label: subQuestion.subQuestionText,
            helpText: subQuestion.description ?? undefined,
            value: (field.value as string) ?? '',
            onChange: field.onChange,
            onBlur: field.onBlur,
            error: fieldState.error?.message,
          };

          switch (questionType) {
            case 'Number':
              return <NumberInput {...common} />;
            case 'Date':
              return <DateInput {...common} />;
            case 'Boolean':
            case 'YesNo':
              return <RadioGroupInput {...common} options={YES_NO_OPTIONS} orientation="horizontal" />;
            case 'Select':
              return resolvedOptions.length > 0
                ? <SelectInput {...common} options={resolvedOptions} placeholder="Select an option…" />
                : <TextInput {...common} />;
            case 'MultiSelect':
              return resolvedOptions.length > 0
                ? <CheckboxGroupInput
                    {...common}
                    value={common.value ? common.value.split(',') : []}
                    onChange={(vals) => field.onChange(vals.join(','))}
                    options={resolvedOptions}
                  />
                : <TextInput {...common} />;
            case 'Text':
            default:
              return <TextInput {...common} />;
          }
        }}
      />
    </div>
  );
}

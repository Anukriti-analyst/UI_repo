/**
 * WizardStep — renders all questions for a single form section.
 * Used inside FormWizard for each step.
 */
import type { Control, FieldValues } from 'react-hook-form';

import { QuestionRenderer } from '@/components/wizard/QuestionRenderer';
import type { FormDefinitionSectionDto } from '@/api/types/form.types';

interface WizardStepProps<T extends FieldValues> {
  section: FormDefinitionSectionDto;
  sectionIndex: number;
  control: Control<T>;
  /** Map of questionId → options for Select/MultiSelect questions */
  categoryOptions?: Record<number, { value: string; label: string }[]>;
}

export function WizardStep<T extends FieldValues>({
  section,
  sectionIndex,
  control,
  categoryOptions = {},
}: WizardStepProps<T>) {
  const sortedQuestions = section.questions
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);

  /**
   * Prevent duplicate rendering: if a question's text is already registered
   * as a sub-question of another question in this section, skip it as a
   * top-level question. The ConditionalSubQuestion inside QuestionRenderer
   * handles its conditional display.
   */
  const subQuestionTexts = new Set(
    sortedQuestions.flatMap((q) => (q.subQuestions ?? []).map((sq) => sq.subQuestionText))
  );
  const topLevelQuestions = sortedQuestions.filter(
    (q) => !subQuestionTexts.has(q.questionText)
  );

  return (
    <section
      aria-labelledby={`section-heading-${section.formSectionId}`}
      className="fm-section-gap"
    >
      <h2
        id={`section-heading-${section.formSectionId}`}
        className="fm-section-title"
      >
        {section.sectionName}
      </h2>

      {topLevelQuestions.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--color-fm-muted)' }}>
          No questions configured for this section.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedQuestions.map((question, originalIndex) => {
            if (subQuestionTexts.has(question.questionText)) return null;
            return (
              <QuestionRenderer
                key={question.formQuestionId}
                question={question}
                control={control}
                namePrefix={`sections.${sectionIndex}.answers`}
                index={originalIndex}
                options={categoryOptions[question.questionId]}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

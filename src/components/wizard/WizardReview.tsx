/**
 * WizardReview — final read-only step before submit.
 * Shows all sections and answers so the user can review before finalizing.
 */
import type { FormDefinitionDto } from '@/api/types/form.types';

interface AnswerMap {
  [sectionIndex: number]: {
    [questionIndex: number]: string;
  };
}

interface WizardReviewProps {
  definition: FormDefinitionDto;
  /** Flat answer map keyed by section/question index */
  answers: AnswerMap;
}

export function WizardReview({ definition, answers }: WizardReviewProps) {
  const sections = definition.sections
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="fm-section-gap">
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-lg border border-[#0073E6] bg-[#EFF6FE] text-sm mb-4"
        role="status"
      >
        <span className="text-[#0073E6] mt-0.5" aria-hidden="true">ℹ</span>
        <span style={{ color: '#003D8D' }}>
          Please review your answers below. Once submitted, this form cannot be edited.
        </span>
      </div>

      {sections.map((section, sIdx) => {
        const sectionAnswers = answers[sIdx] ?? {};
        const sortedQuestions = section.questions
          .slice()
          .sort((a, b) => a.displayOrder - b.displayOrder);

        return (
          <div key={section.formSectionId} className="fm-card">
            <div className="fm-card-header">
              <h3 className="fm-section-title mb-0">{section.sectionName}</h3>
            </div>
            <div className="fm-card-body">
              {sortedQuestions.length === 0 ? (
                <p className="text-sm italic" style={{ color: 'var(--color-fm-muted)' }}>
                  No questions in this section.
                </p>
              ) : (
                <dl className="divide-y divide-[#E0E0E5]">
                  {sortedQuestions.map((question, qIdx) => {
                    const rawAnswer = sectionAnswers[qIdx];
                    const displayAnswer = rawAnswer && rawAnswer.trim() !== ''
                      ? rawAnswer
                      : null;

                    return (
                      <div key={question.formQuestionId} className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <dt className="text-sm font-medium" style={{ color: 'var(--color-fm-navy)' }}>
                          {question.questionText}
                          {question.isRequired && (
                            <span className="ml-1 text-[#DD2647]" aria-label="required">*</span>
                          )}
                        </dt>
                        <dd
                          className="text-sm"
                          style={{ color: displayAnswer ? '#000000' : 'var(--color-fm-muted)' }}
                        >
                          {displayAnswer ?? <em>Not answered</em>}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

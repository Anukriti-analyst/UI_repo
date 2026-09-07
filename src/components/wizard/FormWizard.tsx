/**
 * FormWizard — multi-step form container.
 *
 * Responsibilities:
 * - Manages step state (current section index)
 * - Drives React Hook Form for all section answers
 * - Calls PUT /submissions/{id}/answers on Save Draft / Save & Continue
 * - Shows WizardProgress stepper at top
 * - Renders WizardStep (section questions) or WizardReview (final step)
 * - Handles Submit confirmation + POST /submissions/{id}/submit
 * - Auto-save on answer change (debounced 2s)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm }     from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { WizardProgress } from '@/components/wizard/WizardProgress';
import { WizardStep }     from '@/components/wizard/WizardStep';
import { WizardReview }   from '@/components/wizard/WizardReview';
import { ConfirmModal }   from '@/components/common/ConfirmModal';
import { useNotification } from '@/context/NotificationContext';
import {
  useSaveAnswers,
  useSubmitSubmission,
} from '@/hooks/useSubmissions';
import { useCategoryGroupsByVersionWithValues } from '@/hooks/useCategories';
import type { FormDefinitionDto, FormDefinitionSectionDto } from '@/api/types/form.types';
import type { SaveAnswersRequest, SubmissionSectionDto } from '@/api/types/submission.types';

/* ── Wizard answer shape (mirrors SaveAnswersRequest) ─────────── */
interface SectionAnswerField {
  sectionName:  string;
  displayOrder: number;
  answers: {
    questionText: string;
    answerValue:  string | null;
    subAnswers?: { answerValue: string | null }[];
  }[];
}

export interface WizardFormValues {
  sections: SectionAnswerField[];
}

interface FormWizardProps {
  definition:   FormDefinitionDto;
  submissionId: string;
  /** When true (admin preview) skip field validation so all sections are freely navigable */
  isPreview?:   boolean;
  /** Previously saved sections (from SubmissionDetailDto) to pre-populate answers */
  savedSections?: SubmissionSectionDto[];
}

const AUTOSAVE_DELAY_MS = 2_000;

export function FormWizard({ definition, submissionId, savedSections, isPreview = false }: FormWizardProps) {
  const navigate     = useNavigate();
  const { showToast } = useNotification();

  /* Sort sections by displayOrder once */
  const sections: FormDefinitionSectionDto[] = (definition.sections ?? [])
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const totalSteps = sections.length + 1; // +1 for Review
  const reviewIndex = sections.length;

  const [currentStep,    setCurrentStep]    = useState(0);
  const [isSaving,       setIsSaving]       = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  /* ── Build default values, merging saved answers if available ───── */
  const buildDefaultValues = (): WizardFormValues => {
    // Build a lookup: sectionName → { questionText → answerValue }
    const savedLookup: Record<string, Record<string, string | null>> = {};
    if (savedSections) {
      for (const savedSection of savedSections) {
        const answerMap: Record<string, string | null> = {};
        for (const answer of (savedSection.answers ?? [])) {
          answerMap[answer.questionText] = answer.answerValue;
        }
        savedLookup[savedSection.sectionName] = answerMap;
      }
    }

    return {
      sections: sections.map((s) => {
        const savedAnswerMap = savedLookup[s.sectionName] ?? {};
        return {
          sectionName: s.sectionName,
          displayOrder: s.displayOrder,
          answers: (s.questions ?? [])
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((q) => ({
              questionText: q.questionText,
              answerValue: savedAnswerMap[q.questionText] ?? null,
            })),
        };
      }),
    };
  };

  /* ── React Hook Form ───────────────────────────────────────────── */
  const {
    control,
    getValues,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<WizardFormValues>({
    defaultValues: buildDefaultValues(),
    mode: 'onBlur',
  });

  /**
   * Re-populate form values when savedSections arrives after initial render.
   * This handles the case where React Query serves stale (empty) cached data
   * first, then the background refetch returns the actual saved answers.
   * We only apply once per non-empty savedSections to avoid overwriting
   * in-progress user edits.
   */
  const hasAppliedSaved = useRef(false);
  useEffect(() => {
    if (savedSections && savedSections.length > 0 && !hasAppliedSaved.current) {
      hasAppliedSaved.current = true;
      reset(buildDefaultValues());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedSections]);

  /* ── API mutations ─────────────────────────────────────────────── */
  const { mutate: saveAnswers }  = useSaveAnswers(submissionId);
  const { mutate: submitMutation, isPending: isSubmitting } = useSubmitSubmission(submissionId);

  /* ── Category options for Select/MultiSelect questions ──────────── */
  const { data: categoryGroups } = useCategoryGroupsByVersionWithValues(definition.formVersionId);

  const categoryOptions = useMemo<Record<number, { value: string; label: string }[]>>(() => {
    if (!categoryGroups) return {};
    const map: Record<number, { value: string; label: string }[]> = {};
    for (const group of categoryGroups) {
      const categories = group.categories ?? [];
      for (const cat of categories) {
        const values = cat.values ?? [];
        const options = values.map((v) => ({
          value: v.textValue ?? v.numericValue?.toString() ?? cat.categoryKey,
          label: v.textValue ?? (`${v.numericValue ?? ''} ${v.unit ?? ''}`.trim() || cat.displayName || cat.categoryKey),
        }));
        // Use categoryId as lookup key; questions reference categories by convention
        map[cat.categoryId] = options;
      }
      // Also build a flat list keyed by group name (fallback for question matching)
      const allValues = categories.flatMap((cat) =>
        (cat.values ?? []).map((v) => ({
          value: v.textValue ?? v.numericValue?.toString() ?? cat.categoryKey,
          label: v.textValue ?? cat.displayName ?? cat.categoryKey,
        }))
      );
      if (allValues.length > 0) {
        // Key by groupId offset to avoid collision with categoryId
        map[-group.categoryGroupId] = allValues;
      }
    }
    return map;
  }, [categoryGroups]);

  /* ── Build SaveAnswersRequest from form values ─────────────────── */
  const buildSavePayload = useCallback((): SaveAnswersRequest | null => {
    const values = getValues();
    const sections = values.sections
      .map((s) => ({
        sectionName:  s.sectionName,
        displayOrder: s.displayOrder,
        // Only include answers that have a non-null, non-empty value
        answers: s.answers
          .filter((a) => a.answerValue !== null && a.answerValue !== '')
          .map((a) => ({
            questionText: a.questionText,
            answerValue:  a.answerValue ?? null,
          })),
      }))
      // Only include sections that have at least one answered question
      .filter((s) => s.answers.length > 0);

    // Nothing answered yet — skip the API call
    if (sections.length === 0) return null;

    return { sections };
  }, [getValues]);

  /* ── Auto-save (debounced) ─────────────────────────────────────── */
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = watch(() => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        const payload = buildSavePayload();
        if (payload) {
          saveAnswers(payload, {
            onError: () => { /* silent auto-save failure — don't toast */ },
          });
        }
      }, AUTOSAVE_DELAY_MS);
    });
    return () => {
      subscription.unsubscribe();
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [watch, saveAnswers, buildSavePayload]);

  /* ── Manual save ───────────────────────────────────────────────── */
  const handleSaveDraft = () => {
    const payload = buildSavePayload();
    if (!payload) {
      showToast('info', 'No answers to save yet.');
      return;
    }
    setIsSaving(true);
    saveAnswers(payload, {
      onSuccess: () => {
        showToast('success', 'Draft saved.');
        setIsSaving(false);
      },
      onError: () => {
        showToast('error', 'Could not save draft. Please try again.');
        setIsSaving(false);
      },
    });
  };

  /* ── Save & Continue ───────────────────────────────────────────── */
  const handleNext = async () => {
    /* Skip validation entirely in preview mode */
    if (!isPreview && currentStep < reviewIndex) {
      const sectionFieldPrefix = `sections.${currentStep}.answers` as const;
      const isValid = await trigger(sectionFieldPrefix as Parameters<typeof trigger>[0]);
      if (!isValid) {
        showToast('info', 'Please fill in all required fields before continuing.');
        return;
      }
    }

    /* Save current answers */
    setIsSaving(true);
    const payload = buildSavePayload();
    if (!payload) {
      // Nothing answered yet — just advance without saving
      setIsSaving(false);
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    saveAnswers(payload, {
      onSuccess: () => {
        setIsSaving(false);
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        showToast('error', 'Could not save answers. Please try again.');
        setIsSaving(false);
      },
    });
  };

  /* ── Back ──────────────────────────────────────────────────────── */
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Submit ────────────────────────────────────────────────────── */
  const handleSubmit = () => {
    submitMutation(undefined, {
      onSuccess: () => {
        showToast('success', 'Form submitted successfully!');
        setShowSubmitModal(false);
        navigate('/');
      },
      onError: () => {
        showToast('error', 'Submission failed. Please try again.');
        setShowSubmitModal(false);
      },
    });
  };

  /* ── Build stepper steps ───────────────────────────────────────── */
  const steps = [
    ...sections.map((s, i) => ({
      label:      s.sectionName,
      isComplete: i < currentStep,
      isActive:   i === currentStep,
    })),
    {
      label:      'Review',
      isComplete: false,
      isActive:   currentStep === reviewIndex,
    },
  ];

  const isReviewStep = currentStep === reviewIndex;
  const isFirstStep  = currentStep === 0;

  /* Disable save/continue buttons if the current section has validation errors (not in preview) */
  const hasCurrentStepErrors = !isPreview && !isReviewStep &&
    !!errors.sections?.[currentStep] &&
    Object.keys(errors.sections[currentStep] ?? {}).length > 0;

  /* Build answer map for WizardReview */
  const answerMap: Record<number, Record<number, string>> = {};
  const vals = getValues();
  vals.sections.forEach((s, sIdx) => {
    answerMap[sIdx] = {};
    s.answers.forEach((a, aIdx) => {
      answerMap[sIdx][aIdx] = a.answerValue ?? '';
    });
  });

  /* ── Limits panel toggle ─────────────────────────────────────── */
  const [showLimitsPanel, setShowLimitsPanel] = useState(false);

  return (
    <div>
      {/* Stepper */}
      <WizardProgress steps={steps} currentIndex={currentStep} />

      {/* Reference Limits collapsible panel */}
      {categoryGroups && categoryGroups.length > 0 && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowLimitsPanel(!showLimitsPanel)}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#0057CA] hover:text-[#003D8F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6] rounded px-2 py-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
            </svg>
            {showLimitsPanel ? 'Hide Reference Limits' : 'View Reference Limits'}
          </button>

          {showLimitsPanel && (
            <div className="mt-2 rounded-lg border border-[#B8DCFA] bg-[#F8FBFF] p-4 max-h-[50vh] overflow-y-auto">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-fm-muted)' }}>
                Reference Limits &amp; Appendix Data
              </h3>
              <div className="space-y-3">
                {categoryGroups.map((group) => (
                  <WizardLimitsGroup key={group.categoryGroupId} group={group} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step content */}
      <div className="fm-card">
        <div className="fm-card-body">
          {isReviewStep ? (
            <WizardReview definition={definition} answers={answerMap} />
          ) : (
            <WizardStep
              section={sections[currentStep]}
              sectionIndex={currentStep}
              control={control}
              categoryOptions={categoryOptions}
            />
          )}
        </div>

        {/* Action bar */}
        <div className="fm-card-footer flex-col sm:flex-row gap-3">
          {/* Left: Save Draft (not on review) */}
          <div className="flex-1">
            {!isReviewStep && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving || hasCurrentStepErrors}
                className={[
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                  'border border-[#E0E0E5] text-[#383B54] bg-white',
                  'hover:bg-[#F2F2F5] transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                ].join(' ')}
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#383B54]/30 border-t-[#383B54] rounded-full animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </button>
            )}
          </div>

          {/* Right: Back + Next/Submit */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSaving}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium',
                  'border border-[#E0E0E5] text-[#383B54] bg-white',
                  'hover:bg-[#F2F2F5] transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
                  'disabled:opacity-50',
                ].join(' ')}
              >
                &larr; Back
              </button>
            )}

            {isReviewStep ? (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className={[
                  'inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium',
                  'bg-[#383B54] text-white hover:bg-[#0D102B]',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
                ].join(' ')}
              >
                Submit Form
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSaving || hasCurrentStepErrors}
                className={[
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                  'bg-[#383B54] text-white hover:bg-[#0D102B]',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                ].join(' ')}
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  currentStep === reviewIndex - 1
                    ? 'Review \u2192'
                    : 'Save & Continue \u2192'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validation error summary (only if errors exist) */}
      {Object.keys(errors).length > 0 && (
        <div
          className="mt-4 px-4 py-3 rounded-lg border border-[#DD2647] bg-[#FAE8ED] text-sm"
          role="alert"
        >
          <p className="font-medium text-[#DD2647]">
            Please correct the highlighted fields before continuing.
          </p>
        </div>
      )}

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <ConfirmModal
          title="Submit Form?"
          message="Once submitted, you cannot edit this form. Are you sure you want to proceed?"
          confirmLabel="Yes, Submit"
          isLoading={isSubmitting}
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
}

/* ── WizardLimitsGroup — compact display of category limits ────── */
function WizardLimitsGroup({ group }: { group: import('@/api/types/category.types').CategoryGroupDto }) {
  const categories = group.categories ?? [];
  if (categories.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-fm-navy)' }}>
        {group.groupName}
        <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-[#E8F4FD] text-[#0057CA] font-normal">{group.source}</span>
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {categories.map((cat) => {
          const values = cat.values ?? [];
          const primary = values[0];
          const displayValue = primary
            ? (primary.numericValue !== null
                ? `${primary.currency ? primary.currency + ' ' : ''}${primary.numericValue.toLocaleString()}${primary.unit ? ' ' + primary.unit : ''}`
                : primary.textValue ?? '—')
            : '—';

          return (
            <div key={cat.categoryId} className="flex items-baseline justify-between gap-2 px-2.5 py-1.5 rounded bg-white border border-[#E0E0E5]">
              <span className="text-xs font-medium truncate" style={{ color: 'var(--color-fm-navy)' }}>
                {cat.displayName || cat.categoryKey}
              </span>
              <span className="text-xs font-semibold shrink-0 text-[#0057CA]">
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

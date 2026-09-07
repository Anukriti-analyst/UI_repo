import { useState, useMemo }  from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient }    from '@tanstack/react-query';
import { Pencil, Trash2, Copy } from 'lucide-react';

import { PageHeading }      from '@/components/common/PageHeading';
import { BackToDashboardButton } from '@/components/common/BackToDashboardButton';
import { SkeletonLoader }   from '@/components/common/SkeletonLoader';
import { ErrorState }       from '@/components/common/ErrorState';
import { FormModal }        from '@/components/common/FormModal';
import { ConfirmModal }     from '@/components/common/ConfirmModal';
import { AdminMobileHint }  from '@/components/common/AdminMobileHint';
import { PrimaryButton }    from '@/components/common/PrimaryButton';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { INPUT_CLASS }      from '@/utils/constants';
import { usePageTitle }     from '@/hooks/usePageTitle';
import {
  useFormDefinition,
  useForms,
  useFormVersions,
  useAddSectionToVersion,
  useAddQuestionToSection,
  useUpdateFormQuestion,
  useRemoveFormQuestion,
  useUpdateFormSection,
  useRemoveFormSection,
  useCopyFormStructure,
} from '@/hooks/useForms';
import { useTerritories }   from '@/hooks/useTerritories';
import { useSections, useCreateSection } from '@/hooks/useSections';
import { useQuestions, useCreateQuestion } from '@/hooks/useQuestions';
import { useNotification }  from '@/context/NotificationContext';
import { useCreatePreviewSubmission } from '@/hooks/useSubmissions';
import type { FormDefinitionSectionDto, FormDefinitionQuestionDto } from '@/api/types/form.types';


export function FormBuilder() {
  const { formId: formIdParam, versionId: versionIdParam } = useParams<{ formId: string; versionId: string }>();
  const formId    = Number(formIdParam) || 0;
  const versionId = Number(versionIdParam) || 0;
  const navigate  = useNavigate();
  const { showToast } = useNotification();
  const queryClient   = useQueryClient();

  /* ── Data ────────────────────────────────────────────────────── */
  const { data: definition, isLoading, isError, error, refetch } = useFormDefinition(versionId);
  const { data: allSections } = useSections();
  const { data: allQuestions } = useQuestions();
  usePageTitle(definition ? `Builder: ${definition.formName}` : 'Form Builder');

  /* ── Mutations ───────────────────────────────────────────────── */
  const { mutate: addSection, isPending: isAddingSection }   = useAddSectionToVersion(versionId);
  const [targetSectionId, setTargetSectionId] = useState<number>(0);
  const { mutate: addQuestion, isPending: isAddingQuestion } = useAddQuestionToSection(targetSectionId);
  const { mutate: createPreviewSubmission, isPending: isPreviewLoading } = useCreatePreviewSubmission(versionId);

  /* ── Edit question state ─────────────────────────────────────── */
  const [editingQuestion, setEditingQuestion] = useState<FormDefinitionQuestionDto | null>(null);
  const [editOrder, setEditOrder]             = useState(1);
  const [editRequired, setEditRequired]       = useState(false);
  const [editHint, setEditHint]               = useState('');
  const { mutate: updateFormQuestion, isPending: isUpdatingQuestion } = useUpdateFormQuestion(editingQuestion?.formQuestionId ?? 0);
  const { mutate: removeFormQuestion } = useRemoveFormQuestion();

  /* ── Edit / Delete section state ─────────────────────────────── */
  const [editingSection, setEditingSection]   = useState<FormDefinitionSectionDto | null>(null);
  const [editSectionOrder, setEditSectionOrder] = useState(1);
  const [deletingSection, setDeletingSection] = useState<FormDefinitionSectionDto | null>(null);
  const { mutate: updateFormSection, isPending: isUpdatingSection } = useUpdateFormSection(editingSection?.formSectionId ?? 0);
  const { mutate: removeFormSection, isPending: isDeletingSection } = useRemoveFormSection();

  const openEditSection = (section: FormDefinitionSectionDto) => {
    setEditingSection(section);
    setEditSectionOrder(section.displayOrder);
  };

  const handleUpdateSection = () => {
    if (!editingSection) return;
    updateFormSection(
      { displayOrder: editSectionOrder },
      {
        onSuccess: () => {
          showToast('success', 'Section order updated.');
          setEditingSection(null);
          refreshDefinition();
        },
        onError: () => showToast('error', 'Failed to update section.'),
      },
    );
  };

  const handleDeleteSection = () => {
    if (!deletingSection) return;
    removeFormSection(deletingSection.formSectionId, {
      onSuccess: () => {
        showToast('success', `Section "${deletingSection.sectionName}" removed.`);
        setDeletingSection(null);
        refreshDefinition();
      },
      onError: () => showToast('error', 'Failed to remove section.'),
    });
  };

  /* ── Preview handler ─────────────────────────────────────────── */
  const handlePreview = () => {
    /* Guard: must have at least one section with at least one question */
    const sections = definition?.sections ?? [];
    if (sections.length === 0) {
      showToast('info', 'Add at least one section to the form before previewing.');
      return;
    }
    const hasQuestions = sections.some((s) => (s.questions ?? []).length > 0);
    if (!hasQuestions) {
      showToast('info', 'Add at least one question to a section before previewing.');
      return;
    }

    createPreviewSubmission(undefined, {
        onSuccess: (res) => {
          const dto = (res as { data?: { submissionId?: string }; submissionId?: string });
          const submissionId = dto?.data?.submissionId ?? (dto as { submissionId?: string })?.submissionId;
          if (!submissionId) {
            showToast('error', 'Preview submission created but ID not returned. Please try again.');
            return;
          }
          navigate(`/submissions/new/${versionId}`, {
            state: { submissionId, isPreview: true, formId, versionId },
          });
        },
        onError: () => showToast('error', 'Could not create preview submission. Please try again.'),
      },
    );
  };

  /* ── Modals ──────────────────────────────────────────────────── */
  const [showAddSection, setShowAddSection]   = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showCopyForm, setShowCopyForm]       = useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);

  /* ── Quick-create Section (master) state ────────────────────── */
  const [showNewSection, setShowNewSection]   = useState(false);
  const [newMasterSectionName, setNewMasterSectionName] = useState('');
  const { mutate: createSection, isPending: isCreatingSection } = useCreateSection();

  const handleCreateMasterSection = () => {
    if (!newMasterSectionName.trim()) { showToast('error', 'Section name is required.'); return; }
    createSection(
      { sectionName: newMasterSectionName.trim(), displayOrder: 1 },
      {
        onSuccess: () => {
          showToast('success', `Section "${newMasterSectionName.trim()}" created and added to the list.`);
          setNewMasterSectionName('');
          setShowNewSection(false);
        },
        onError: () => showToast('error', 'Failed to create section.'),
      },
    );
  };

  /* ── Quick-create Question (master) state ───────────────────── */
  const [showNewQuestion, setShowNewQuestion]   = useState(false);
  const [newMasterQText, setNewMasterQText]     = useState('');
  const [newMasterQType, setNewMasterQType]     = useState('Text');
  const [newMasterQDesc, setNewMasterQDesc]     = useState('');
  const { mutate: createQuestion, isPending: isCreatingQuestion } = useCreateQuestion();

  const QUESTION_TYPES_LIST = ['Text', 'Number', 'Select', 'MultiSelect', 'Date', 'Boolean'];

  const handleCreateMasterQuestion = () => {
    if (!newMasterQText.trim()) { showToast('error', 'Question text is required.'); return; }
    createQuestion(
      { questionText: newMasterQText.trim(), description: newMasterQDesc.trim() || undefined, questionType: newMasterQType },
      {
        onSuccess: () => {
          showToast('success', `Question "${newMasterQText.trim()}" created and added to the list.`);
          setNewMasterQText('');
          setNewMasterQType('Text');
          setNewMasterQDesc('');
          setShowNewQuestion(false);
        },
        onError: () => showToast('error', 'Failed to create question.'),
      },
    );
  };

  /* ── Copy Form state ─────────────────────────────────────────── */
  const [copyTerritoryCode, setCopyTerritoryCode] = useState('');
  const [copyFormId, setCopyFormId]               = useState(0);
  const [copyVersionId, setCopyVersionId]         = useState(0);
  const { data: territories }                     = useTerritories();
  const { data: copyForms }                       = useForms(copyTerritoryCode || undefined);
  const { data: copyVersions }                    = useFormVersions(copyFormId);
  const { mutate: copyFormStructure, isPending: isCopying } = useCopyFormStructure(versionId);

  const handleCopyForm = () => {
    if (copyVersionId <= 0) { showToast('error', 'Select a version to copy from.'); return; }
    if (copyVersionId === versionId) { showToast('error', 'Cannot copy a version into itself.'); return; }
    setShowCopyConfirm(true);
  };

  const executeCopy = () => {
    setShowCopyConfirm(false);
    copyFormStructure(copyVersionId, {
      onSuccess: () => {
        showToast('success', 'Form structure copied successfully.');
        setShowCopyForm(false);
        setCopyTerritoryCode('');
        setCopyFormId(0);
        setCopyVersionId(0);
        refreshDefinition();
      },
      onError: (err) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 400) showToast('error', 'Cannot copy a version into itself.');
        else if (status === 404) showToast('error', 'Source or target version not found.');
        else showToast('error', 'Failed to copy form structure. Please try again.');
      },
    });
  };

  /* ── Add section form state ──────────────────────────────────── */
  const [newSectionId, setNewSectionId]       = useState(0);
  const [newSectionOrder, setNewSectionOrder] = useState(1);

  /* ── Add question form state ─────────────────────────────────── */
  const [newQuestionId, setNewQuestionId]       = useState(0);
  const [newQuestionOrder, setNewQuestionOrder] = useState(1);
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);
  const [newQuestionHint, setNewQuestionHint]   = useState<string>('');

  /* ── Available (not yet added) sections ──────────────────────── */
  const availableSections = useMemo(() => {
    if (!allSections || !definition) return [];
    const usedSectionNames = new Set((definition.sections ?? []).map((s) => s.sectionName.toLowerCase()));
    return allSections.filter((s) => s.isActive && !usedSectionNames.has(s.sectionName.toLowerCase()));
  }, [allSections, definition]);

  /* ── Available questions (active, not yet added to this version) ─ */
  const availableQuestions = useMemo(() => {
    if (!allQuestions || !definition) return [];
    const usedQuestionIds = new Set(
      (definition.sections ?? []).flatMap((s) => (s.questions ?? []).map((q) => q.questionId)),
    );
    return allQuestions.filter((q) => q.isActive && !usedQuestionIds.has(q.questionId));
  }, [allQuestions, definition]);

  /* ── Invalidate definition after mutations ───────────────────── */
  const refreshDefinition = () => {
    queryClient.invalidateQueries({ queryKey: ['form-definition', versionId] });
  };

  /* ── Handlers ────────────────────────────────────────────────── */
  const handleAddSection = () => {
    if (newSectionId <= 0) { showToast('error', 'Select a section.'); return; }
    addSection(
      { sectionId: newSectionId, displayOrder: newSectionOrder },
      {
        onSuccess: () => {
          showToast('success', 'Section added to version.');
          setShowAddSection(false);
          setNewSectionId(0);
          setNewSectionOrder((definition?.sections.length ?? 0) + 1);
          refreshDefinition();
        },
        onError: () => showToast('error', 'Failed to add section.'),
      },
    );
  };

  const openAddQuestion = (formSectionId: number) => {
    setTargetSectionId(formSectionId);
    setNewQuestionId(0);
    // compute last order for the section and set to last + 1
    const sec = definition?.sections?.find((s) => s.formSectionId === formSectionId);
    const lastOrder = sec && sec.questions && sec.questions.length > 0 ? Math.max(...sec.questions.map((q) => q.displayOrder)) : 0;
    setNewQuestionOrder(lastOrder + 1);
    setNewQuestionRequired(false);
    setNewQuestionHint('');
    setShowAddQuestion(true);
  };

  const openEditQuestion = (q: FormDefinitionQuestionDto) => {
    setEditingQuestion(q);
    setEditOrder(q.displayOrder);
    setEditRequired(q.isRequired);
    setEditHint(q.renderHint ?? '');
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;
    updateFormQuestion(
      { displayOrder: editOrder, isRequired: editRequired, renderHint: editHint || undefined },
      {
        onSuccess: () => {
          showToast('success', 'Question updated.');
          setEditingQuestion(null);
          refreshDefinition();
        },
        onError: () => showToast('error', 'Failed to update question.'),
      },
    );
  };

  const handleRemoveQuestion = (q: FormDefinitionQuestionDto) => {
    if (!confirm(`Remove "${q.questionText}" from this section?`)) return;
    removeFormQuestion(q.formQuestionId, {
      onSuccess: () => { showToast('success', 'Question removed.'); refreshDefinition(); },
      onError:   () => showToast('error', 'Failed to remove question.'),
    });
  };

  const handleAddQuestion = () => {
    if (newQuestionId <= 0) { showToast('error', 'Select a question.'); return; }
    addQuestion(
      {
        questionId:   newQuestionId,
        displayOrder: newQuestionOrder,
        isRequired:   newQuestionRequired,
        renderHint:   newQuestionHint || undefined,
      },
      {
        onSuccess: () => {
          showToast('success', 'Question added to section.');
          setShowAddQuestion(false);
          refreshDefinition();
        },
        onError: () => showToast('error', 'Failed to add question.'),
      },
    );
  };

  /* ── Loading / Error ─────────────────────────────────────────── */
  if (isLoading) return <div><PageHeading title="Form Builder" /><SkeletonLoader rows={6} /></div>;
  if (isError)   return <div><PageHeading title="Form Builder" /><ErrorState message={error instanceof Error ? error.message : 'Load failed'} onRetry={() => refetch()} /></div>;

  const hasSections  = (definition?.sections ?? []).length > 0;
  const hasQuestions = (definition?.sections ?? []).some((s) => (s.questions ?? []).length > 0);
  const canPreview   = hasSections && hasQuestions;

  const pageActions = (
    <div className="flex items-center gap-2">
      <BackToDashboardButton />
      <button
        type="button"
        onClick={() => navigate(`/admin/forms/${formId}/versions`)}
        className="px-3 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]"
      >
        &larr; Versions
      </button>
      <button
        type="button"
        onClick={() => setShowCopyForm(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]"
      >
        <Copy size={14} /> Copy From
      </button>
      <button
        type="button"
        onClick={handlePreview}
        disabled={isPreviewLoading || !canPreview}
        title={!canPreview ? 'Add sections and questions before previewing' : undefined}
        className="px-3 py-2 text-sm border border-[#0073E6] rounded-lg text-[#0073E6] hover:bg-[#0073E6]/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPreviewLoading ? 'Loading...' : 'Preview'}
      </button>
    </div>
  );

  return (
    <div>
      <AdminMobileHint />
      <PageHeading
        title={definition ? `Builder: ${definition.formName}` : 'Form Builder'}
        subtitle={definition ? `Version ${definition.versionNumber}` : undefined}
        actions={pageActions}
      />

      {/* ── Two-panel layout ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">

        {/* ── Left panel: available sections & questions ─────── */}
        <div className="fm-card p-4 space-y-4 h-fit lg:sticky lg:top-20 lg:self-start">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fm-muted)' }}>
            Available
          </h3>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium" style={{ color: 'var(--color-fm-navy)' }}>Sections</h4>
              <button
                type="button"
                onClick={() => setShowNewSection(true)}
                className="text-[10px] text-[#0057CA] hover:underline focus-visible:outline-none"
              >
                + New
              </button>
            </div>
            <div className="max-h-32 sm:max-h-40 md:max-h-48 lg:max-h-64 overflow-y-auto space-y-1">
              {availableSections.map((s) => (
                <AvailableItem key={s.sectionId} label={s.sectionName} />
              ))}
              {availableSections.length === 0 && (
                <p className="text-xs italic" style={{ color: 'var(--color-fm-muted)' }}>No sections available</p>
              )}
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium" style={{ color: 'var(--color-fm-navy)' }}>Questions</h4>
              <button
                type="button"
                onClick={() => setShowNewQuestion(true)}
                className="text-[10px] text-[#0057CA] hover:underline focus-visible:outline-none"
              >
                + New
              </button>
            </div>
            <div className="max-h-36 sm:max-h-48 md:max-h-72 lg:max-h-[55vh] overflow-y-auto space-y-1">
              {availableQuestions.map((q) => (
                <AvailableItem key={q.questionId} label={q.questionText} badge={q.questionType} />
              ))}
              {availableQuestions.length === 0 && (
                <p className="text-xs italic" style={{ color: 'var(--color-fm-muted)' }}>No questions available</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right panel: current version structure ─────────── */}
        <div className="fm-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-fm-muted)' }}>
              Version Structure
            </h3>
            <button
              onClick={() => { setNewSectionOrder((definition?.sections.length ?? 0) + 1); setShowAddSection(true); }}
              className="text-xs text-[#0057CA] hover:underline focus-visible:outline-none"
            >
              + Add Section
            </button>
          </div>

          {definition && definition.sections.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--color-fm-muted)' }}>
                No sections added yet. Click "+ Add Section" to start building.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {definition?.sections
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((section) => (
                <BuilderSection
                  key={section.formSectionId}
                  section={section}
                  onAddQuestion={() => openAddQuestion(section.formSectionId)}
                  onEditQuestion={openEditQuestion}
                  onRemoveQuestion={handleRemoveQuestion}
                  onEditSection={() => openEditSection(section)}
                  onDeleteSection={() => setDeletingSection(section)}
                />
              ))}
          </div>
        </div>
      </div>

      {/* ── Add Section Modal ── */}
      {showAddSection && (
        <FormModal title="Add Section to Version" onClose={() => setShowAddSection(false)} footer={
          <>
            <button type="button" onClick={() => setShowAddSection(false)} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
            <PrimaryButton onClick={handleAddSection} loading={isAddingSection} label="Add Section" />
          </>
        }>
          <div className="fm-field">
            <label className="fm-label">Section <span className="fm-required-star">*</span></label>
            <SearchableSelect
              options={availableSections.map((s) => ({ value: s.sectionId, label: s.sectionName }))}
              value={newSectionId}
              onChange={setNewSectionId}
              placeholder="— Select Section —"
              emptyMessage="No sections available — create sections first"
              noMatchMessage="No matching sections found"
            />
          </div>
          <div className="fm-field">
            <label className="fm-label">Display Order</label>
            <input
              type="number"
              value={newSectionOrder}
              onChange={(e) => setNewSectionOrder(Number(e.target.value))}
              className={INPUT_CLASS}
              min={1}
            />
            <p className="fm-helper-text">Lower numbers appear first.</p>
          </div>
        </FormModal>
      )}

      {/* ── Add Question Modal ── */}
      {showAddQuestion && (
        <FormModal title="Add Question to Section" onClose={() => setShowAddQuestion(false)} footer={
          <>
            <button type="button" onClick={() => setShowAddQuestion(false)} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
            <PrimaryButton onClick={handleAddQuestion} loading={isAddingQuestion} label="Add Question" />
          </>
        }>
          <div className="fm-field">
            <label className="fm-label">Question <span className="fm-required-star">*</span></label>
            <SearchableSelect
              options={availableQuestions.map((q) => ({
                value: q.questionId,
                label: q.questionText,
              }))}
              value={newQuestionId}
              onChange={setNewQuestionId}
              placeholder="— Select Question —"
              emptyMessage="No questions available — create questions first"
              noMatchMessage="No matching questions found"
            />
          </div>
          <div className="fm-field">
            <label className="fm-label">Display Order</label>
            <input
              type="number"
              value={newQuestionOrder}
              onChange={(e) => setNewQuestionOrder(Number(e.target.value))}
              className={INPUT_CLASS}
              min={1}
            />
          </div>
          <div className="fm-field flex-row items-center gap-3">
            <input
              type="checkbox"
              id="qRequired"
              checked={newQuestionRequired}
              onChange={(e) => setNewQuestionRequired(e.target.checked)}
              className="w-4 h-4 rounded border-[#E0E0E5] accent-[#383B54]"
            />
            <label htmlFor="qRequired" className="fm-label mb-0">Required</label>
          </div>
          {availableQuestions.find((q) => q.questionId === newQuestionId)?.questionType === 'Boolean' && (
            <div className="fm-field">
              <label className="fm-label">Render Hint</label>
              <select
                value={newQuestionHint}
                onChange={(e) => setNewQuestionHint(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">Default</option>
                <option value="radio">Radio</option>
                <option value="toggle">Toggle</option>
                <option value="checkbox">Checkbox</option>
                <option value="dropdown">Dropdown</option>
              </select>
              <p className="fm-helper-text">Controls how the question renders in the wizard.</p>
            </div>
          )}
        </FormModal>
      )}

      {/* ── Edit Question Modal ── */}
      {editingQuestion && (
        <FormModal
          title={`Edit: ${editingQuestion.questionText}`}
          onClose={() => setEditingQuestion(null)}
          footer={
            <>
              <button type="button" onClick={() => setEditingQuestion(null)} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
              <PrimaryButton onClick={handleUpdateQuestion} loading={isUpdatingQuestion} label="Save Changes" />
            </>
          }
        >
          <div className="fm-field">
            <label className="fm-label">Display Order</label>
            <input
              type="number"
              value={editOrder}
              onChange={(e) => setEditOrder(Number(e.target.value))}
              className={INPUT_CLASS}
              min={1}
            />
            <p className="fm-helper-text">Lower numbers appear first in this section.</p>
          </div>
          <div className="fm-field flex-row items-center gap-3">
            <input
              type="checkbox"
              id="editRequired"
              checked={editRequired}
              onChange={(e) => setEditRequired(e.target.checked)}
              className="w-4 h-4 rounded border-[#E0E0E5] accent-[#383B54]"
            />
            <label htmlFor="editRequired" className="fm-label mb-0">Required</label>
          </div>
          {editingQuestion.questionType === 'Boolean' && (
            <div className="fm-field">
              <label className="fm-label">Render Hint</label>
              <select value={editHint} onChange={(e) => setEditHint(e.target.value)} className={INPUT_CLASS}>
                <option value="">Default</option>
                <option value="radio">Radio</option>
                <option value="toggle">Toggle</option>
                <option value="checkbox">Checkbox</option>
                <option value="dropdown">Dropdown</option>
              </select>
              <p className="fm-helper-text">Controls how the question renders in the wizard.</p>
            </div>
          )}
        </FormModal>
      )}

      {/* ── Copy Form Modal ── */}
      {showCopyForm && (
        <FormModal
          title="Copy Form Structure"
          size="md"
          onClose={() => { setShowCopyForm(false); setCopyTerritoryCode(''); setCopyFormId(0); setCopyVersionId(0); }}
          footer={
            <>
              <button
                type="button"
                onClick={() => { setShowCopyForm(false); setCopyTerritoryCode(''); setCopyFormId(0); setCopyVersionId(0); }}
                className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]"
              >
                Cancel
              </button>
              <PrimaryButton
                onClick={handleCopyForm}
                loading={isCopying}
                disabled={copyVersionId <= 0 || isCopying}
                label={isCopying ? 'Copying...' : 'Copy Form Structure'}
              />
            </>
          }
        >
          <p className="text-xs mb-4" style={{ color: 'var(--color-fm-muted)' }}>
            Select a form version to copy its entire structure (sections &amp; questions) into this version. This will replace all existing sections and questions.
          </p>

          {/* Territory */}
          <div className="fm-field">
            <label className="fm-label">Territory <span className="fm-required-star">*</span></label>
            <select
              value={copyTerritoryCode}
              onChange={(e) => { setCopyTerritoryCode(e.target.value); setCopyFormId(0); setCopyVersionId(0); }}
              className={INPUT_CLASS}
            >
              <option value="">-- Select Territory --</option>
              {(territories ?? []).map((t) => (
                <option key={t.territoryId} value={t.code}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Form */}
          <div className="fm-field">
            <label className="fm-label">Form <span className="fm-required-star">*</span></label>
            <select
              value={copyFormId}
              onChange={(e) => { setCopyFormId(Number(e.target.value)); setCopyVersionId(0); }}
              className={INPUT_CLASS}
              disabled={!copyTerritoryCode}
            >
              <option value={0}>-- Select Form --</option>
              {(copyForms ?? []).map((f) => (
                <option key={f.formId} value={f.formId}>{f.formName}</option>
              ))}
            </select>
          </div>

          {/* Version */}
          <div className="fm-field">
            <label className="fm-label">Version <span className="fm-required-star">*</span></label>
            <select
              value={copyVersionId}
              onChange={(e) => setCopyVersionId(Number(e.target.value))}
              className={INPUT_CLASS}
              disabled={copyFormId <= 0}
            >
              <option value={0}>-- Select Version --</option>
              {(copyVersions ?? []).map((v) => (
                <option key={v.formVersionId} value={v.formVersionId}>
                  Version {v.versionNumber}{v.isActive ? ' (Active)' : ''}
                </option>
              ))}
            </select>
          </div>
        </FormModal>
      )}

      {/* ── Copy Confirm Modal ── */}
      {showCopyConfirm && (
        <ConfirmModal
          title="Confirm Copy"
          message="This will delete all existing sections and questions in this version and replace them with the selected form's structure. This action cannot be undone."
          confirmLabel={isCopying ? 'Copying...' : 'Yes, Replace'}
          danger
          isLoading={isCopying}
          onConfirm={executeCopy}
          onCancel={() => setShowCopyConfirm(false)}
        />
      )}

      {/* ── Edit Section Modal ── */}
      {editingSection && (
        <FormModal
          title={`Edit Section: ${editingSection.sectionName}`}
          size="sm"
          onClose={() => setEditingSection(null)}
          footer={
            <>
              <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
              <PrimaryButton onClick={handleUpdateSection} loading={isUpdatingSection} label="Save" />
            </>
          }
        >
          <div className="fm-field">
            <label className="fm-label">Display Order</label>
            <input
              type="number"
              value={editSectionOrder}
              onChange={(e) => setEditSectionOrder(Number(e.target.value))}
              className={INPUT_CLASS}
              min={1}
            />
            <p className="fm-helper-text">Lower numbers appear first. If another section has this order, they will swap.</p>
          </div>
        </FormModal>
      )}

      {/* ── Delete Section Confirm ── */}
      {deletingSection && (
        <ConfirmModal
          title="Remove Section"
          message={`Removing "${deletingSection.sectionName}" will also remove all ${deletingSection.questions.length} question(s) assigned to it from this version. The section and questions themselves are not deleted from the system.`}
          confirmLabel="Yes, Remove Section"
          danger
          isLoading={isDeletingSection}
          onConfirm={handleDeleteSection}
          onCancel={() => setDeletingSection(null)}
        />
      )}

      {/* ── Quick-create Section Modal ── */}
      {showNewSection && (
        <FormModal
          title="New Section"
          size="sm"
          onClose={() => { setShowNewSection(false); setNewMasterSectionName(''); }}
          footer={
            <>
              <button
                type="button"
                onClick={() => { setShowNewSection(false); setNewMasterSectionName(''); }}
                className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]"
              >
                Cancel
              </button>
              <PrimaryButton onClick={handleCreateMasterSection} loading={isCreatingSection} label="Create Section" />
            </>
          }
        >
          <p className="text-xs mb-3" style={{ color: 'var(--color-fm-muted)' }}>
            Creates a new section in the master list. It will appear in the Available panel so you can add it to this form.
          </p>
          <div className="fm-field">
            <label className="fm-label">Section Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={newMasterSectionName}
              onChange={(e) => setNewMasterSectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateMasterSection()}
              placeholder="e.g. Risk & Exposure Details"
              className={INPUT_CLASS}
              autoFocus
            />
          </div>
        </FormModal>
      )}

      {/* ── Quick-create Question Modal ── */}
      {showNewQuestion && (
        <FormModal
          title="New Question"
          size="sm"
          onClose={() => { setShowNewQuestion(false); setNewMasterQText(''); setNewMasterQType('Text'); setNewMasterQDesc(''); }}
          footer={
            <>
              <button
                type="button"
                onClick={() => { setShowNewQuestion(false); setNewMasterQText(''); setNewMasterQType('Text'); setNewMasterQDesc(''); }}
                className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]"
              >
                Cancel
              </button>
              <PrimaryButton onClick={handleCreateMasterQuestion} loading={isCreatingQuestion} label="Create Question" />
            </>
          }
        >
          <p className="text-xs mb-3" style={{ color: 'var(--color-fm-muted)' }}>
            Creates a new question in the master list. It will appear in the Available panel so you can add it to a section.
          </p>
          <div className="fm-field">
            <label className="fm-label">Question Text <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={newMasterQText}
              onChange={(e) => setNewMasterQText(e.target.value)}
              placeholder="e.g. Does the policy include flood coverage?"
              className={INPUT_CLASS}
              autoFocus
            />
          </div>
          <div className="fm-field">
            <label className="fm-label">Question Type</label>
            <select value={newMasterQType} onChange={(e) => setNewMasterQType(e.target.value)} className={INPUT_CLASS}>
              {QUESTION_TYPES_LIST.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="fm-field">
            <label className="fm-label">Description <span className="fm-helper-text">(optional)</span></label>
            <textarea
              value={newMasterQDesc}
              onChange={(e) => setNewMasterQDesc(e.target.value)}
              placeholder="Helper text shown below the question"
              className={INPUT_CLASS}
              rows={2}
            />
          </div>
        </FormModal>
      )}
    </div>
  );
}

/* ── Builder section card ──────────────────────────────────────── */
function BuilderSection({
  section,
  onAddQuestion,
  onEditQuestion,
  onRemoveQuestion,
  onEditSection,
  onDeleteSection,
}: {
  section: FormDefinitionSectionDto;
  onAddQuestion: () => void;
  onEditQuestion: (q: FormDefinitionQuestionDto) => void;
  onRemoveQuestion: (q: FormDefinitionQuestionDto) => void;
  onEditSection: () => void;
  onDeleteSection: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#E0E0E5] overflow-hidden">
      {/* Header */}
      <div className="bg-[#F2F2F5] px-3 py-2 flex items-center gap-2">
        <span className="text-xs shrink-0 px-1.5 py-0.5 rounded bg-[#383B54] text-white font-mono">
          {section.displayOrder}
        </span>
        <span className="flex-1 text-sm font-medium min-w-0 truncate" style={{ color: 'var(--color-fm-navy)' }}>
          {section.sectionName}
        </span>
        {/* Section actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onAddQuestion}
            title="Add question"
            className="text-xs text-[#0057CA] hover:underline focus-visible:outline-none whitespace-nowrap hidden sm:block"
          >
            + Add Question
          </button>
          <button
            type="button"
            onClick={onAddQuestion}
            title="Add question"
            className="p-1 rounded text-[#0057CA] hover:bg-[#E8F0FD] focus-visible:outline-none sm:hidden"
          >
            <span className="text-base leading-none">+</span>
          </button>
          <button
            type="button"
            onClick={onEditSection}
            title="Edit section order"
            className="p-1 rounded text-[#383B54] hover:bg-[#E0E0E5] focus-visible:outline-none"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={onDeleteSection}
            title="Remove section from version"
            className="p-1 rounded text-[#DD2647] hover:bg-[#FAE8ED] focus-visible:outline-none"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="divide-y divide-[#F2F2F5]">
        {section.questions.length === 0 ? (
          <p className="px-4 py-3 text-xs italic" style={{ color: 'var(--color-fm-muted)' }}>
            No questions in this section.
          </p>
        ) : (
          section.questions
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((q) => (
              <BuilderQuestion
                key={q.formQuestionId}
                question={q}
                onEdit={() => onEditQuestion(q)}
                onRemove={() => onRemoveQuestion(q)}
              />
            ))
        )}
      </div>
    </div>
  );
}

/* ── Builder question row ──────────────────────────────────────── */
function BuilderQuestion({
  question,
  onEdit,
  onRemove,
}: {
  question: FormDefinitionQuestionDto;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="px-4 py-2 flex items-center gap-3 hover:bg-[#FAFAFA] transition-colors">
      <span className="text-xs w-5 text-center font-mono shrink-0" style={{ color: 'var(--color-fm-muted)' }}>
        {question.displayOrder}
      </span>
      <span className="flex-1 text-sm min-w-0" style={{ color: 'var(--color-fm-navy)' }}>
        {question.questionText}
        {question.isRequired && <span className="fm-required-star ml-1">*</span>}
      </span>
      <span className="text-xs px-2 py-0.5 rounded bg-[#F2F2F5] shrink-0" style={{ color: 'var(--color-fm-muted)' }}>
        {question.questionType}
      </span>
      {question.renderHint && (
        <span className="text-xs px-2 py-0.5 rounded bg-[#E8F4FD] text-[#0057CA] shrink-0">
          {question.renderHint}
        </span>
      )}
      {/* Action buttons — always visible */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          title="Edit question in section"
          className="p-1 rounded text-[#383B54] hover:bg-[#E0E0E5] focus-visible:outline-none"
        >
          <Pencil size={12} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="Remove question from section"
          className="p-1 rounded text-[#DD2647] hover:bg-[#FAE8ED] focus-visible:outline-none"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── Available item in left panel ──────────────────────────────── */
function AvailableItem({ label, badge }: { label: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-white border border-[#F2F2F5] text-xs">
      <span className="flex-1 truncate" style={{ color: 'var(--color-fm-navy)' }}>{label}</span>
      {badge && (
        <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#F2F2F5] text-[10px] font-medium" style={{ color: 'var(--color-fm-muted)' }}>
          {badge}
        </span>
      )}
    </div>
  );
}

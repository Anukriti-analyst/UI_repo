import { useState, useMemo, useEffect } from 'react';
import { Pencil, PowerOff, Power, Plus, X } from 'lucide-react';
import { useForm, useFieldArray, type UseFormReturn } from 'react-hook-form';
import { zodResolver }       from '@hookform/resolvers/zod';
import { z }                 from 'zod';

import { PageHeading }      from '@/components/common/PageHeading';
import { BackToDashboardButton } from '@/components/common/BackToDashboardButton';
import { DataTable }        from '@/components/common/DataTable';
import { ActiveBadge }      from '@/components/common/StatusBadge';
import { SkeletonLoader }   from '@/components/common/SkeletonLoader';
import { ErrorState }       from '@/components/common/ErrorState';
import { FormModal }        from '@/components/common/FormModal';
import { ConfirmModal }     from '@/components/common/ConfirmModal';
import { PrimaryButton }    from '@/components/common/PrimaryButton';
import { INPUT_CLASS }      from '@/utils/constants';
import { AdminMobileHint }  from '@/components/common/AdminMobileHint';
import { usePageTitle }     from '@/hooks/usePageTitle';
import { useQueryClient }   from '@tanstack/react-query';
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useCreateSubQuestion,
  useUpdateSubQuestion,
  useQuestionOptions,
  useDeleteQuestionOption,
} from '@/hooks/useQuestions';
import { useNotification }  from '@/context/NotificationContext';
import { apiClient }        from '@/api/client';
import { ENDPOINTS }        from '@/api/endpoints';
import type { QuestionDto, SubQuestionDto } from '@/api/types/question.types';
import type { QuestionType } from '@/api/types/form.types';

/* Validation schemas */
const QUESTION_TYPES: QuestionType[] = ['Text', 'Number', 'Select', 'MultiSelect', 'Date', 'Boolean'];

const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required').max(500),
  description:  z.string().max(1000).optional(),
  questionType: z.enum(['Text', 'Number', 'Select', 'MultiSelect', 'Date', 'Boolean', 'YesNo']),
  isActive:     z.boolean().optional(),
  options:      z.array(z.object({ text: z.string() })).optional(),
});
type QuestionFormValues = z.infer<typeof questionSchema>;

const subQuestionSchema = z.object({
  subQuestionText: z.string().min(1, 'Sub-question text is required').max(500),
  triggerValue:    z.string().min(1, 'Trigger value is required').max(100),
  questionType:    z.enum(['Text', 'Number', 'Select', 'MultiSelect', 'Date', 'Boolean', 'YesNo']),
  description:     z.string().max(1000).optional(),
  options:         z.array(z.object({ text: z.string() })).optional(),
});
type SubQuestionFormValues = z.infer<typeof subQuestionSchema>;

/* Table columns */
import type { Column } from '@/components/common/DataTable';

const BASE_COLUMNS: Column<QuestionDto>[] = [
  {
    key:      'questionText',
    header:   'Question',
    sortable: true,
    render: (row) => (
      <div>
        <span className="font-medium" style={{ color: 'var(--color-fm-navy)' }}>
          {row.questionText}
        </span>
        {row.description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-fm-muted)' }}>
            {row.description}
          </p>
        )}
      </div>
    ),
  },
  {
    key:          'questionType',
    header:       'Type',
    sortable:     true,
    hideOnMobile: true,
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F2F2F5] text-[#383B54]">
        {row.questionType}
      </span>
    ),
  },
  {
    key:          'subQuestions',
    header:       'Sub-Qs',
    hideOnMobile: true,
    render: () => null, // Overridden inline with expandedId state
  },
  {
    key:      'isActive',
    header:   'Status',
    sortable: true,
    sortValue: (row) => row.isActive ? 'Active' : 'Inactive',
    render: (row) => <ActiveBadge isActive={row.isActive} />,
  },
];

export function ManageQuestions() {
  const { showToast } = useNotification();
  usePageTitle('Manage Questions');

  /* API hooks */
  const { data: questions, isLoading, isError, error, refetch } = useQuestions();
  const { mutate: createQuestion, isPending: isCreating } = useCreateQuestion();
  const [editingId, setEditingId] = useState<number | null>(null);
  const { mutate: updateQuestion, isPending: isUpdating } = useUpdateQuestion();

  /* UI state */
  const [search,             setSearch]             = useState('');
  const [showCreateModal,    setShowCreateModal]     = useState(false);
  const [showEditModal,      setShowEditModal]       = useState(false);
  const [expandedId,         setExpandedId]         = useState<number | null>(null);
  const [showSubQModal,      setShowSubQModal]       = useState(false);
  const [subQParentId,       setSubQParentId]       = useState<number | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateTarget,   setDeactivateTarget]   = useState<QuestionDto | null>(null);
  const [editingSubQ,setEditingSubQ]        = useState<{ parentId: number; sub: SubQuestionDto } | null>(null);

  /* Filtered list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (questions ?? []).filter(
      (item) =>
        item.questionText.toLowerCase().includes(q) ||
        item.questionType.toLowerCase().includes(q),
    );
  }, [questions, search]);

  /* Create question form */
  const createForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: { questionText: '', questionType: 'Text', options: [] },
  });

  const handleCreate = createForm.handleSubmit(async (values) => {
    createQuestion(
      { questionText: values.questionText, description: values.description || undefined, questionType: values.questionType },
      {
        onSuccess: async (response) => {
          const newQuestion = (response as { data: QuestionDto }).data;
          const pendingOpts = (values.options ?? []).filter((o) => o.text.trim());
          if (pendingOpts.length > 0 && newQuestion?.questionId) {
            for (let i = 0; i < pendingOpts.length; i++) {
              const label = pendingOpts[i].text.trim();
              await apiClient.post(ENDPOINTS.adminQuestionOptions(newQuestion.questionId), {
                optionText: label, optionValue: label, displayOrder: i + 1,
              });
            }
          }
          showToast('success', 'Question created successfully.');
          setShowCreateModal(false);
          createForm.reset({ questionText: '', questionType: 'Text', options: [] });
        },
        onError: () => showToast('error', 'Failed to create question.'),
      },
    );
  });

  /* Edit question form */
  const editForm = useForm<QuestionFormValues>({ resolver: zodResolver(questionSchema) });

  const openEdit = (q: QuestionDto) => {
    setEditingId(q.questionId);
    editForm.reset({ questionText: q.questionText, description: q.description ?? '', questionType: q.questionType, isActive: q.isActive, options: [] });
    setShowEditModal(true);
  };

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!editingId) return;
    updateQuestion(
      { id: editingId, questionText: values.questionText, description: values.description || undefined, questionType: values.questionType, isActive: values.isActive ?? true },
      {
        onSuccess: async () => {
          const pendingOpts = (values.options ?? []).filter((o) => o.text.trim());
          const existingCount = questions?.find((q) => q.questionId === editingId)?.options?.length ?? 0;
          for (let i = 0; i < pendingOpts.length; i++) {
            const label = pendingOpts[i].text.trim();
            await apiClient.post(ENDPOINTS.adminQuestionOptions(editingId), {
              optionText: label, optionValue: label, displayOrder: existingCount + i + 1,
            });
          }
          showToast('success', 'Question updated.');
          setShowEditModal(false);
          setEditingId(null);
        },
        onError: () => showToast('error', 'Failed to update question.'),
      },
    );
  });

  /* Deactivate / reactivate */
  const handleToggleActive = (q: QuestionDto) => {
    if (q.isActive) {
      setDeactivateTarget(q);
      setShowDeactivateModal(true);
    } else {
      updateQuestion(
        { id: q.questionId, questionText: q.questionText, questionType: q.questionType, isActive: true },
        {
          onSuccess: () => showToast('success', 'Question reactivated.'),
          onError:   () => showToast('error', 'Failed to reactivate question.'),
        },
      );
    }
  };

  const confirmDeactivate = () => {
    if (!deactivateTarget) return;
    updateQuestion(
      { id: deactivateTarget.questionId, questionText: deactivateTarget.questionText, questionType: deactivateTarget.questionType, isActive: false },
      {
        onSuccess: () => {
          showToast('success', 'Question deactivated.');
          setShowDeactivateModal(false);
          setDeactivateTarget(null);
        },
        onError: () => showToast('error', 'Failed to deactivate question.'),
      },
    );
  };

  /* Loading / Error */
  if (isLoading) return <div><PageHeading title="Manage Questions" /><SkeletonLoader rows={6} /></div>;
  if (isError)   return <div><PageHeading title="Manage Questions" /><ErrorState message={error instanceof Error ? error.message : 'Load failed'} onRetry={() => refetch()} /></div>;

  /* Page actions */
  const actions = (
    <div className="flex items-center gap-2">
      <BackToDashboardButton />
      <button
        type="button"
        onClick={() => { createForm.reset(); setShowCreateModal(true); }}
        title="New Question"
        className="inline-flex items-center gap-1.5 px-2 py-2 sm:px-4 rounded-lg text-sm font-medium bg-[#383B54] text-white hover:bg-[#0D102B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">New Question</span>
      </button>
    </div>
  );

  return (
    <div>
      <AdminMobileHint />
      <PageHeading title="Manage Questions" subtitle="Create and manage master questions" actions={actions} />

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search questions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search questions"
          className="w-full sm:max-w-sm px-3 py-2 text-sm rounded-lg border border-[#E0E0E5] focus:outline-none focus:ring-2 focus:ring-[#0073E6] placeholder:text-[#666666]"
        />
      </div>

      {/* Table */}
      <div className="fm-card">
        <DataTable<QuestionDto>
          columns={[
            BASE_COLUMNS[0], // Question
            BASE_COLUMNS[1], // Type
            {
              key:    'subQuestions',
              header: 'Sub-Qs',
              hideOnMobile: true,
              render: (row) => {
                const count = (row.subQuestions ?? []).length;
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (count === 0) {
                        // Expand the row and immediately open the add modal
                        setExpandedId(row.questionId);
                        setSubQParentId(row.questionId);
                        setShowSubQModal(true);
                      } else {
                        setExpandedId(expandedId === row.questionId ? null : row.questionId);
                      }
                    }}
                    className="text-xs hover:underline focus-visible:outline-none inline-flex items-center gap-1"
                    style={{ color: count === 0 ? 'var(--color-fm-muted)' : '#0057CA' }}
                  >
                    {count === 0 ? (
                      <span>+ Add</span>
                    ) : (
                      <>
                        <span>{expandedId === row.questionId ? 'Hide' : `Show (${count})`}</span>
                      </>
                    )}
                  </button>
                );
              },
            },
            BASE_COLUMNS[3], // Status
            {
              key:    'actions',
              header: 'Actions',
              render: (row) => (
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(row); }}
                    title="Edit question"
                    aria-label="Edit question"
                    className="inline-flex items-center gap-1.5 p-1.5 sm:px-2 sm:py-0.5 rounded text-[#383B54] hover:text-[#0D102B] border border-[#E0E0E5] hover:bg-[#F2F2F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6] transition-colors"
                  >
                    <Pencil size={14} />
                    <span className="hidden sm:inline text-xs font-medium">Edit</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(row); }}
                    title={row.isActive ? 'Deactivate question' : 'Reactivate question'}
                    aria-label={row.isActive ? 'Deactivate question' : 'Reactivate question'}
                    className={`inline-flex items-center gap-1.5 p-1.5 sm:px-2 sm:py-0.5 rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6] transition-colors ${
                      row.isActive
                        ? 'text-[#DD2647] border-[#DD2647] hover:bg-[#FAE8ED]'
                        : 'text-[#16B041] border-[#16B041] hover:bg-[#E6F2EA]'
                    }`}
                  >
                    {row.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                    <span className="hidden sm:inline text-xs font-medium">
                      {row.isActive ? 'Deactivate' : 'Reactivate'}
                    </span>
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
          keyField="questionId"
          emptyTitle="No questions found"
          emptyDescription={search ? 'Try a different search term.' : 'Create your first question to get started.'}
          emptyActionLabel={search ? undefined : 'New Question'}
          onEmptyAction={search ? undefined : () => setShowCreateModal(true)}
          renderExpandedRow={(row) => {
            if (expandedId !== row.questionId) return null;
            const subs = row.subQuestions ?? [];
            return (
              <div className="border-t border-[#E0E0E5] px-4 py-3 bg-[#FAFAFA]">
                <div className="pl-4 border-l-2 border-[#0073E6]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-fm-navy)' }}>
                      Sub-Questions for: {row.questionText}
                    </span>
                    <button
                      onClick={() => { setSubQParentId(row.questionId); setShowSubQModal(true); }}
                      className="text-xs text-[#0057CA] hover:underline focus-visible:outline-none"
                    >
                      + Add Sub-Question
                    </button>
                  </div>
                  {subs.length === 0 ? (
                    <p className="text-xs italic" style={{ color: 'var(--color-fm-muted)' }}>
                      No sub-questions yet. Click "+ Add Sub-Question" above to create one.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {subs.map((sub) => (
                        <SubQuestionRow
                          key={sub.subQuestionId}
                          sub={sub}
                          onEdit={() => setEditingSubQ({ parentId: row.questionId, sub })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <FormModal title="New Question" onClose={() => setShowCreateModal(false)} footer={
          <>
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
            <PrimaryButton onClick={handleCreate} loading={isCreating} label="Create Question" />
          </>
        }>
          <QuestionFields form={createForm} />
        </FormModal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <FormModal title="Edit Question" onClose={() => { setShowEditModal(false); setEditingId(null); }} footer={
          <>
            <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
            <PrimaryButton onClick={handleEdit} loading={isUpdating} label="Save Changes" />
          </>
        }>
          <QuestionFields form={editForm} showActive questionId={editingId ?? undefined} />
        </FormModal>
      )}

      {/* Sub-question Modal */}
      {showSubQModal && subQParentId !== null && (
        <SubQuestionModal
          questionId={subQParentId}
          onClose={() => { setShowSubQModal(false); setSubQParentId(null); }}
        />
      )}

      {/* Edit Sub-question Modal */}
      {editingSubQ && (
        <EditSubQuestionModal
          questionId={editingSubQ.parentId}
          sub={editingSubQ.sub}
          onClose={() => setEditingSubQ(null)}
        />
      )}

      {/* Deactivate Confirm */}
      {showDeactivateModal && deactivateTarget && (
        <ConfirmModal
          title="Deactivate Question?"
          message={`"${deactivateTarget.questionText}" will be deactivated and hidden from new forms.`}
          confirmLabel="Deactivate"
          danger
          onConfirm={confirmDeactivate}
          onCancel={() => { setShowDeactivateModal(false); setDeactivateTarget(null); }}
        />
      )}

      {/* Options Manager Modal removed — options managed inline via Edit */}
    </div>
  );
}

function SubQuestionRow({ sub, onEdit }: { sub: SubQuestionDto; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-3 text-xs py-1.5 border-b border-[#F2F2F5] last:border-0">
      <span className="font-medium flex-1 min-w-0 truncate" style={{ color: 'var(--color-fm-navy)' }}>{sub.subQuestionText}</span>
      <span className="shrink-0 px-2 py-0.5 rounded bg-[#F2F2F5] text-[#383B54]">{sub.questionType ?? 'Text'}</span>
      {(sub.options ?? []).length > 0 && (
        <span className="shrink-0 text-[#9CA3AF]">{sub.options.length} opt{sub.options.length !== 1 ? 's' : ''}</span>
      )}
      <span className="shrink-0 px-2 py-0.5 rounded bg-[#F2F2F5]" style={{ color: 'var(--color-fm-muted)' }}>
        when: <strong>{sub.triggerValue}</strong>
      </span>
      <button
        type="button"
        onClick={onEdit}
        title="Edit sub-question"
        className="shrink-0 inline-flex items-center gap-1 p-1 rounded text-[#383B54] border border-[#E0E0E5] hover:bg-[#F2F2F5] focus-visible:outline-none transition-colors"
      >
        <Pencil size={11} />
      </button>
    </div>
  );
}

function SubQuestionModal({ questionId, onClose }: { questionId: number; onClose: () => void }) {
  const { showToast } = useNotification();
  const { mutate, isPending } = useCreateSubQuestion(questionId);
  const queryClient = useQueryClient();

  const form = useForm<SubQuestionFormValues>({
    resolver: zodResolver(subQuestionSchema),
    defaultValues: { subQuestionText: '', triggerValue: '', questionType: 'Text', description: '', options: [] },
  });
  const { register, watch, control, handleSubmit, formState: { errors } } = form;

  const questionType = watch('questionType');
  const isOptionsType = questionType === 'Select' || questionType === 'MultiSelect';

  const { fields, append, remove } = useFieldArray({ control, name: 'options' as never });

  useEffect(() => {
    if (isOptionsType && (fields as { id: string }[]).length === 0) {
      append({ text: '' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOptionsType]);

  const onSubmit = handleSubmit(async (values) => {
    mutate(
      { subQuestionText: values.subQuestionText, triggerValue: values.triggerValue, questionType: values.questionType, description: values.description || undefined },
      {
        onSuccess: async (response) => {
          const newSub = (response as { data: SubQuestionDto })?.data;
          const pendingOpts = (values.options ?? []).filter((o) => o.text.trim());
          if (pendingOpts.length > 0 && newSub?.subQuestionId) {
            for (let i = 0; i < pendingOpts.length; i++) {
              const label = pendingOpts[i].text.trim();
              await apiClient.post(ENDPOINTS.adminSubQuestionOptions(questionId, newSub.subQuestionId), {
                optionText: label, optionValue: label, displayOrder: i + 1,
              });
            }
            // Re-invalidate after options are saved so the list refreshes with options
            await queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
          }
          showToast('success', 'Sub-question added.');
          onClose();
        },
        onError: () => showToast('error', 'Failed to add sub-question.'),
      },
    );
  });

  return (
    <FormModal title="Add Sub-Question" onClose={onClose} footer={
      <>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
        <PrimaryButton onClick={onSubmit} loading={isPending} label="Add Sub-Question" />
      </>
    }>
      <div className="fm-field">
        <label className="fm-label">Sub-Question Text <span className="fm-required-star">*</span></label>
        <textarea {...register('subQuestionText')} rows={2} className={`${INPUT_CLASS} resize-none`} placeholder="e.g. Please provide more details" />
        {errors.subQuestionText && <p className="fm-error-text">{errors.subQuestionText.message}</p>}
      </div>
      <div className="fm-field">
        <label className="fm-label">Description</label>
        <input {...register('description')} className={INPUT_CLASS} placeholder="Optional helper text shown to users" />
      </div>
      <div className="fm-field">
        <label className="fm-label">Question Type <span className="fm-required-star">*</span></label>
        <select {...register('questionType')} className={INPUT_CLASS}>
          {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.questionType && <p className="fm-error-text">{errors.questionType.message}</p>}
      </div>
      <div className="fm-field">
        <label className="fm-label">Trigger Value <span className="fm-required-star">*</span></label>
        <input {...register('triggerValue')} className={INPUT_CLASS} placeholder="e.g. Yes" />
        <p className="fm-helper-text">Show this sub-question when parent answer equals this value (case-insensitive).</p>
        {errors.triggerValue && <p className="fm-error-text">{errors.triggerValue.message}</p>}
      </div>

      {isOptionsType && (
        <div className="fm-field">
          <label className="fm-label">Answer Options</label>
          {(fields as { id: string }[]).map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2 mb-1.5">
              <input
                {...register(`options.${idx}.text` as const)}
                className={`${INPUT_CLASS} flex-1`}
                placeholder={`Option ${idx + 1}`}
                autoFocus={idx === 0}
              />
              {(fields as { id: string }[]).length > 1 && (
                <button type="button" onClick={() => remove(idx)} className="p-1 text-[#9CA3AF] hover:text-[#DD2647] transition-colors focus-visible:outline-none">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ text: '' })}
            className="text-xs text-[#0057CA] hover:underline focus-visible:outline-none mt-0.5 float-right"
          >
            + Add another option
          </button>
          <div className="clear-both" />
        </div>
      )}
    </FormModal>
  );
}

/* Edit sub-question modal */
function EditSubQuestionModal({ questionId, sub, onClose }: { questionId: number; sub: SubQuestionDto; onClose: () => void }) {
  const { showToast } = useNotification();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateSubQuestion(questionId);

  const form = useForm<SubQuestionFormValues>({
    resolver: zodResolver(subQuestionSchema),
    defaultValues: {
      subQuestionText: sub.subQuestionText,
      triggerValue:    sub.triggerValue,
      questionType:    (sub.questionType ?? 'Text') as SubQuestionFormValues['questionType'],
      description:     sub.description ?? '',
      options:         [],
    },
  });
  const { register, watch, control, handleSubmit, formState: { errors } } = form;

  const questionType = watch('questionType');
  const isOptionsType = questionType === 'Select' || questionType === 'MultiSelect';

  const { fields, append, remove } = useFieldArray({ control, name: 'options' as never });

  /* Existing options on the sub-question */
  const existingOptions = (sub.options ?? []).filter((o) => o.isActive !== false);

  const handleDeleteExistingOption = async (optId: number) => {
    await apiClient.delete(ENDPOINTS.adminSubQuestionOption(questionId, sub.subQuestionId, optId));
    await queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
    showToast('success', 'Option removed.');
  };

  const onSubmit = handleSubmit(async (values) => {
    mutate(
      { subId: sub.subQuestionId, subQuestionText: values.subQuestionText, triggerValue: values.triggerValue, questionType: values.questionType, description: values.description || undefined },
      {
        onSuccess: async () => {
          const pendingOpts = (values.options ?? []).filter((o) => o.text.trim());
          if (pendingOpts.length > 0) {
            for (let i = 0; i < pendingOpts.length; i++) {
              const label = pendingOpts[i].text.trim();
              await apiClient.post(ENDPOINTS.adminSubQuestionOptions(questionId, sub.subQuestionId), {
                optionText: label, optionValue: label, displayOrder: existingOptions.length + i + 1,
              });
            }
            await queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
          }
          showToast('success', 'Sub-question updated.');
          onClose();
        },
        onError: () => showToast('error', 'Failed to update sub-question.'),
      },
    );
  });

  return (
    <FormModal title="Edit Sub-Question" onClose={onClose} footer={
      <>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
        <PrimaryButton onClick={onSubmit} loading={isPending} label="Save Changes" />
      </>
    }>
      <div className="fm-field">
        <label className="fm-label">Sub-Question Text <span className="fm-required-star">*</span></label>
        <textarea {...register('subQuestionText')} rows={2} className={`${INPUT_CLASS} resize-none`} />
        {errors.subQuestionText && <p className="fm-error-text">{errors.subQuestionText.message}</p>}
      </div>
      <div className="fm-field">
        <label className="fm-label">Description</label>
        <input {...register('description')} className={INPUT_CLASS} />
      </div>
      <div className="fm-field">
        <label className="fm-label">Question Type <span className="fm-required-star">*</span></label>
        <select {...register('questionType')} className={INPUT_CLASS}>
          {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.questionType && <p className="fm-error-text">{errors.questionType.message}</p>}
      </div>
      <div className="fm-field">
        <label className="fm-label">Trigger Value <span className="fm-required-star">*</span></label>
        <input {...register('triggerValue')} className={INPUT_CLASS} />
        <p className="fm-helper-text">Show this sub-question when parent answer equals this value (case-insensitive).</p>
        {errors.triggerValue && <p className="fm-error-text">{errors.triggerValue.message}</p>}
      </div>

      {isOptionsType && (
        <div className="fm-field">
          <label className="fm-label">Answer Options</label>
          {/* Existing options */}
          {existingOptions.map((opt) => (
            <div key={opt.subQuestionOptionId} className="flex items-center gap-2 mb-1.5">
              <span className="flex-1 px-3 py-2 text-sm border border-[#E0E0E5] rounded-lg bg-[#F2F2F5]" style={{ color: 'var(--color-fm-navy)' }}>
                {opt.optionText}
              </span>
              <button
                type="button"
                title="Remove option"
                onClick={() => handleDeleteExistingOption(opt.subQuestionOptionId)}
                className="p-1 text-[#9CA3AF] hover:text-[#DD2647] transition-colors focus-visible:outline-none"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {/* New inline options */}
          {(fields as { id: string }[]).map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2 mb-1.5">
              <input
                {...register(`options.${idx}.text` as const)}
                className={`${INPUT_CLASS} flex-1`}
                placeholder={`Option ${existingOptions.length + idx + 1}`}
              />
              {(fields as { id: string }[]).length > 1 && (
                <button type="button" onClick={() => remove(idx)} className="p-1 text-[#9CA3AF] hover:text-[#DD2647] transition-colors focus-visible:outline-none">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => append({ text: '' })} className="text-xs text-[#0057CA] hover:underline focus-visible:outline-none mt-0.5 float-right">
            + Add another option
          </button>
          <div className="clear-both" />
        </div>
      )}
    </FormModal>
  );
}

/* Shared form fields for create/edit question */
function QuestionFields({ form, showActive, questionId }: {
  form: UseFormReturn<QuestionFormValues>;
  showActive?: boolean;
  questionId?: number;
}) {
  const { register, watch, control, formState: { errors } } = form;
  const questionType = watch('questionType');
  const isOptionsType = questionType === 'Select' || questionType === 'MultiSelect';

  /* New options being added inline */
  const { fields, append, remove } = useFieldArray({ control, name: 'options' as never });

  /* Auto-add one blank row when type switches to Select/MultiSelect */
  useEffect(() => {
    if (isOptionsType && (fields as { id: string }[]).length === 0) {
      append({ text: '' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOptionsType]);

  /* Existing options (edit mode only) */
  const { data: existingOptions = [] } = useQuestionOptions(questionId ?? 0);
  const { mutate: deleteExistingOption } = useDeleteQuestionOption(questionId ?? 0);
  const { showToast } = useNotification();

  const activeExisting = existingOptions.filter((o) => o.isActive);

  return (
    <>
      <div className="fm-field">
        <label className="fm-label">Question Text <span className="fm-required-star">*</span></label>
        <textarea {...register('questionText')} rows={3} className={`${INPUT_CLASS} resize-none`} placeholder="e.g. What is the insured name?" />
        {errors.questionText && <p className="fm-error-text">{errors.questionText.message}</p>}
      </div>
      <div className="fm-field">
        <label className="fm-label">Description</label>
        <textarea {...register('description')} rows={2} className={`${INPUT_CLASS} resize-none`} placeholder="Optional helper text shown to users below the question" />
        {errors.description && <p className="fm-error-text">{errors.description.message}</p>}
      </div>
      <div className="fm-field">
        <label className="fm-label">Question Type <span className="fm-required-star">*</span></label>
        <select {...register('questionType')} className={INPUT_CLASS}>
          {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.questionType && <p className="fm-error-text">{errors.questionType.message}</p>}
      </div>

      {isOptionsType && (
        <div className="fm-field">
          <label className="fm-label">Answer Options</label>

          {/* Existing options (edit mode) */}
          {activeExisting.map((opt) => (
            <div key={opt.questionOptionId} className="flex items-center gap-2 mb-1.5">
              <span className="flex-1 px-3 py-2 text-sm border border-[#E0E0E5] rounded-lg bg-[#F2F2F5]" style={{ color: 'var(--color-fm-navy)' }}>
                {opt.optionText}
              </span>
              <button
                type="button"
                title="Remove option"
                onClick={() => deleteExistingOption(opt.questionOptionId, {
                  onSuccess: () => showToast('success', 'Option removed.'),
                  onError:   () => showToast('error', 'Failed to remove option.'),
                })}
                className="p-1 text-[#9CA3AF] hover:text-[#DD2647] transition-colors focus-visible:outline-none"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* New inline options */}
          {(fields as { id: string }[]).map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2 mb-1.5">
              <input
                {...register(`options.${idx}.text` as const)}
                className={`${INPUT_CLASS} flex-1`}
                placeholder={`Option ${activeExisting.length + idx + 1}`}
                autoFocus={idx === 0 && activeExisting.length === 0}
              />
              {(fields as { id: string }[]).length > 1 && (
                <button
                  type="button"
                  title="Remove option"
                  onClick={() => remove(idx)}
                  className="p-1 text-[#9CA3AF] hover:text-[#DD2647] transition-colors focus-visible:outline-none"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ text: '' })}
            className="text-xs text-[#0057CA] hover:underline focus-visible:outline-none mt-0.5 float-right"
          >
            + Add another option
          </button>
          <div className="clear-both" />
        </div>
      )}

      {showActive && (
        <div className="fm-field flex-row items-center gap-3">
          <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4 rounded border-[#E0E0E5] accent-[#383B54]" />
          <label htmlFor="isActive" className="fm-label mb-0">Active</label>
        </div>
      )}
    </>
  );
}

import { useState, useMemo } from 'react';
import { useNavigate }       from 'react-router-dom';
import { Plus }              from 'lucide-react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver }       from '@hookform/resolvers/zod';
import { z }                 from 'zod';

import { PageHeading }      from '@/components/common/PageHeading';
import { BackToDashboardButton } from '@/components/common/BackToDashboardButton';
import { DataTable }        from '@/components/common/DataTable';
import type { Column }      from '@/components/common/DataTable';
import { ActiveBadge }      from '@/components/common/StatusBadge';
import { SkeletonLoader }   from '@/components/common/SkeletonLoader';
import { ErrorState }       from '@/components/common/ErrorState';
import { FormModal }        from '@/components/common/FormModal';
import { AdminMobileHint }  from '@/components/common/AdminMobileHint';
import { PrimaryButton }    from '@/components/common/PrimaryButton';
import { INPUT_CLASS }      from '@/utils/constants';
import { usePageTitle }     from '@/hooks/usePageTitle';
import { useForms, useCreateForm, useUpdateForm } from '@/hooks/useForms';
import { useTerritories }   from '@/hooks/useTerritories';
import { useNotification }  from '@/context/NotificationContext';
import type { FormDto }     from '@/api/types/form.types';

/* ── Validation ────────────────────────────────────────────────── */
const formSchema = z.object({
  territoryId: z.number({ error: 'Territory is required' }).min(1, 'Select a territory'),
  formName:    z.string().min(1, 'Form name is required').max(200),
  description: z.string().max(500).optional(),
  isActive:    z.boolean().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function ManageForms() {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  usePageTitle('Manage Forms');

  /* ── Data ────────────────────────────────────────────────────── */
  const { data: forms, isLoading, isError, error, refetch } = useForms();
  const { data: territories } = useTerritories();
  const { mutate: createForm, isPending: isCreating } = useCreateForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const { mutate: updateForm, isPending: isUpdating } = useUpdateForm(editingId ?? 0);

  /* ── UI state ────────────────────────────────────────────────── */
  const [search, setSearch]             = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);

  /* ── Filter ──────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (forms ?? []).filter(
      (f) =>
        f.formName.toLowerCase().includes(q) ||
        f.territoryName.toLowerCase().includes(q) ||
        f.territoryCode.toLowerCase().includes(q),
    );
  }, [forms, search]);

  /* ── Create ──────────────────────────────────────────────────── */
  const createFormHook = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { territoryId: 0, formName: '', description: '' },
  });

  const handleCreate = createFormHook.handleSubmit((values) => {
    createForm(
      { territoryId: values.territoryId, formName: values.formName, description: values.description },
      {
        onSuccess: () => {
          showToast('success', 'Form created successfully.');
          setShowCreateModal(false);
          createFormHook.reset();
        },
        onError: () => showToast('error', 'Failed to create form.'),
      },
    );
  });

  /* ── Edit ────────────────────────────────────────────────────── */
  const editFormHook = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const openEdit = (f: FormDto) => {
    setEditingId(f.formId);
    editFormHook.reset({
      territoryId: f.territoryId,
      formName:    f.formName,
      description: f.description ?? '',
      isActive:    f.isActive,
    });
    setShowEditModal(true);
  };

  const handleEdit = editFormHook.handleSubmit((values) => {
    updateForm(
      { formName: values.formName, description: values.description, isActive: values.isActive ?? true },
      {
        onSuccess: () => {
          showToast('success', 'Form updated.');
          setShowEditModal(false);
          setEditingId(null);
        },
        onError: () => showToast('error', 'Failed to update form.'),
      },
    );
  });

  /* ── Loading / Error ─────────────────────────────────────────── */
  if (isLoading) return <div><PageHeading title="Manage Forms" /><SkeletonLoader rows={5} /></div>;
  if (isError)   return <div><PageHeading title="Manage Forms" /><ErrorState message={error instanceof Error ? error.message : 'Load failed'} onRetry={() => refetch()} /></div>;

  /* ── Columns ─────────────────────────────────────────────────── */
  const columns: Column<FormDto>[] = [
    {
      key:      'formName',
      header:   'Form Name',
      sortable: true,
      render: (row) => (
        <span className="font-medium" style={{ color: 'var(--color-fm-navy)' }}>{row.formName}</span>
      ),
    },
    {
      key:          'territoryName',
      header:       'Territory',
      hideOnMobile: true,
      sortable:     true,
      render: (row) => (
        <span className="text-sm">
          <span className="font-medium">{row.territoryCode}</span>
          <span style={{ color: 'var(--color-fm-muted)' }}> — {row.territoryName}</span>
        </span>
      ),
    },
    {
      key:       'isActive',
      header:    'Status',
      sortable:  true,
      sortValue: (row) => row.isActive ? 'Active' : 'Inactive',
      render: (row) => <ActiveBadge isActive={row.isActive} />,
    },
    {
      key:    'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/forms/${row.formId}/versions`); }}
            className="text-xs text-[#0057CA] hover:underline focus-visible:outline-none"
          >
            Versions
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="text-xs text-[#383B54] hover:text-[#0D102B] border border-[#E0E0E5] px-2 py-0.5 rounded focus-visible:outline-none"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  const pageActions = (
    <div className="flex items-center gap-2">
      <BackToDashboardButton />
      <button
        type="button"
        onClick={() => { createFormHook.reset({ territoryId: 0, formName: '', description: '' }); setShowCreateModal(true); }}
        title="New Form"
        className="inline-flex items-center gap-1.5 px-2 py-2 sm:px-4 rounded-lg text-sm font-medium bg-[#383B54] text-white hover:bg-[#0D102B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">New Form</span>
      </button>
    </div>
  );

  return (
    <div>
      <AdminMobileHint />
      <PageHeading title="Manage Forms" subtitle="Create and configure territory forms" actions={pageActions} />

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search forms or territories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search forms"
          className="w-full sm:max-w-sm px-3 py-2 text-sm rounded-lg border border-[#E0E0E5] focus:outline-none focus:ring-2 focus:ring-[#0073E6] placeholder:text-[#666666]"
        />
      </div>

      {/* Table */}
      <div className="fm-card">
        <DataTable<FormDto>
          columns={columns}
          data={filtered}
          keyField="formId"
          onRowClick={(row) => navigate(`/admin/forms/${row.formId}/versions`)}
          emptyTitle="No forms found"
          emptyDescription={search ? 'Try a different search term.' : 'Create your first form to get started.'}
          emptyActionLabel={search ? undefined : 'New Form'}
          onEmptyAction={search ? undefined : () => setShowCreateModal(true)}
        />
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <FormModal title="New Form" onClose={() => setShowCreateModal(false)} footer={
          <>
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
            <PrimaryButton onClick={handleCreate} loading={isCreating} label="Create Form" />
          </>
        }>
          <FormFields form={createFormHook} territories={territories ?? []} />
        </FormModal>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && (
        <FormModal title="Edit Form" onClose={() => { setShowEditModal(false); setEditingId(null); }} footer={
          <>
            <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
            <PrimaryButton onClick={handleEdit} loading={isUpdating} label="Save Changes" />
          </>
        }>
          <FormFields form={editFormHook} territories={territories ?? []} showActive disableTerritory />
        </FormModal>
      )}
    </div>
  );
}

/* ── Shared form fields ────────────────────────────────────────── */
import type { TerritoryDto } from '@/api/types/territory.types';

function FormFields({
  form,
  territories,
  showActive,
  disableTerritory,
}: {
  form: UseFormReturn<FormValues>;
  territories: TerritoryDto[];
  showActive?: boolean;
  disableTerritory?: boolean;
}) {
  const { register, formState: { errors } } = form;
  return (
    <>
      <div className="fm-field">
        <label className="fm-label">Territory <span className="fm-required-star">*</span></label>
        <select
          {...register('territoryId', { valueAsNumber: true })}
          className={INPUT_CLASS}
          disabled={disableTerritory}
        >
          <option value={0}>— Select Territory —</option>
          {territories.filter(t => t.isActive).map((t) => (
            <option key={t.territoryId} value={t.territoryId}>{t.code} — {t.name}</option>
          ))}
        </select>
        {errors.territoryId && <p className="fm-error-text">{errors.territoryId.message}</p>}
      </div>
      <div className="fm-field">
        <label className="fm-label">Form Name <span className="fm-required-star">*</span></label>
        <input {...register('formName')} className={INPUT_CLASS} placeholder="e.g. AU Essential" />
        {errors.formName && <p className="fm-error-text">{errors.formName.message}</p>}
      </div>
      <div className="fm-field">
        <label className="fm-label">Description</label>
        <textarea {...register('description')} rows={3} className={`${INPUT_CLASS} resize-none`} placeholder="Optional description" />
        {errors.description && <p className="fm-error-text">{errors.description.message}</p>}
      </div>
      {showActive && (
        <div className="fm-field flex-row items-center gap-3">
          <input type="checkbox" id="formIsActive" {...register('isActive')} className="w-4 h-4 rounded border-[#E0E0E5] accent-[#383B54]" />
          <label htmlFor="formIsActive" className="fm-label mb-0">Active</label>
        </div>
      )}
    </>
  );
}

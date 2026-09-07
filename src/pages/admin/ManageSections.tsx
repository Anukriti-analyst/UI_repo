import { useState, useMemo } from 'react';
import { Pencil, PowerOff, Power, Plus } from 'lucide-react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver }      from '@hookform/resolvers/zod';
import { z }                from 'zod';

import { PageHeading }     from '@/components/common/PageHeading';
import { BackToDashboardButton } from '@/components/common/BackToDashboardButton';
import { DataTable }       from '@/components/common/DataTable';
import type { Column }     from '@/components/common/DataTable';
import { ActiveBadge }     from '@/components/common/StatusBadge';
import { SkeletonLoader }  from '@/components/common/SkeletonLoader';
import { ErrorState }      from '@/components/common/ErrorState';
import { FormModal }       from '@/components/common/FormModal';
import { ConfirmModal }    from '@/components/common/ConfirmModal';
import { PrimaryButton }    from '@/components/common/PrimaryButton';
import { INPUT_CLASS }      from '@/utils/constants';
import { AdminMobileHint } from '@/components/common/AdminMobileHint';
import { usePageTitle }    from '@/hooks/usePageTitle';
import {
  useSections,
  useCreateSection,
  useUpdateSection,
} from '@/hooks/useSections';
import { useNotification } from '@/context/NotificationContext';
import type { SectionDto } from '@/api/types/section.types';

/* ── Validation schema ─────────────────────────────────────────── */
const sectionSchema = z.object({
  sectionName:  z.string().min(1, 'Section name is required').max(200),
  displayOrder: z.number({ error: 'Must be a number' }).int().min(0, 'Must be ≥ 0'),
  isActive:     z.boolean().optional(),
});
type SectionFormValues = z.infer<typeof sectionSchema>;

/* ── Table columns (actions column added dynamically in component) ─ */
const BASE_COLUMNS: Column<SectionDto>[] = [
  {
    key:      'sectionName',
    header:   'Section Name',
    sortable: true,
    render: (row) => (
      <span className="font-medium" style={{ color: 'var(--color-fm-navy)' }}>
        {row.sectionName}
      </span>
    ),
  },
  {
    key:          'displayOrder',
    header:       'Display Order',
    hideOnMobile: true,
    sortable:     true,
    render:       (row) => (
      <span className="text-sm" style={{ color: 'var(--color-fm-muted)' }}>
        {row.displayOrder}
      </span>
    ),
  },
  {
    key:      'isActive',
    header:   'Status',
    sortable: true,
    sortValue: (row) => row.isActive ? 'Active' : 'Inactive',
    render: (row) => <ActiveBadge isActive={row.isActive} />,
  },
];

export function ManageSections() {
  const { showToast } = useNotification();
  usePageTitle('Manage Sections');

  /* ── API hooks ───────────────────────────────────────────────── */
  const { data: sections, isLoading, isError, error, refetch } = useSections();
  const { mutate: createSection, isPending: isCreating } = useCreateSection();
  const [editingId, setEditingId] = useState<number | null>(null);
  const { mutate: updateSection, isPending: isUpdating } = useUpdateSection();

  /* ── UI state ────────────────────────────────────────────────── */
  const [search,               setSearch]               = useState('');
  const [showCreateModal,      setShowCreateModal]       = useState(false);
  const [showEditModal,        setShowEditModal]         = useState(false);
  const [editTarget,           setEditTarget]            = useState<SectionDto | null>(null);
  const [showDeactivateModal,  setShowDeactivateModal]   = useState(false);
  const [deactivateTarget,     setDeactivateTarget]      = useState<SectionDto | null>(null);

  /* ── Filtered list ───────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (sections ?? []).filter((s) => s.sectionName.toLowerCase().includes(q));
  }, [sections, search]);

  /* ── Create form ─────────────────────────────────────────────── */
  const createForm = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { sectionName: '', displayOrder: 0 },
  });

  const handleCreate = createForm.handleSubmit((values) => {
    createSection(
      { sectionName: values.sectionName, displayOrder: values.displayOrder },
      {
        onSuccess: () => {
          showToast('success', 'Section created successfully.');
          setShowCreateModal(false);
          createForm.reset();
        },
        onError: () => showToast('error', 'Failed to create section.'),
      },
    );
  });

  /* ── Edit form ───────────────────────────────────────────────── */
  const editForm = useForm<SectionFormValues>({ resolver: zodResolver(sectionSchema) });

  const openEdit = (s: SectionDto) => {
    setEditingId(s.sectionId);
    setEditTarget(s);
    editForm.reset({ sectionName: s.sectionName, displayOrder: s.displayOrder, isActive: s.isActive });
    setShowEditModal(true);
  };

  const handleEdit = editForm.handleSubmit((values) => {
    if (!editingId) return;
    updateSection(
      { id: editingId, sectionName: values.sectionName, displayOrder: values.displayOrder, isActive: values.isActive ?? true },
      {
        onSuccess: () => {
          showToast('success', 'Section updated.');
          setShowEditModal(false);
          setEditingId(null);
          setEditTarget(null);
        },
        onError: () => showToast('error', 'Failed to update section.'),
      },
    );
  });

  /* ── Toggle active ───────────────────────────────────────────── */
  const handleToggleActive = (s: SectionDto) => {
    if (s.isActive) {
      setDeactivateTarget(s);
      setShowDeactivateModal(true);
    } else {
      updateSection(
        { id: s.sectionId, sectionName: s.sectionName, displayOrder: s.displayOrder, isActive: true },
        {
          onSuccess: () => showToast('success', 'Section reactivated.'),
          onError:   () => showToast('error', 'Failed to reactivate section.'),
        },
      );
    }
  };

  const confirmDeactivate = () => {
    if (!deactivateTarget) return;
    updateSection(
      { id: deactivateTarget.sectionId, sectionName: deactivateTarget.sectionName, displayOrder: deactivateTarget.displayOrder, isActive: false },
      {
        onSuccess: () => {
          showToast('success', 'Section deactivated.');
          setShowDeactivateModal(false);
          setDeactivateTarget(null);
          setEditingId(null);
        },
        onError: () => {
          showToast('error', 'Failed to deactivate section.');
          setEditingId(null);
        },
      },
    );
  };

  /* ── Loading / Error ─────────────────────────────────────────── */
  if (isLoading)
    return <div><PageHeading title="Manage Sections" /><SkeletonLoader rows={5} /></div>;
  if (isError)
    return (
      <div>
        <PageHeading title="Manage Sections" />
        <ErrorState
          message={error instanceof Error ? error.message : 'Load failed'}
          onRetry={() => refetch()}
        />
      </div>
    );

  /* ── Actions ─────────────────────────────────────────────────── */
  const createAction = (
    <div className="flex items-center gap-2">
      <BackToDashboardButton />
      <button
        type="button"
        onClick={() => { createForm.reset({ sectionName: '', displayOrder: 0 }); setShowCreateModal(true); }}
        title="New Section"
        className="inline-flex items-center gap-1.5 px-2 py-2 sm:px-4 rounded-lg text-sm font-medium bg-[#383B54] text-white hover:bg-[#0D102B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">New Section</span>
      </button>
    </div>
  );

  return (
    <div>
      <AdminMobileHint />
      <PageHeading title="Manage Sections" subtitle="Create and manage master form sections" actions={createAction} />

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search sections…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search sections"
          className="w-full sm:max-w-sm px-3 py-2 text-sm rounded-lg border border-[#E0E0E5] focus:outline-none focus:ring-2 focus:ring-[#0073E6] placeholder:text-[#666666]"
        />
      </div>

      {/* Table */}
      <div className="fm-card">
        <DataTable<SectionDto>
          columns={[
            ...BASE_COLUMNS,
            {
              key:    'actions',
              header: 'Actions',
              render: (row) => (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(row); }}
                    title="Edit section"
                    aria-label="Edit section"
                    className="inline-flex items-center gap-1.5 p-1.5 sm:px-2 sm:py-0.5 rounded text-[#383B54] hover:text-[#0D102B] border border-[#E0E0E5] hover:bg-[#F2F2F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6] transition-colors"
                  >
                    <Pencil size={14} />
                    <span className="hidden sm:inline text-xs font-medium">Edit</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(row); }}
                    title={row.isActive ? 'Deactivate section' : 'Reactivate section'}
                    aria-label={row.isActive ? 'Deactivate section' : 'Reactivate section'}
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
          keyField="sectionId"
          emptyTitle="No sections found"
          emptyDescription={search ? 'Try a different search term.' : 'Create your first section to get started.'}
          emptyActionLabel={search ? undefined : 'New Section'}
          onEmptyAction={search ? undefined : () => setShowCreateModal(true)}
        />
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <FormModal
          title="New Section"
          onClose={() => setShowCreateModal(false)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]"
              >
                Cancel
              </button>
              <PrimaryButton onClick={handleCreate} loading={isCreating} label="Create Section" />
            </>
          }
        >
          <SectionFields form={createForm} />
        </FormModal>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && editTarget && (
        <FormModal
          title={`Edit: ${editTarget.sectionName}`}
          onClose={() => { setShowEditModal(false); setEditingId(null); setEditTarget(null); }}
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]"
              >
                Cancel
              </button>
              <PrimaryButton onClick={handleEdit} loading={isUpdating} label="Save Changes" />
            </>
          }
        >
          <SectionFields form={editForm} showActive />
        </FormModal>
      )}

      {/* ── Deactivate Confirm ── */}
      {showDeactivateModal && deactivateTarget && (
        <ConfirmModal
          title="Deactivate Section?"
          message={`"${deactivateTarget.sectionName}" will be deactivated and hidden from the form builder.`}
          confirmLabel="Deactivate"
          danger
          onConfirm={confirmDeactivate}
          onCancel={() => { setShowDeactivateModal(false); setDeactivateTarget(null); }}
        />
      )}
    </div>
  );
}

/* ── Shared section form fields ────────────────────────────────── */
function SectionFields({
  form,
  showActive,
}: {
  form: UseFormReturn<SectionFormValues>;
  showActive?: boolean;
}){
  const { register, formState: { errors } } = form;
  return (
    <>
      <div className="fm-field">
        <label className="fm-label">Section Name <span className="fm-required-star">*</span></label>
        <input
          {...register('sectionName')}
          className={INPUT_CLASS}
          placeholder="e.g. Request Details"
        />
        {errors.sectionName && <p className="fm-error-text">{errors.sectionName.message}</p>}
      </div>
      <div className="fm-field">
        <label className="fm-label">Display Order <span className="fm-required-star">*</span></label>
        <input
          type="number"
          {...register('displayOrder', { valueAsNumber: true })}
          className={INPUT_CLASS}
          min={0}
          step={1}
          placeholder="0"
        />
        <p className="fm-helper-text">Lower numbers appear first in the form.</p>
        {errors.displayOrder && <p className="fm-error-text">{errors.displayOrder.message}</p>}
      </div>
      {showActive && (
        <div className="fm-field flex-row items-center gap-3">
          <input
            type="checkbox"
            id="sectionIsActive"
            {...register('isActive')}
            className="w-4 h-4 rounded border-[#E0E0E5] accent-[#383B54]"
          />
          <label htmlFor="sectionIsActive" className="fm-label mb-0">Active</label>
        </div>
      )}
    </>
  );
}

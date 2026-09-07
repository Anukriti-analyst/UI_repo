import { useState }          from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus }              from 'lucide-react';

import { PageHeading }      from '@/components/common/PageHeading';
import { BackToDashboardButton } from '@/components/common/BackToDashboardButton';
import { DataTable }        from '@/components/common/DataTable';
import type { Column }      from '@/components/common/DataTable';
import { SkeletonLoader }   from '@/components/common/SkeletonLoader';
import { ErrorState }       from '@/components/common/ErrorState';
import { ConfirmModal }     from '@/components/common/ConfirmModal';
import { FormModal }        from '@/components/common/FormModal';
import { AdminMobileHint }  from '@/components/common/AdminMobileHint';
import { usePageTitle }     from '@/hooks/usePageTitle';
import {
  useForm as useFormData,
  useFormVersions,
  useCreateVersion,
  useActivateVersion,
} from '@/hooks/useForms';
import { useNotification }  from '@/context/NotificationContext';
import { formatDate }       from '@/utils/formatDate';
import type { FormVersionDto } from '@/api/types/form.types';

export function FormVersions() {
  const { formId: formIdParam } = useParams<{ formId: string }>();
  const formId   = Number(formIdParam) || 0;
  const navigate = useNavigate();
  const { showToast } = useNotification();

  /* ── Data ────────────────────────────────────────────────────── */
  const { data: form }                              = useFormData(formId);
  const { data: versions, isLoading, isError, error, refetch } = useFormVersions(formId);
  const { mutate: createVersion, isPending: isCreatingVer }    = useCreateVersion(formId);
  usePageTitle(form ? `Versions: ${form.formName}` : 'Form Versions');

  /* ── UI state ────────────────────────────────────────────────── */
  const [showCreateModal, setShowCreateModal]     = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activateTarget, setActivateTarget]       = useState<FormVersionDto | null>(null);
  const [notes, setNotes]                         = useState('');

  /* ── Activate mutation (depends on selected target) ──────────── */
  const activateVersionId = activateTarget?.formVersionId ?? 0;
  const { mutate: activateVersion, isPending: isActivating } = useActivateVersion(formId, activateVersionId);

  /* ── Handlers ────────────────────────────────────────────────── */
  const handleCreateVersion = () => {
    createVersion(
      { notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          showToast('success', 'New version created.');
          setShowCreateModal(false);
          setNotes('');
        },
        onError: () => showToast('error', 'Failed to create version.'),
      },
    );
  };

  const handleActivate = () => {
    activateVersion(undefined, {
      onSuccess: () => {
        showToast('success', `Version ${activateTarget?.versionNumber} is now active.`);
        setShowActivateModal(false);
        setActivateTarget(null);
        refetch();
      },
      onError: () => showToast('error', 'Failed to activate version.'),
    });
  };

  /* ── Loading / Error ─────────────────────────────────────────── */
  if (isLoading) return <div><PageHeading title="Form Versions" /><SkeletonLoader rows={4} /></div>;
  if (isError)   return <div><PageHeading title="Form Versions" /><ErrorState message={error instanceof Error ? error.message : 'Load failed'} onRetry={() => refetch()} /></div>;

  /* ── Table columns ───────────────────────────────────────────── */
  const columns: Column<FormVersionDto>[] = [
    {
      key:      'versionNumber',
      header:   'Version',
      sortable: true,
      render: (row) => (
        <span className="font-semibold" style={{ color: 'var(--color-fm-navy)' }}>
          v{row.versionNumber}
        </span>
      ),
    },
    {
      key:          'notes',
      header:       'Notes',
      hideOnMobile: true,
      sortable:     true,
      render: (row) => (
        <span className="text-sm" style={{ color: 'var(--color-fm-muted)' }}>
          {row.notes || '—'}
        </span>
      ),
    },
    {
      key:          'createdAt',
      header:       'Created',
      hideOnMobile: true,
      sortable:     true,
      render:       (row) => (
        <span className="text-sm" style={{ color: 'var(--color-fm-muted)' }}>{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key:      'isActive',
      header:   'Status',
      sortable: true,
      sortValue: (row) => row.isActive ? 'Active' : 'Draft',
      render: (row) => (
        row.isActive
          ? <span className="fm-badge fm-badge-active">Active</span>
          : <span className="fm-badge fm-badge-draft">Draft</span>
      ),
    },
    {
      key:    'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/forms/${formId}/versions/${row.formVersionId}/builder`); }}
            className="text-xs text-[#0057CA] hover:underline focus-visible:outline-none"
          >
            Builder
          </button>
          {!row.isActive && (
            <button
              onClick={(e) => { e.stopPropagation(); setActivateTarget(row); setShowActivateModal(true); }}
              className="text-xs text-[#16B041] border border-[#16B041] px-2 py-0.5 rounded focus-visible:outline-none hover:bg-[#16B041]/5"
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  /* ── Header actions ──────────────────────────────────────────── */
  const pageActions = (
    <div className="flex items-center gap-2">
      <BackToDashboardButton />
      <button
        type="button"
        onClick={() => navigate('/admin/forms')}
        className="px-3 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]"
      >
        ← Forms
      </button>
      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        title="New Version"
        className="inline-flex items-center gap-1.5 px-2 py-2 sm:px-4 rounded-lg text-sm font-medium bg-[#383B54] text-white hover:bg-[#0D102B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">New Version</span>
      </button>
    </div>
  );

  return (
    <div>
      <AdminMobileHint />
      <PageHeading
        title={form ? `Versions: ${form.formName}` : 'Form Versions'}
        subtitle={form ? `${form.territoryCode} — ${form.territoryName}` : undefined}
        actions={pageActions}
      />

      <div className="fm-card">
        <DataTable<FormVersionDto>
          columns={columns}
          data={versions ?? []}
          keyField="formVersionId"
          emptyTitle="No versions yet"
          emptyDescription="Create the first version to start building this form."
          emptyActionLabel="New Version"
          onEmptyAction={() => setShowCreateModal(true)}
        />
      </div>

      {/* ── Create Version Modal ── */}
      {showCreateModal && (
        <FormModal title="Create New Version" onClose={() => setShowCreateModal(false)} footer={
          <>
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border border-[#E0E0E5] rounded-lg text-[#383B54] hover:bg-[#F2F2F5]">Cancel</button>
            <button
              type="button"
              onClick={handleCreateVersion}
              disabled={isCreatingVer}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#383B54] text-white hover:bg-[#0D102B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]"
            >
              {isCreatingVer && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />}
              Create Version
            </button>
          </>
        }>
          <div className="fm-field">
            <label className="fm-label">Version Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E0E0E5] focus:outline-none focus:ring-2 focus:ring-[#0073E6] placeholder:text-[#666666] resize-none"
              placeholder="Optional notes about this version…"
            />
            <p className="fm-helper-text">A new draft version will be created with the next sequential number.</p>
          </div>
        </FormModal>
      )}

      {/* ── Activate Confirm ── */}
      {showActivateModal && activateTarget && (
        <ConfirmModal
          title="Activate Version?"
          message={`Version ${activateTarget.versionNumber} will become the active version for this form. The current active version (if any) will be deactivated.`}
          confirmLabel="Activate"
          isLoading={isActivating}
          onConfirm={handleActivate}
          onCancel={() => { setShowActivateModal(false); setActivateTarget(null); }}
        />
      )}
    </div>
  );
}

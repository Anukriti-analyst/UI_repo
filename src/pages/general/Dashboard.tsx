import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeading }     from '@/components/common/PageHeading';
import { DataTable }       from '@/components/common/DataTable';
import { StatusBadge }     from '@/components/common/StatusBadge';
import { SkeletonLoader }  from '@/components/common/SkeletonLoader';
import { ErrorState }      from '@/components/common/ErrorState';
import { SubmissionCard }  from '@/components/common/SubmissionCard';
import { useSubmissions }  from '@/hooks/useSubmissions';
import { usePageTitle }    from '@/hooks/usePageTitle';
import { formatDate }      from '@/utils/formatDate';
import type { Column }     from '@/components/common/DataTable';
import type { SubmissionSummaryDto } from '@/api/types/submission.types';

/* ── Table column definitions ─────────────────────────────────── */
const COLUMNS: Column<SubmissionSummaryDto>[] = [
  {
    key: 'submissionName',
    header: 'Submission Name',
    sortable: true,
    render: (row) => (
      <span className="font-medium" style={{ color: 'var(--color-fm-navy)' }}>
        {row.submissionName ?? '—'}
      </span>
    ),
  },
  {
    key: 'formName',
    header: 'Form',
    hideOnMobile: true,
    sortable: true,
    render: (row) => (
      <span className="text-sm" style={{ color: 'var(--color-fm-muted)' }}>
        {row.formName}
      </span>
    ),
  },
  {
    key: 'territoryName',
    header: 'Territory',
    hideOnMobile: true,
    sortable: true,
  },
  {
    key: 'versionNumber',
    header: 'Version',
    hideOnMobile: true,
    sortable: true,
    render: (row) => <span>v{row.versionNumber}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'referenceNumber',
    header: 'Reference #',
    hideOnMobile: true,
    sortable: true,
    render: (row) => (
      <span className="font-mono text-xs">
        {row.referenceNumber ?? '—'}
      </span>
    ),
  },
  {
    key: 'submittedAt',
    header: 'Date',
    hideOnMobile: true,
    sortable: true,
    sortValue: (row) => row.status === 'Submitted' ? row.submittedAt ?? '' : row.createdAt,
    render: (row) => (
      <span className="text-xs" style={{ color: 'var(--color-fm-muted)' }}>
        {row.status === 'Submitted'
          ? formatDate(row.submittedAt)
          : formatDate(row.createdAt)}
      </span>
    ),
  },
];

/* ── Filter chip component ────────────────────────────────────── */
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <label className="text-xs font-medium" style={{ color: 'var(--color-fm-muted)' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'fm-input text-sm py-1.5 w-full',
          value !== '' ? 'border-[#0073E6] ring-1 ring-[#0073E6]' : '',
        ].join(' ')}
        style={{ backgroundImage: 'none' }}
        aria-label={`Filter by ${label}`}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useSubmissions();
  usePageTitle('Dashboard');

  /* ── Filter state ─────────────────────────────────────────────── */
  const [filterStatus,    setFilterStatus]    = useState('');
  const [filterTerritory, setFilterTerritory] = useState('');
  const [filterForm,      setFilterForm]      = useState('');

  const goToNew = () => navigate('/submissions/new');

  const submissions = data ?? [];

  /* ── Derive unique filter options from data ───────────────────── */
  const statusOptions    = [...new Set(submissions.map((s) => s.status))].sort();
  const territoryOptions = [...new Set(submissions.map((s) => s.territoryName).filter(Boolean))].sort();
  const formOptions      = [...new Set(submissions.map((s) => s.formName).filter(Boolean))].sort();

  /* ── Apply filters ────────────────────────────────────────────── */
  const filtered = useMemo(() => submissions.filter((s) => {
    if (filterStatus    && s.status        !== filterStatus)    return false;
    if (filterTerritory && s.territoryName !== filterTerritory) return false;
    if (filterForm      && s.formName      !== filterForm)      return false;
    return true;
  }), [submissions, filterStatus, filterTerritory, filterForm]);

  const hasActiveFilter = filterStatus !== '' || filterTerritory !== '' || filterForm !== '';

  const clearFilters = () => {
    setFilterStatus('');
    setFilterTerritory('');
    setFilterForm('');
  };

  /* ── Actions slot for PageHeading ─────────────────────────────── */
  const actions = (
    <button
      type="button"
      onClick={goToNew}
      className={[
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
        'bg-[#383B54] text-white',
        'hover:bg-[#0D102B] transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
      ].join(' ')}
    >
      <span aria-hidden="true">+</span>
      New Submission
    </button>
  );

  /* ── Loading ───────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div>
        <PageHeading
          title="Dashboard"
          subtitle="Your FM Essentials submissions"
          actions={actions}
        />
        <div className="fm-card">
          <SkeletonLoader rows={5} />
        </div>
      </div>
    );
  }

  /* ── Error ─────────────────────────────────────────────────────── */
  if (isError) {
    return (
      <div>
        <PageHeading
          title="Dashboard"
          subtitle="Your FM Essentials submissions"
          actions={actions}
        />
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load submissions.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeading
        title="Dashboard"
        subtitle="Your FM Essentials submissions"
        actions={actions}
      />

      {/* Filter bar */}
      {submissions.length > 0 && (
        <div className="mb-4">
          {/* 2-col grid on mobile, single row on sm+ */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-end gap-3 items-end">
            <FilterSelect
              label="Status"
              value={filterStatus}
              options={statusOptions}
              onChange={setFilterStatus}
            />
            <FilterSelect
              label="Territory"
              value={filterTerritory}
              options={territoryOptions}
              onChange={setFilterTerritory}
            />
            <div className="col-span-2 sm:flex-1 sm:min-w-[180px] sm:max-w-[280px]">
              <FilterSelect
                label="Form"
                value={filterForm}
                options={formOptions}
                onChange={setFilterForm}
              />
            </div>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className={[
                  'col-span-2 sm:col-auto self-end px-3 py-1.5 rounded-lg text-xs font-medium',
                  'border border-[#DD2647] text-[#DD2647]',
                  'hover:bg-[#FAE8ED] transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DD2647]',
                ].join(' ')}
              >
                ✕ Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop/Tablet — table */}
      <div className="fm-card hidden sm:block">
        <DataTable<SubmissionSummaryDto>
          columns={COLUMNS}
          data={filtered}
          keyField="submissionId"
          onRowClick={(row) => navigate(
            row.status === 'Draft'
              ? `/submissions/${row.submissionId}/edit`
              : `/submissions/${row.submissionId}`
          )}
          emptyTitle={hasActiveFilter ? 'No matching submissions' : 'No submissions yet'}
          emptyDescription={hasActiveFilter ? 'Try adjusting or clearing your filters.' : 'Start by selecting a form for your territory.'}
          emptyActionLabel={hasActiveFilter ? 'Clear filters' : 'New Submission'}
          onEmptyAction={hasActiveFilter ? clearFilters : goToNew}
        />
      </div>

      {/* Mobile — cards */}
      <div className="flex flex-col gap-3 sm:hidden">
        {filtered.length === 0 ? (
          <div className="fm-card p-6 text-center">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-fm-navy)' }}>
              {hasActiveFilter ? 'No matching submissions' : 'No submissions yet'}
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--color-fm-muted)' }}>
              {hasActiveFilter ? 'Try adjusting or clearing your filters.' : 'Start by selecting a form for your territory.'}
            </p>
            <button
              type="button"
              onClick={hasActiveFilter ? clearFilters : goToNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#383B54] text-white hover:bg-[#0D102B] transition-colors"
            >
              {hasActiveFilter ? 'Clear filters' : 'New Submission'}
            </button>
          </div>
        ) : (
          filtered.map((s) => <SubmissionCard key={s.submissionId} submission={s} />)
        )}
      </div>

      {/* Stats summary strip */}
      {submissions.length > 0 && (
        <div
          className="mt-4 flex flex-wrap gap-4 text-xs"
          style={{ color: 'var(--color-fm-muted)' }}
          aria-label="Submission statistics"
        >
          <span>{filtered.length}{hasActiveFilter ? ` of ${submissions.length}` : ''} total</span>
          <span>{filtered.filter(s => s.status === 'Draft').length} draft</span>
          <span>{filtered.filter(s => s.status === 'Submitted').length} submitted</span>
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="text-[#DD2647] hover:underline focus-visible:outline-none"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}



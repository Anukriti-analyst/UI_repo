import { useState }          from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageHeading }          from '@/components/common/PageHeading';
import { StatusBadge }          from '@/components/common/StatusBadge';
import { SkeletonLoader }       from '@/components/common/SkeletonLoader';
import { ErrorState }           from '@/components/common/ErrorState';
import { ConfirmModal }         from '@/components/common/ConfirmModal';
import { EmailSubmissionModal } from '@/components/common/EmailSubmissionModal';
import { useSubmissionDetail, useDownloadPdf, useSubmitSubmission } from '@/hooks/useSubmissions';
import { useCategoryGroupsByVersionWithValues } from '@/hooks/useCategories';
import { useTerritories }       from '@/hooks/useTerritories';
import { useNotification }      from '@/context/NotificationContext';
import { formatDateTime } from '@/utils/formatDate';
import type { SubmissionSectionDto } from '@/api/types/submission.types';
import type { CategoryGroupDto, CategoryDto, CategoryValueDto } from '@/api/types/category.types';

export function SubmissionDetail() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate          = useNavigate();
  const { showToast }     = useNotification();

  const { data, isLoading, isError, error, refetch } = useSubmissionDetail(submissionId ?? '');
  const downloadPdf = useDownloadPdf();
  const { mutate: submitMutation, isPending: isSubmitting } = useSubmitSubmission(submissionId ?? '');

  const [showEmailModal,   setShowEmailModal]   = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isPdfLoading,     setIsPdfLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'limits'>('form');

  /* ── Category / limits data ─────────────────────────────────── */
  const formVersionId = data?.formVersionId ?? 0;
  const { data: categoryGroups, isLoading: isCategoriesLoading } = useCategoryGroupsByVersionWithValues(formVersionId);
  const { data: territories } = useTerritories();

  /* ── PDF download ─────────────────────────────────────────────── */
  const handleDownloadPdf = async () => {
    if (!submissionId) return;
    setIsPdfLoading(true);
    try {
      downloadPdf(submissionId);
    } finally {
      setTimeout(() => setIsPdfLoading(false), 1500);
    }
  };

  /* ── Submit ───────────────────────────────────────────────────── */
  const handleSubmit = () => {
    submitMutation(undefined, {
      onSuccess: () => {
        showToast('success', 'Submission finalized successfully.');
        setShowSubmitConfirm(false);
        navigate('/');
      },
      onError: () => {
        showToast('error', 'Could not submit. Please try again.');
        setShowSubmitConfirm(false);
      },
    });
  };

  /* ── Loading ───────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div>
        <PageHeading title="Submission Detail" />
        <div className="fm-card">
          <SkeletonLoader rows={8} />
        </div>
      </div>
    );
  }

  /* ── Error ─────────────────────────────────────────────────────── */
  if (isError || !data) {
    return (
      <div>
        <PageHeading title="Submission Detail" />
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load submission.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const isDraft     = data.status === 'Draft';
  const isSubmitted = data.status === 'Submitted';

  /* ── Actions ───────────────────────────────────────────────────── */
  const actions = (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
      {/* PDF download */}
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isPdfLoading}
        aria-label="Download submission as PDF"
        className={[
          'inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
          'border border-[#E0E0E5] bg-white text-[#383B54]',
          'hover:bg-[#F2F2F5] transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        {isPdfLoading ? (
          <span className="w-4 h-4 border-2 border-[#383B54]/30 border-t-[#383B54] rounded-full animate-spin" aria-hidden="true" />
        ) : (
          <PdfIcon />
        )}
        Download PDF
      </button>

      {/* Email */}
      <button
        type="button"
        onClick={() => setShowEmailModal(true)}
        aria-label="Email this submission"
        className={[
          'inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
          'border border-[#E0E0E5] bg-white text-[#383B54]',
          'hover:bg-[#F2F2F5] transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
        ].join(' ')}
      >
        <EmailIcon />
        Email
      </button>

      {/* Submit — only for drafts */}
      {isDraft && (
        <button
          type="button"
          onClick={() => setShowSubmitConfirm(true)}
          aria-label="Submit this form"
          className={[
            'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
            'bg-[#383B54] text-white',
            'hover:bg-[#0D102B] transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
          ].join(' ')}
        >
          Submit
        </button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeading
        title={data.submissionName ?? data.formName}
        subtitle={data.submissionName ? `${data.formName} · ${data.territoryName} · v${data.versionNumber}` : `${data.territoryName} · v${data.versionNumber}`}
        actions={actions}
      />

      {/* Meta card */}
      <div className="fm-card mb-6">
        <div className="fm-card-body">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="fm-label">Status</dt>
              <dd><StatusBadge status={data.status} /></dd>
            </div>
            <div>
              <dt className="fm-label">Reference #</dt>
              <dd className="font-mono">{data.referenceNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="fm-label">{isSubmitted ? 'Submitted' : 'Created'}</dt>
              <dd style={{ color: 'var(--color-fm-muted)' }}>
                {isSubmitted
                  ? formatDateTime(data.submittedAt)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="fm-label">Territory</dt>
              <dd>{data.territoryName}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Draft notice */}
      {isDraft && (
        <div
          className="mb-6 flex items-start gap-3 px-4 py-3 rounded-lg border border-[#E6BC00] bg-[#FFF7D8] text-sm"
          role="status"
        >
          <span className="text-[#E6BC00] mt-0.5" aria-hidden="true">⚠</span>
          <span style={{ color: '#584921' }}>
            This submission is a draft.{' '}
            <button
              type="button"
              onClick={() => navigate(`/submissions/${submissionId}/edit`)}
              className="font-semibold text-[#0057CA] hover:underline"
            >
              Continue Editing →
            </button>
          </span>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex border-b border-[#E0E0E5] mb-6" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'form'}
          onClick={() => setActiveTab('form')}
          className={[
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'form'
              ? 'border-[#0057CA] text-[#0057CA]'
              : 'border-transparent text-[#6B7280] hover:text-[#383B54] hover:border-[#D1D5DB]',
          ].join(' ')}
        >
          Form Details
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'limits'}
          onClick={() => setActiveTab('limits')}
          className={[
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'limits'
              ? 'border-[#0057CA] text-[#0057CA]'
              : 'border-transparent text-[#6B7280] hover:text-[#383B54] hover:border-[#D1D5DB]',
          ].join(' ')}
        >
          Reference Limits
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'form' ? (
        <>
          {/* Sections */}
          <div className="fm-section-gap">
            {data.sections
              .slice()
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((section) => (
                <SectionBlock key={section.submissionSectionId} section={section} />
              ))}
          </div>
        </>
      ) : (
        <LimitsTab
          categoryGroups={categoryGroups ?? []}
          territories={territories ?? []}
          territoryName={data.territoryName}
          isLoading={isCategoriesLoading}
        />
      )}

      {/* Back link */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-[#0057CA] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6] rounded"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Modals */}
      {showEmailModal && (
        <EmailSubmissionModal
          submissionId={data.submissionId}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {showSubmitConfirm && (
        <ConfirmModal
          title="Submit Submission?"
          message="Once submitted, you cannot edit this submission. Are you sure you want to proceed?"
          confirmLabel="Yes, Submit"
          isLoading={isSubmitting}
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmitConfirm(false)}
        />
      )}
    </div>
  );
}

/* ── Section block (read-only) ────────────────────────────────── */
function SectionBlock({ section }: { section: SubmissionSectionDto }) {
  return (
    <section aria-labelledby={`section-${section.submissionSectionId}`} className="fm-card">
      <div className="fm-card-header">
        <h2
          id={`section-${section.submissionSectionId}`}
          className="fm-section-title mb-0"
        >
          {section.sectionName}
        </h2>
      </div>
      <div className="fm-card-body">
        {section.answers.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'var(--color-fm-muted)' }}>
            No answers recorded for this section.
          </p>
        ) : (
          <dl className="divide-y divide-[#E0E0E5]">
            {section.answers.map((answer) => (
              <div
                key={answer.submissionAnswerId}
                className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-1"
              >
                <dt className="text-sm font-medium" style={{ color: 'var(--color-fm-navy)' }}>
                  {answer.questionText}
                </dt>
                <dd className="text-sm" style={{ color: answer.answerValue ? '#000000' : 'var(--color-fm-muted)' }}>
                  {answer.answerValue ?? <em>Not answered</em>}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

/* ── Inline icons ─────────────────────────────────────────────── */
function PdfIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path fillRule="evenodd" d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Zm2 6a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7Z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

/* ── Limits / Reference Data Tab ──────────────────────────────── */
interface LimitsTabProps {
  categoryGroups: CategoryGroupDto[];
  territories: { territoryId: number; code: string; name: string; isActive: boolean }[];
  territoryName: string;
  isLoading: boolean;
}

function LimitsTab({ categoryGroups, territories, territoryName, isLoading }: LimitsTabProps) {
  if (isLoading) {
    return <SkeletonLoader rows={5} />;
  }

  if (categoryGroups.length === 0) {
    return (
      <div className="fm-card">
        <div className="fm-card-body text-center py-8">
          <p className="text-sm" style={{ color: 'var(--color-fm-muted)' }}>
            No reference limits configured for this form version.
          </p>
        </div>
      </div>
    );
  }

  // Find territory ID matching submission territory name
  const matchingTerritory = territories.find(t => t.name === territoryName || t.code === territoryName);
  const territoryId = matchingTerritory?.territoryId ?? 0;

  return (
    <div className="space-y-4">
      {/* Territory context banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E8F4FD] border border-[#B8DCFA]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#0057CA] shrink-0" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
        </svg>
        <span className="text-xs sm:text-sm font-medium text-[#0057CA]">
          Showing limits for territory: <strong>{territoryName}</strong>
        </span>
      </div>

      {/* Category groups */}
      {categoryGroups.map((group) => (
        <LimitsGroupCard
          key={group.categoryGroupId}
          group={group}
          territoryId={territoryId}
          territories={territories}
        />
      ))}
    </div>
  );
}

/* ── Limits Group Card ────────────────────────────────────────── */
function LimitsGroupCard({
  group, territoryId, territories,
}: {
  group: CategoryGroupDto;
  territoryId: number;
  territories: { territoryId: number; code: string; name: string }[];
}) {
  const categories = group.categories ?? [];

  return (
    <section className="fm-card">
      <div className="fm-card-header flex items-center gap-2">
        <h3 className="fm-section-title mb-0 text-sm">{group.groupName}</h3>
        <span className="text-xs px-2 py-0.5 rounded bg-[#F2F2F5]" style={{ color: 'var(--color-fm-muted)' }}>
          {group.source}
        </span>
      </div>
      <div className="fm-card-body">
        {categories.length === 0 ? (
          <p className="text-xs italic" style={{ color: 'var(--color-fm-muted)' }}>No categories in this group.</p>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="sm:hidden divide-y divide-[#F2F2F5]">
              {categories.map((cat) => (
                <LimitsCategoryCard key={cat.categoryId} category={cat} territoryId={territoryId} territories={territories} />
              ))}
            </div>
            {/* Tablet+: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col />
                  <col style={{ width: '8rem' }} />
                  <col style={{ width: '7rem' }} />
                  <col style={{ width: '9rem' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-[#E0E0E5]">
                    <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--color-fm-muted)' }}>Category</th>
                    <th className="px-3 py-2 text-right font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--color-fm-muted)' }}>Value</th>
                    <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--color-fm-muted)' }}>Unit</th>
                    <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--color-fm-muted)' }}>Qualifier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F2F5]">
                  {categories.map((cat) => (
                    <LimitsCategoryRow key={cat.categoryId} category={cat} territoryId={territoryId} territories={territories} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ── Limits Category Card (mobile) ────────────────────────────── */
function LimitsCategoryCard({
  category, territoryId, territories,
}: {
  category: CategoryDto;
  territoryId: number;
  territories: { territoryId: number; code: string; name: string }[];
}) {
  const values = category.values ?? [];
  const territoryValue = values.find(v => v.territoryId === territoryId);
  const displayVal: CategoryValueDto | undefined = territoryValue ?? values[0];
  const isFallback = !territoryValue && !!displayVal;

  const formatValue = (v: CategoryValueDto | undefined) => {
    if (!v) return '—';
    if (v.numericValue !== null) {
      const formatted = v.numericValue.toLocaleString();
      return v.currency ? `${v.currency} ${formatted}` : formatted;
    }
    return v.textValue ?? '—';
  };

  return (
    <div className="py-3">
      <div className="font-medium text-sm mb-2" style={{ color: 'var(--color-fm-navy)' }}>
        {category.displayName || category.categoryKey}
        {category.displayName && (
          <span className="ml-1.5 text-xs font-mono" style={{ color: 'var(--color-fm-muted)' }}>
            ({category.categoryKey})
          </span>
        )}
        {isFallback && (
          <span className="ml-1.5 text-xs" style={{ color: 'var(--color-fm-muted)' }}>
            [{territories.find(t => t.territoryId === displayVal!.territoryId)?.code ?? 'other'}]
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-fm-muted)' }}>Value</div>
          <div className="font-semibold" style={{ color: isFallback ? 'var(--color-fm-muted)' : 'var(--color-fm-navy)' }}>
            {formatValue(displayVal)}
          </div>
        </div>
        <div>
          <div className="font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-fm-muted)' }}>Unit</div>
          <div style={{ color: 'var(--color-fm-muted)' }}>{displayVal?.unit ?? '—'}</div>
        </div>
        <div>
          <div className="font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-fm-muted)' }}>Qualifier</div>
          <div style={{ color: 'var(--color-fm-muted)' }}>{displayVal?.qualifier ?? '—'}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Limits Category Row (tablet+) ───────────────────────────── */
function LimitsCategoryRow({
  category, territoryId, territories,
}: {
  category: CategoryDto;
  territoryId: number;
  territories: { territoryId: number; code: string; name: string }[];
}) {
  const values = category.values ?? [];
  const territoryValue = values.find(v => v.territoryId === territoryId);
  const displayVal: CategoryValueDto | undefined = territoryValue ?? values[0];

  const formatValue = (v: CategoryValueDto | undefined) => {
    if (!v) return '—';
    if (v.numericValue !== null) {
      const formatted = v.numericValue.toLocaleString();
      return v.currency ? `${v.currency} ${formatted}` : formatted;
    }
    return v.textValue ?? '—';
  };

  const isFallback = !territoryValue && displayVal;

  return (
    <tr className="hover:bg-[#FAFAFA]">
      <td className="px-3 py-2.5 min-w-0">
        <div className="flex flex-col">
          <span className="font-medium text-sm" style={{ color: 'var(--color-fm-navy)' }}>
            {category.displayName || category.categoryKey}
          </span>
          {category.displayName && (
            <span className="text-xs font-mono" style={{ color: 'var(--color-fm-muted)' }}>
              {category.categoryKey}
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5 text-right whitespace-nowrap">
        <span className="font-semibold text-sm" style={{ color: isFallback ? 'var(--color-fm-muted)' : 'var(--color-fm-navy)' }}>
          {formatValue(displayVal)}
        </span>
        {isFallback && (
          <span className="block text-xs" style={{ color: 'var(--color-fm-muted)' }}>
            ({territories.find(t => t.territoryId === displayVal!.territoryId)?.code ?? 'other'})
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-sm whitespace-nowrap" style={{ color: 'var(--color-fm-muted)' }}>
        {displayVal?.unit ?? '—'}
      </td>
      <td className="px-3 py-2.5 text-sm" style={{ color: 'var(--color-fm-muted)' }}>
        {displayVal?.qualifier ?? '—'}
      </td>
    </tr>
  );
}

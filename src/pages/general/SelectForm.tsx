import { useState }       from 'react';
import { useNavigate }    from 'react-router-dom';

import { PageHeading }       from '@/components/common/PageHeading';
import { LoadingSpinner }    from '@/components/common/LoadingSpinner';
import { ErrorState }        from '@/components/common/ErrorState';
import { EmptyState }        from '@/components/common/EmptyState';
import { useTerritories }    from '@/hooks/useTerritories';
import { useForms, useFormActiveVersion } from '@/hooks/useForms';
import { useCreateSubmission }  from '@/hooks/useSubmissions';
import { useNotification }      from '@/context/NotificationContext';
import type { FormDto }         from '@/api/types/form.types';

export function SelectForm() {
  const navigate   = useNavigate();
  const { showToast } = useNotification();

  const [selectedTerritoryCode, setSelectedTerritoryCode] = useState('');
  const [selectedFormId,        setSelectedFormId]         = useState<number | null>(null);
  const [submissionName,        setSubmissionName]         = useState('');
  const [isStarting,            setIsStarting]             = useState(false);

  /* ── Data hooks ────────────────────────────────────────────────── */
  const { data: territories, isLoading: loadingTerritories } = useTerritories();
  const {
    data: forms,
    isLoading: loadingForms,
    isError: formsError,
  } = useForms(selectedTerritoryCode || undefined);
  const { data: activeVersion } = useFormActiveVersion(selectedFormId ?? 0);
  const { mutate: createSubmission } = useCreateSubmission();

  /* ── Start submission flow ─────────────────────────────────────── */
  const handleStartForm = () => {
    if (!selectedFormId || !activeVersion) return;
    if (!submissionName.trim()) { showToast('error', 'Please enter a Submission Name before starting.'); return; }
    setIsStarting(true);
    createSubmission(
      {
        formVersionId: activeVersion.formVersionId,
        submissionName: submissionName.trim(),
      },
      {
        onSuccess: (res) => {
          const submission = (res as { data: { submissionId: string } }).data;
          navigate(`/submissions/new/${activeVersion.formVersionId}`, {
            state: { submissionId: submission.submissionId },
          });
        },
        onError: () => {
          showToast('error', 'Could not start form. Please try again.');
          setIsStarting(false);
        },
      },
    );
  };

  /* ── Loading territories ───────────────────────────────────────── */
  if (loadingTerritories) {
    return (
      <div>
        <PageHeading title="New Submission" subtitle="Select a territory and form to get started" />
        <LoadingSpinner label="Loading territories…" />
      </div>
    );
  }

  const activeTerritories = territories?.filter(t => t.isActive) ?? [];

  return (
    <div>
      <PageHeading
        title="New Submission"
        subtitle="Select a territory and form to get started"
      />

      {/* Step 1: Territory */}
      <div className="fm-card mb-6">
        <div className="fm-card-header">
          <h2 className="fm-section-title mb-0">1. Select Territory</h2>
        </div>
        <div className="fm-card-body">
          <div className="fm-field max-w-md">
            <label htmlFor="territory-select" className="fm-label">
              Territory <span className="fm-required-star">*</span>
            </label>
            <select
              id="territory-select"
              value={selectedTerritoryCode}
              onChange={(e) => {
                setSelectedTerritoryCode(e.target.value);
                setSelectedFormId(null);
              }}
              className={[
                'w-full px-3 py-2 text-sm rounded-lg border border-[#E0E0E5] bg-white',
                'focus:outline-none focus:ring-2 focus:ring-[#0073E6] focus:border-transparent',
                'disabled:bg-[#F2F2F5] disabled:text-[#666666]',
              ].join(' ')}
            >
              <option value="">— Select a territory —</option>
              {activeTerritories.map((t) => (
                <option key={t.territoryId} value={t.code}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Step 2: Form list */}
      {selectedTerritoryCode && (
        <div className="fm-card mb-6">
          <div className="fm-card-header">
            <h2 className="fm-section-title mb-0">2. Select Form</h2>
          </div>
          <div className="fm-card-body">
            {loadingForms ? (
              <LoadingSpinner label="Loading forms…" size="sm" />
            ) : formsError ? (
              <ErrorState message="Could not load forms for this territory." />
            ) : !forms || forms.length === 0 ? (
              <EmptyState
                title="No forms available"
                description="There are no active forms for this territory yet."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {forms.filter(f => f.isActive).map((form) => (
                  <FormCard
                    key={form.formId}
                    form={form}
                    selected={selectedFormId === form.formId}
                    onClick={() => { setSelectedFormId(form.formId); setSubmissionName(''); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Name your submission */}
      {selectedFormId && (
        <div className="fm-card mb-6">
          <div className="fm-card-header">
            <h2 className="fm-section-title mb-0">3. Name Your Submission</h2>
          </div>
          <div className="fm-card-body">
            <div className="fm-field max-w-md">
              <label htmlFor="submission-name" className="fm-label">
                Submission Name <span className="fm-required-star">*</span>
              </label>
              <input
                id="submission-name"
                type="text"
                value={submissionName}
                onChange={(e) => setSubmissionName(e.target.value)}
                placeholder="e.g. ABC Corp — Renewal 2025"
                maxLength={150}
                className={[
                  'w-full px-3 py-2 text-sm rounded-lg border bg-white',
                  'focus:outline-none focus:ring-2 focus:ring-[#0073E6] focus:border-transparent',
                  submissionName.trim() === '' ? 'border-[#E0E0E5]' : 'border-[#0073E6]',
                ].join(' ')}
              />
              <p className="fm-helper-text mt-1">
                A unique label to identify this submission on your dashboard (e.g. client name, policy number).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Start */}
      {selectedFormId && (
        <div className="fm-card">
          <div className="fm-card-body flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-fm-navy)' }}>
                Ready to start?
              </p>
              {activeVersion ? (
                <p className="text-xs" style={{ color: 'var(--color-fm-muted)' }}>
                  Active version: v{activeVersion.versionNumber}
                </p>
              ) : (
                <p className="text-xs text-[#DD2647]">
                  No active version available for this form.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleStartForm}
              disabled={!activeVersion || isStarting || !submissionName.trim()}
              className={[
                'w-full sm:w-auto inline-flex items-center justify-center gap-2',
                'px-6 py-2.5 rounded-lg text-sm font-medium',
                'bg-[#383B54] text-white hover:bg-[#0D102B]',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              ].join(' ')}
            >
              {isStarting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Starting…
                </>
              ) : (
                'Start Form →'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Form selection card ──────────────────────────────────────── */
interface FormCardProps {
  form: FormDto;
  selected: boolean;
  onClick: () => void;
}

function FormCard({ form, selected, onClick }: FormCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'text-left w-full p-4 rounded-lg border-2 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073E6]',
        selected
          ? 'border-[#0073E6] bg-[#EFF6FE]'
          : 'border-[#E0E0E5] bg-white hover:border-[#383B54] hover:bg-[#F2F2F5]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-sm font-semibold leading-tight"
          style={{ color: selected ? '#0057CA' : 'var(--color-fm-navy)' }}
        >
          {form.formName}
        </span>
        {selected && (
          <span className="text-[#0073E6] shrink-0" aria-hidden="true">✓</span>
        )}
      </div>
      {form.description && (
        <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-fm-muted)' }}>
          {form.description}
        </p>
      )}
    </button>
  );
}

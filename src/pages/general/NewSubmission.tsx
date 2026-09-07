import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { PageHeading }    from '@/components/common/PageHeading';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { ErrorState }     from '@/components/common/ErrorState';
import { FormWizard }     from '@/components/wizard/FormWizard';
import { useFormDefinition } from '@/hooks/useForms';

interface LocationState {
  submissionId?: string;
  isPreview?: boolean;
  formId?: number;
  versionId?: number;
}

export function NewSubmission() {
  const { formVersionId } = useParams<{ formVersionId: string }>();
  const location  = useLocation();
  const navigate  = useNavigate();

  const state        = (location.state as LocationState) ?? {};
  const submissionId = state.submissionId;
  const isPreview    = state.isPreview ?? false;
  const versionId    = Number(formVersionId ?? 0);
  const builderFormId = state.formId;
  const builderVersionId = state.versionId;

  const { data: definition, isLoading, isError, error, refetch } = useFormDefinition(versionId);

  /* Guard: if no submissionId in state, redirect to select form */
  if (!submissionId) {
    navigate('/submissions/new', { replace: true });
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <PageHeading title="Loading Form…" />
        <div className="fm-card">
          <SkeletonLoader rows={6} />
        </div>
      </div>
    );
  }

  if (isError || !definition) {
    return (
      <div>
        <PageHeading title="Fill Form" />
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load form definition.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      {isPreview && (
        <div className="flex items-center justify-between mb-3 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200">
          <span className="text-sm font-medium text-amber-700">
            🔍 Preview mode — this submission will not appear in the dashboard
          </span>
          <button
            type="button"
            onClick={() =>
              navigate(
                builderFormId && builderVersionId
                  ? `/admin/forms/${builderFormId}/versions/${builderVersionId}/builder`
                  : -1 as unknown as string,
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-amber-400 text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Form Builder
          </button>
        </div>
      )}
      <PageHeading
        title={definition.formName}
        subtitle={`Version ${definition.versionNumber}`}
      />
      <FormWizard
        definition={definition}
        submissionId={submissionId}
        isPreview={isPreview}
      />
    </div>
  );
}

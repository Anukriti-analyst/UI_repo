import { useNavigate, useParams } from 'react-router-dom';

import { PageHeading }    from '@/components/common/PageHeading';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { ErrorState }     from '@/components/common/ErrorState';
import { FormWizard }     from '@/components/wizard/FormWizard';
import { useFormDefinition } from '@/hooks/useForms';
import { useSubmissionDetail } from '@/hooks/useSubmissions';

/**
 * EditSubmission — resumes a draft submission in the form wizard.
 * Loads the submission detail (to get formVersionId + saved answers),
 * then loads the form definition and renders the wizard with pre-populated data.
 */
export function EditSubmission() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const {
    data: submission,
    isLoading: isLoadingSubmission,
    isFetching: isFetchingSubmission,
    isError: isSubmissionError,
    error: submissionError,
    refetch: refetchSubmission,
  } = useSubmissionDetail(submissionId ?? '', { forceRefresh: true });

  const formVersionId = submission?.formVersionId ?? 0;

  const {
    data: definition,
    isLoading: isLoadingDefinition,
    isError: isDefinitionError,
    error: definitionError,
    refetch: refetchDefinition,
  } = useFormDefinition(formVersionId);

  /* Guard: if submission is not a draft, redirect to detail view */
  if (submission && submission.status !== 'Draft') {
    navigate(`/submissions/${submissionId}`, { replace: true });
    return null;
  }

  if (isLoadingSubmission || isFetchingSubmission || (formVersionId > 0 && isLoadingDefinition)) {
    return (
      <div>
        <PageHeading title="Loading Form…" />
        <div className="fm-card">
          <SkeletonLoader rows={6} />
        </div>
      </div>
    );
  }

  if (isSubmissionError || !submission) {
    return (
      <div>
        <PageHeading title="Resume Submission" />
        <ErrorState
          message={submissionError instanceof Error ? submissionError.message : 'Could not load submission.'}
          onRetry={() => refetchSubmission()}
        />
      </div>
    );
  }

  if (isDefinitionError || !definition) {
    return (
      <div>
        <PageHeading title="Resume Submission" />
        <ErrorState
          message={definitionError instanceof Error ? definitionError.message : 'Could not load form definition.'}
          onRetry={() => refetchDefinition()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeading
        title={definition.formName}
        subtitle={`Version ${definition.versionNumber}`}
      />
      <FormWizard
        definition={definition}
        submissionId={submission.submissionId}
        savedSections={submission.sections}
      />
    </div>
  );
}

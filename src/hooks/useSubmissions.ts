import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  SubmissionSummaryDto, SubmissionDetailDto,
  CreateSubmissionRequest, SaveAnswersRequest, EmailSubmissionRequest,
} from '@/api/types/submission.types';

export function useSubmissions() {
  return useQuery<SubmissionSummaryDto[]>({
    queryKey: ['submissions'],
    queryFn:  async () => (await apiClient.get<SubmissionSummaryDto[]>(ENDPOINTS.submissions)).data,
  });
}

export function useSubmissionDetail(id: string, options?: { forceRefresh?: boolean }) {
  return useQuery<SubmissionDetailDto>({
    queryKey: ['submissions', id],
    queryFn:  async () => (await apiClient.get<SubmissionDetailDto>(ENDPOINTS.submission(id))).data,
    enabled:  !!id,
    // When editing a draft, always fetch fresh data so saved answers are shown
    staleTime:      options?.forceRefresh ? 0 : undefined,
    refetchOnMount: options?.forceRefresh ? 'always' : undefined,
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubmissionRequest) =>
      apiClient.post<SubmissionSummaryDto>(ENDPOINTS.submissions, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['submissions'] }),
  });
}

/** Admin-only: create a preview submission against any form version regardless of isActive status. */
export function useCreatePreviewSubmission(versionId: number) {
  return useMutation({
    mutationFn: () =>
      apiClient.post<SubmissionSummaryDto>(ENDPOINTS.adminFormVersionPreview(versionId)),
  });
}

export function useSaveAnswers(submissionId: string) {
  return useMutation({
    mutationFn: (data: SaveAnswersRequest) =>
      apiClient.put(ENDPOINTS.submissionAnswers(submissionId), data, { skipToast: true }),
  });
}

export function useSubmitSubmission(submissionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(ENDPOINTS.submissionSubmit(submissionId)),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['submissions'] }),
  });
}

export function useEmailSubmission(submissionId: string) {
  return useMutation({
    mutationFn: (data: EmailSubmissionRequest) =>
      apiClient.post(ENDPOINTS.submissionEmail(submissionId), data),
  });
}

/** Triggers a PDF download by opening the URL in a new tab.
 *  Uses a relative path so it goes through the Vite proxy in dev. */
export function useDownloadPdf() {
  return (submissionId: string) => {
    window.open(ENDPOINTS.submissionPdf(submissionId), '_blank', 'noopener,noreferrer');
  };
}

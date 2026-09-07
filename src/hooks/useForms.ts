import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  FormDefinitionDto, FormDto, FormVersionDto,
  CreateFormRequest, UpdateFormRequest, CreateVersionRequest,
  AddSectionToVersionRequest, AddQuestionToSectionRequest, UpdateFormQuestionRequest,
  UpdateFormSectionRequest,
} from '@/api/types/form.types';

/* ── General ─────────────────────────────────────────────────────── */
export function useForms(territoryCode?: string) {
  return useQuery<FormDto[]>({
    queryKey: ['forms', territoryCode],
    queryFn:  async () => {
      const url = territoryCode ? `${ENDPOINTS.forms}?territoryCode=${territoryCode}` : ENDPOINTS.forms;
      return (await apiClient.get<FormDto[]>(url)).data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useForm(formId: number) {
  return useQuery<FormDto>({
    queryKey: ['forms', formId],
    queryFn:  async () => (await apiClient.get<FormDto>(ENDPOINTS.form(formId))).data,
    enabled:  formId > 0,
  });
}

export function useFormVersions(formId: number) {
  return useQuery<FormVersionDto[]>({
    queryKey: ['forms', formId, 'versions'],
    queryFn:  async () => (await apiClient.get<FormVersionDto[]>(ENDPOINTS.formVersions(formId))).data,
    enabled:  formId > 0,
  });
}

export function useFormActiveVersion(formId: number) {
  return useQuery<FormVersionDto>({
    queryKey: ['forms', formId, 'active-version'],
    queryFn:  async () => (await apiClient.get<FormVersionDto>(ENDPOINTS.formActiveVersion(formId))).data,
    enabled:  formId > 0,
  });
}

export function useFormDefinition(formVersionId: number) {
  return useQuery<FormDefinitionDto>({
    queryKey: ['form-definition', formVersionId],
    queryFn:  async () => (await apiClient.get<FormDefinitionDto>(ENDPOINTS.formDefinition(formVersionId))).data,
    enabled:  formVersionId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/* ── Admin mutations ─────────────────────────────────────────────── */
export function useCreateForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormRequest) => apiClient.post<FormDto>(ENDPOINTS.adminForms, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['forms'] }),
  });
}

export function useUpdateForm(formId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFormRequest) => apiClient.put<FormDto>(ENDPOINTS.adminForm(formId), data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['forms'] }),
  });
}

export function useCreateVersion(formId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVersionRequest) => apiClient.post<FormVersionDto>(ENDPOINTS.adminFormVersions(formId), data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['forms', formId, 'versions'] }),
  });
}

export function useActivateVersion(formId: number, versionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(ENDPOINTS.adminActivateVersion(formId, versionId)),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['forms', formId] }),
  });
}

export function useAddSectionToVersion(formVersionId: number) {
  return useMutation({
    mutationFn: (data: AddSectionToVersionRequest) =>
      apiClient.post(ENDPOINTS.adminVersionSections(formVersionId), data),
  });
}

export function useAddQuestionToSection(formSectionId: number) {
  return useMutation({
    mutationFn: (data: AddQuestionToSectionRequest) =>
      apiClient.post(ENDPOINTS.adminSectionQuestions(formSectionId), data),
  });
}

export function useUpdateFormQuestion(formQuestionId: number) {
  return useMutation({
    mutationFn: (data: UpdateFormQuestionRequest) =>
      apiClient.put(ENDPOINTS.adminFormQuestion(formQuestionId), data),
  });
}

export function useRemoveFormQuestion() {
  return useMutation({
    mutationFn: (formQuestionId: number) =>
      apiClient.delete(ENDPOINTS.adminFormQuestion(formQuestionId)),
  });
}

export function useCopyFormStructure(targetVersionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sourceVersionId: number) =>
      apiClient.post(ENDPOINTS.adminCopyVersion(targetVersionId, sourceVersionId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['form-definition', targetVersionId] }),
  });
}

export function useUpdateFormSection(formSectionId: number) {
  return useMutation({
    mutationFn: (data: UpdateFormSectionRequest) =>
      apiClient.put(ENDPOINTS.adminFormSection(formSectionId), data),
  });
}

export function useRemoveFormSection() {
  return useMutation({
    mutationFn: (formSectionId: number) =>
      apiClient.delete(ENDPOINTS.adminFormSection(formSectionId)),
  });
}

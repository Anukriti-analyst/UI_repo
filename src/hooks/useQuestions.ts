import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  QuestionDto, QuestionOptionDto,
  CreateQuestionRequest, UpdateQuestionRequest,
  CreateSubQuestionRequest,
  CreateQuestionOptionRequest, UpdateQuestionOptionRequest,
} from '@/api/types/question.types';

export function useQuestions() {
  return useQuery<QuestionDto[]>({
    queryKey: ['admin', 'questions'],
    queryFn:  async () => (await apiClient.get<QuestionDto[]>(ENDPOINTS.adminQuestions)).data,
  });
}

export function useQuestion(id: number) {
  return useQuery<QuestionDto>({
    queryKey: ['admin', 'questions', id],
    queryFn:  async () => (await apiClient.get<QuestionDto>(ENDPOINTS.adminQuestion(id))).data,
    enabled:  id > 0,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionRequest) => apiClient.post<QuestionDto>(ENDPOINTS.adminQuestions, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'questions'] }),
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateQuestionRequest & { id: number }) =>
      apiClient.put<QuestionDto>(ENDPOINTS.adminQuestion(id), data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'questions'] }),
  });
}

export function useCreateSubQuestion(questionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubQuestionRequest) =>
      apiClient.post(ENDPOINTS.adminSubQuestions(questionId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
  });
}

export function useUpdateSubQuestion(questionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subId, ...data }: CreateSubQuestionRequest & { subId: number }) =>
      apiClient.put(ENDPOINTS.adminSubQuestion(questionId, subId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
  });
}

/* ── Question Options ──────────────────────────────────────────────── */

export function useQuestionOptions(questionId: number) {
  return useQuery<QuestionOptionDto[]>({
    queryKey: ['admin', 'questions', questionId, 'options'],
    queryFn:  async () => (await apiClient.get<QuestionOptionDto[]>(ENDPOINTS.adminQuestionOptions(questionId))).data,
    enabled:  questionId > 0,
  });
}

export function useCreateQuestionOption(questionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionOptionRequest) =>
      apiClient.post<QuestionOptionDto>(ENDPOINTS.adminQuestionOptions(questionId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'questions', questionId, 'options'] });
      qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
  });
}

export function useUpdateQuestionOption(questionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ optionId, ...data }: UpdateQuestionOptionRequest & { optionId: number }) =>
      apiClient.put<QuestionOptionDto>(ENDPOINTS.adminQuestionOption(questionId, optionId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'questions', questionId, 'options'] });
      qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
  });
}

export function useDeleteQuestionOption(questionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (optionId: number) =>
      apiClient.delete(ENDPOINTS.adminQuestionOption(questionId, optionId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'questions', questionId, 'options'] });
      qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
  });
}

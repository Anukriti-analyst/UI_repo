import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { SectionDto, CreateSectionRequest, UpdateSectionRequest } from '@/api/types/section.types';

export function useSections() {
  return useQuery<SectionDto[]>({
    queryKey: ['admin', 'sections'],
    queryFn:  async () => (await apiClient.get<SectionDto[]>(ENDPOINTS.adminSections)).data,
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSectionRequest) => apiClient.post<SectionDto>(ENDPOINTS.adminSections, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'sections'] }),
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateSectionRequest & { id: number }) =>
      apiClient.put<SectionDto>(ENDPOINTS.adminSection(id), data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'sections'] }),
  });
}

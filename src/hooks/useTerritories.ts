import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { TerritoryDto } from '@/api/types/territory.types';

export function useTerritories() {
  return useQuery<TerritoryDto[]>({
    queryKey: ['territories'],
    queryFn:  async () => (await apiClient.get<TerritoryDto[]>(ENDPOINTS.territories)).data,
    staleTime: 10 * 60 * 1000, // 10 min — territories rarely change
  });
}

export function useTerritory(id: number) {
  return useQuery<TerritoryDto>({
    queryKey: ['territories', id],
    queryFn:  async () => (await apiClient.get<TerritoryDto>(ENDPOINTS.territory(id))).data,
    enabled:  id > 0,
  });
}

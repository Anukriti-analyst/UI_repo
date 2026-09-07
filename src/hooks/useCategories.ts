import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  CategoryGroupDto, CategoryValueDto, CreateCategoryGroupRequest,
  CreateCategoryRequest, UpsertCategoryValueRequest,
} from '@/api/types/category.types';

/* ── Internal helper: fetch values for a list of category IDs ── */
async function fetchValuesForCategories(
  categoryIds: number[],
): Promise<Map<number, CategoryValueDto[]>> {
  if (categoryIds.length === 0) return new Map();
  const settled = await Promise.allSettled(
    categoryIds.map((id) =>
      apiClient
        .get<CategoryValueDto[]>(ENDPOINTS.adminCategoryValues(id))
        .then((r) => ({ id, values: (r.data as CategoryValueDto[]) ?? [] })),
    ),
  );
  const map = new Map<number, CategoryValueDto[]>();
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      map.set(result.value.id, result.value.values);
    }
  }
  return map;
}

/* ── Internal helper: merge values map into groups ────────────── */
function mergeValues(
  groups: CategoryGroupDto[],
  valuesMap: Map<number, CategoryValueDto[]>,
): CategoryGroupDto[] {
  return groups.map((group) => ({
    ...group,
    categories: (group.categories ?? []).map((cat) => ({
      ...cat,
      values: valuesMap.get(cat.categoryId) ?? [],
    })),
  }));
}

export function useCategoryGroups() {
  return useQuery<CategoryGroupDto[]>({
    queryKey: ['admin', 'category-groups'],
    queryFn:  async () => (await apiClient.get<CategoryGroupDto[]>(ENDPOINTS.adminCategoryGroups)).data,
  });
}

/** Fetches category groups and enriches each category with its values. */
export function useCategoryGroupsWithValues() {
  const groupsQuery = useCategoryGroups();

  const categoryIds = useMemo(
    () => (groupsQuery.data ?? []).flatMap((g) => (g.categories ?? []).map((c) => c.categoryId)),
    [groupsQuery.data],
  );

  const valuesQuery = useQuery({
    queryKey: ['admin', 'category-values-bulk', categoryIds],
    queryFn:  () => fetchValuesForCategories(categoryIds),
    enabled:  categoryIds.length > 0,
    staleTime: 0,
  });

  const enrichedGroups = useMemo(() => {
    if (!groupsQuery.data) return undefined;
    if (!valuesQuery.data)  return groupsQuery.data;
    return mergeValues(groupsQuery.data, valuesQuery.data);
  }, [groupsQuery.data, valuesQuery.data]);

  return {
    ...groupsQuery,
    data: enrichedGroups,
    isLoading: groupsQuery.isLoading || (categoryIds.length > 0 && valuesQuery.isLoading),
  };
}

export function useCategoryGroupsByVersion(formVersionId: number) {
  return useQuery<CategoryGroupDto[]>({
    queryKey: ['admin', 'category-groups', 'version', formVersionId],
    queryFn:  async () =>
      (await apiClient.get<CategoryGroupDto[]>(ENDPOINTS.adminVersionCategoryGroups(formVersionId))).data,
    enabled: formVersionId > 0,
  });
}

/** Fetches category groups by version and enriches each category with its values. */
export function useCategoryGroupsByVersionWithValues(formVersionId: number) {
  const groupsQuery = useCategoryGroupsByVersion(formVersionId);

  const categoryIds = useMemo(
    () => (groupsQuery.data ?? []).flatMap((g) => (g.categories ?? []).map((c) => c.categoryId)),
    [groupsQuery.data],
  );

  const valuesQuery = useQuery({
    queryKey: ['admin', 'category-values-bulk-version', formVersionId, categoryIds],
    queryFn:  () => fetchValuesForCategories(categoryIds),
    enabled:  formVersionId > 0 && categoryIds.length > 0,
    staleTime: 0,
  });

  const enrichedGroups = useMemo(() => {
    if (!groupsQuery.data) return undefined;
    if (!valuesQuery.data)  return groupsQuery.data;
    return mergeValues(groupsQuery.data, valuesQuery.data);
  }, [groupsQuery.data, valuesQuery.data]);

  return {
    ...groupsQuery,
    data: enrichedGroups,
    isLoading: groupsQuery.isLoading || (categoryIds.length > 0 && valuesQuery.isLoading),
  };
}

export function useCategoryGroup(id: number) {
  return useQuery<CategoryGroupDto>({
    queryKey: ['admin', 'category-groups', id],
    queryFn:  async () => (await apiClient.get<CategoryGroupDto>(ENDPOINTS.adminCategoryGroup(id))).data,
    enabled:  id > 0,
  });
}

export function useCreateCategoryGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryGroupRequest) =>
      apiClient.post<CategoryGroupDto>(ENDPOINTS.adminCategoryGroups, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'category-groups'] }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, ...data }: { groupId: number } & CreateCategoryRequest) =>
      apiClient.post(ENDPOINTS.adminCategoryGroupCategories(groupId), data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'category-groups'] }),
  });
}

export function useUpsertCategoryValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, ...data }: { categoryId: number } & UpsertCategoryValueRequest) => {
      if (!categoryId || categoryId <= 0) throw new Error('Invalid categoryId');
      return apiClient.post(ENDPOINTS.adminCategoryValues(categoryId), data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'category-groups'] });
      qc.invalidateQueries({ queryKey: ['admin', 'category-values-bulk'] });
      qc.invalidateQueries({ queryKey: ['admin', 'category-values-bulk-version'] });
    },
  });
}

export interface CategoryGroupDto {
  categoryGroupId: number;
  formVersionId: number;
  groupName: string;
  groupType: string;
  source: string;
  categories: CategoryDto[];
}

export interface CategoryDto {
  categoryId: number;
  categoryGroupId: number;
  categoryKey: string;
  displayName: string | null;
  dataType: string;
  values: CategoryValueDto[];
}

export interface CategoryValueDto {
  categoryValueId: number;
  categoryId: number;
  territoryId: number;
  numericValue: number | null;
  currency: string | null;
  unit: string | null;
  qualifier: string | null;
  textValue: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface CreateCategoryGroupRequest {
  formVersionId: number;
  groupName: string;
  groupType: string;
  source: string;
}

export interface CreateCategoryRequest {
  categoryKey: string;
  displayName?: string;
  dataType: string;
}

export interface UpsertCategoryValueRequest {
  territoryId: number;
  numericValue?: number;
  currency?: string;
  unit?: string;
  qualifier?: string;
  textValue?: string;
  effectiveFrom?: string;
}

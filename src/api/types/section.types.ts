export interface SectionDto {
  sectionId: number;
  sectionName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateSectionRequest {
  sectionName: string;
  displayOrder: number;
}

export interface UpdateSectionRequest {
  sectionName: string;
  displayOrder: number;
  isActive: boolean;
}

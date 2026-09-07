export interface FormDto {
  formId: number;
  territoryId: number;
  territoryName: string;
  territoryCode: string;
  formName: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface FormVersionDto {
  formVersionId: number;
  formId: number;
  versionNumber: number;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
}

export interface FormDefinitionDto {
  formVersionId: number;
  formId: number;
  formName: string;
  versionNumber: number;
  sections: FormDefinitionSectionDto[];
}

export interface FormDefinitionSectionDto {
  formSectionId: number;
  sectionName: string;
  displayOrder: number;
  questions: FormDefinitionQuestionDto[];
}

export type QuestionType = 'Text' | 'Number' | 'Select' | 'MultiSelect' | 'Date' | 'Boolean' | 'YesNo';
export type RenderHint = 'radio' | 'toggle' | 'checkbox' | 'dropdown' | null;

export interface FormDefinitionQuestionDto {
  formQuestionId: number;
  questionId: number;
  questionText: string;
  description: string | null;
  questionType: QuestionType;
  displayOrder: number;
  isRequired: boolean;
  renderHint: RenderHint;
  subQuestions: FormDefinitionSubQuestionDto[];
  options: { questionOptionId: number; optionText: string; optionValue: string; displayOrder: number; isActive?: boolean }[];
}

export interface FormDefinitionSubQuestionDto {
  subQuestionId: number;
  subQuestionText: string;
  description: string | null;
  questionType: QuestionType;
  triggerValue: string;
  options: { subQuestionOptionId: number; optionText: string; optionValue: string; displayOrder: number }[];
}

export interface UpdateFormSectionRequest {
  displayOrder: number;
}

/* Admin request types */
export interface CreateFormRequest {
  territoryId: number;
  formName: string;
  description?: string;
}

export interface UpdateFormRequest {
  formName: string;
  description?: string;
  isActive: boolean;
}

export interface CreateVersionRequest {
  notes?: string;
}

export interface AddSectionToVersionRequest {
  sectionId: number;
  displayOrder: number;
}

export interface AddQuestionToSectionRequest {
  questionId: number;
  displayOrder: number;
  isRequired: boolean;
  renderHint?: string;
}

export interface UpdateFormQuestionRequest {
  displayOrder: number;
  isRequired: boolean;
  renderHint?: string;
}

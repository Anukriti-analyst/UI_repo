/** Centralised API endpoint constants. Never hardcode URLs in components. */
const BASE = '/api/v1';

export const ENDPOINTS = {
  /* Territories */
  territories:              `${BASE}/territories`,
  territory:                (id: number) => `${BASE}/territories/${id}`,
  territoryByCode:          (code: string) => `${BASE}/territories/by-code/${code}`,

  /* Forms (general) */
  forms:                    `${BASE}/forms`,
  form:                     (id: number) => `${BASE}/forms/${id}`,
  formActiveVersion:        (id: number) => `${BASE}/forms/${id}/active-version`,
  formVersions:             (id: number) => `${BASE}/forms/${id}/versions`,

  /* Form definition (wizard rendering) */
  formDefinition:           (versionId: number) => `${BASE}/form-versions/${versionId}/definition`,

  /* Submissions */
  submissions:              `${BASE}/submissions`,
  submission:               (id: string) => `${BASE}/submissions/${id}`,
  submissionAnswers:        (id: string) => `${BASE}/submissions/${id}/answers`,
  submissionSubmit:         (id: string) => `${BASE}/submissions/${id}/submit`,
  submissionPdf:            (id: string) => `${BASE}/submissions/${id}/pdf`,
  submissionEmail:          (id: string) => `${BASE}/submissions/${id}/email`,

  /* Admin — Question Options */
  adminQuestionOptions:     (questionId: number) => `${BASE}/admin/questions/${questionId}/options`,
  adminQuestionOption:      (questionId: number, optionId: number) => `${BASE}/admin/questions/${questionId}/options/${optionId}`,

  /* Admin — Sub-Question Options */
  adminSubQuestionOptions:  (questionId: number, subId: number) => `${BASE}/admin/questions/${questionId}/subquestions/${subId}/options`,
  adminSubQuestionOption:   (questionId: number, subId: number, optId: number) => `${BASE}/admin/questions/${questionId}/subquestions/${subId}/options/${optId}`,

  /* Admin — Questions */
  adminQuestions:           `${BASE}/admin/questions`,
  adminQuestion:            (id: number) => `${BASE}/admin/questions/${id}`,
  adminSubQuestions:        (id: number) => `${BASE}/admin/questions/${id}/subquestions`,
  adminSubQuestion:         (questionId: number, subId: number) => `${BASE}/admin/questions/${questionId}/subquestions/${subId}`,

  /* Admin — Sections */
  adminSections:            `${BASE}/admin/sections`,
  adminSection:             (id: number) => `${BASE}/admin/sections/${id}`,

  /* Admin — Forms & Versions */
  adminForms:               `${BASE}/admin/forms`,
  adminForm:                (id: number) => `${BASE}/admin/forms/${id}`,
  adminFormVersions:        (id: number) => `${BASE}/admin/forms/${id}/versions`,
  adminActivateVersion:     (formId: number, versionId: number) => `${BASE}/admin/forms/${formId}/versions/${versionId}/activate`,

  /* Admin — Form Builder */
  adminFormVersionPreview:  (versionId: number) => `${BASE}/admin/form-versions/${versionId}/preview`,
  adminVersionSections:     (versionId: number) => `${BASE}/admin/form-versions/${versionId}/sections`,
  adminSectionQuestions:    (sectionId: number) => `${BASE}/admin/form-sections/${sectionId}/questions`,
  adminFormQuestion:        (formQuestionId: number) => `${BASE}/admin/form-questions/${formQuestionId}`,
  adminCopyVersion:         (targetVersionId: number, sourceVersionId: number) =>
    `${BASE}/admin/form-versions/${targetVersionId}/copy-from/${sourceVersionId}`,
  adminFormSection:         (formSectionId: number) => `${BASE}/admin/form-sections/${formSectionId}`,

  /* Admin — Categories */
  adminCategoryGroups:      `${BASE}/admin/category-groups`,
  adminCategoryGroup:       (id: number) => `${BASE}/admin/category-groups/${id}`,
  adminVersionCategoryGroups: (versionId: number) => `${BASE}/admin/form-versions/${versionId}/category-groups`,
  adminCategoryGroupCategories: (groupId: number) => `${BASE}/admin/category-groups/${groupId}/categories`,
  adminCategoryValues:      (categoryId: number) => `${BASE}/admin/categories/${categoryId}/values`,
} as const;

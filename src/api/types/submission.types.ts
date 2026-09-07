export type SubmissionStatus = 'Draft' | 'Submitted' | 'Cancelled';

export const SUBMISSION_STATUS = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  Cancelled: 'Cancelled',
} as const;

export interface SubmissionSummaryDto {
  submissionId: string;
  submissionName: string | null;
  formName: string;
  territoryName: string;
  versionNumber: number;
  status: SubmissionStatus;
  referenceNumber: string | null;
  submittedAt: string | null;
  createdAt: string;
}

export interface SubmissionDetailDto {
  submissionId: string;
  submissionName: string | null;
  formVersionId: number;
  formName: string;
  territoryName: string;
  versionNumber: number;
  status: SubmissionStatus;
  referenceNumber: string | null;
  submittedAt: string | null;
  sections: SubmissionSectionDto[];
}

export interface SubmissionSectionDto {
  submissionSectionId: string;
  sectionName: string;
  displayOrder: number;
  answers: SubmissionAnswerDto[];
}

export interface SubmissionAnswerDto {
  submissionAnswerId: string;
  questionText: string;
  answerValue: string | null;
}

/* Request types */
export interface CreateSubmissionRequest {
  formVersionId: number;
  submissionName: string;
}

export interface SaveAnswersRequest {
  sections: SaveAnswersSectionDto[];
}

export interface SaveAnswersSectionDto {
  sectionName: string;
  displayOrder: number;
  answers: SaveAnswersAnswerDto[];
}

export interface SaveAnswersAnswerDto {
  questionText: string;
  answerValue: string | null;
}

export interface EmailSubmissionRequest {
  toEmail?: string;
}

import type { QuestionType } from './form.types';

export interface QuestionOptionDto {
  questionOptionId: number;
  optionText: string;
  optionValue: string;
  displayOrder: number;
  isActive: boolean;
}

export interface SubQuestionOptionDto {
  subQuestionOptionId: number;
  optionText: string;
  optionValue: string;
  displayOrder: number;
  isActive: boolean;
}

export interface QuestionDto {
  questionId: number;
  questionText: string;
  description: string | null;
  questionType: QuestionType;
  isActive: boolean;
  subQuestions: SubQuestionDto[];
  options: QuestionOptionDto[];
}

export interface SubQuestionDto {
  subQuestionId: number;
  subQuestionText: string;
  description: string | null;
  questionType: QuestionType;
  triggerValue: string;
  options: SubQuestionOptionDto[];
}

export interface CreateQuestionRequest {
  questionText: string;
  description?: string;
  questionType: string;
}

export interface UpdateQuestionRequest {
  questionText: string;
  description?: string;
  questionType: string;
  isActive: boolean;
}

export interface CreateSubQuestionRequest {
  subQuestionText: string;
  triggerValue: string;
  questionType: string;
  description?: string;
}

export interface CreateQuestionOptionRequest {
  optionText: string;
  optionValue: string;
  displayOrder?: number;
}

export interface UpdateQuestionOptionRequest {
  optionText: string;
  optionValue: string;
  displayOrder?: number;
  isActive: boolean;
}

export interface CreateSubQuestionOptionRequest {
  optionText: string;
  optionValue: string;
  displayOrder?: number;
}

export interface UpdateSubQuestionOptionRequest {
  optionText: string;
  optionValue: string;
  displayOrder?: number;
  isActive: boolean;
}

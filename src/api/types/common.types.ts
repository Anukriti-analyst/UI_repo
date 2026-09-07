/** Standard API envelope returned by every endpoint */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  traceId: string | null;
  errorCode: string | null;
  message: string | null;
  details: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type ApiErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'EMAIL_SEND_FAILED';

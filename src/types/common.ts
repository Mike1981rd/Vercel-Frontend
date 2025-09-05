/**
 * Common types used across the application
 */

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
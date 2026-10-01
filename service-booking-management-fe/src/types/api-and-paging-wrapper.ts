// Generic API Wrapper matching backend ApiResponseWrapper<T>
export interface ApiResponseWrapper<T> {
  statusCode: number;
  message: string;
  data?: T | null;
  error?: T | null; // Generic error payload (strings, field validation maps, etc.)
  timestamp: string; // ISO String from backend DateTime
}

// Generic Pagination Model matching backend PagingModel<T>
export interface PagingModel<T> {
  pageIndex: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  data?: T[] | null;
}

// Query parameters matching backend PagingQuery
export interface PagingQuery {
  pageIndex?: number;
  pageSize?: number;
}
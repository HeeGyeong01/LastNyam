// 공통 타입
export interface Location {
  lat: number;
  lng: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API 공통 응답 구조
export interface ApiResponseWrapper<T> {
  data: T;
  status: string;
  code: number;
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

// 커서 기반 페이지네이션
export interface CursorPaginationData<T> {
  content: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}


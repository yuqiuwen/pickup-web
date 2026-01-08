export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  errmsg: string | null;
  data?: T;
}

export enum ErrorCode {
  SUCCESS = 0,
  UNAUTHORIZED = 40001,
  FORBIDDEN = 40003,
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}


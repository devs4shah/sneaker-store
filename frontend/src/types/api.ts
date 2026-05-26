export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  timestamp: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  data?: Record<string, string>;
}

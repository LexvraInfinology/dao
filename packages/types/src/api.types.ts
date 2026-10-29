export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SiweNonceResponse {
  nonce: string;
  expiresAt: string;
}

export interface SiweVerifyResponse {
  token: string;
  address: string;
  user: {
    id: string;
    userId: number;
    address: string;
    isQualified: boolean;
  };
}

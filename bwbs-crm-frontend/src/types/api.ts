// ============================================================================
// GENERIC API TYPES - Pagination, errors, responses
// ============================================================================

/** Standard DRF paginated response */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Standard API error shape */
export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  non_field_errors?: string[];
}

/** Login response — access token only (refresh is in httpOnly cookie) */
export interface LoginResponse {
  access: string;
}

/** Token refresh response */
export interface TokenRefreshResponse {
  access: string;
}

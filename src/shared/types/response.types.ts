// src/common/response.types.ts
import { t } from "elysia";

export interface ApiResponse<T = unknown> {
  data: T;
  metadata?: Record<string, unknown>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const paginationSchema = t.Optional(
  t.Object({
    page: t.Number(),
    offset: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  }),
);

// Helper for controllers to return structured responses
export const paginated = <T>(
  data: T,
  pagination: ApiResponse["pagination"],
  metadata?: ApiResponse["metadata"],
): ApiResponse<T> => ({ data, pagination, metadata });

export const respond = <T>(data: T, metadata?: ApiResponse["metadata"]): ApiResponse<T> => ({
  data,
  metadata,
});

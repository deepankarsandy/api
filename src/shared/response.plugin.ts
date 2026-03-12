import { Elysia } from "elysia";

export const responseWrapper = new Elysia({ name: "response-wrapper" }).onAfterHandle(
  { as: "global" },
  ({ response, set }) => {
    // Skip if already wrapped (e.g. from paginated() helper)
    if (response !== null && typeof response === "object" && "data" in response) {
      return response;
    }

    // Skip native Response passthrough (e.g. better-auth mounted handler)
    if (response instanceof Response) {
      return response;
    }

    // Skip non-JSON responses
    if (
      response instanceof Blob ||
      response instanceof ArrayBuffer ||
      typeof response === "string" // raw string passthrough e.g. health HTML
    ) {
      return response;
    }

    // Skip error responses (onError handles those separately)
    if (set.status && Number(set.status) >= 400) {
      return response;
    }

    return {
      data: response ?? null,
    };
  },
);

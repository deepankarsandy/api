import { auth } from "@infrastructure/auth/better-auth";
import { ERROR_CODES } from "@shared/errors/error-codes.constant";
import { ERROR_MESSAGES } from "@shared/errors/error-messages.constant";
import { AppError } from "@shared/types/error.types";
import { Elysia } from "elysia";

const unauthorizedError = () =>
  new AppError("Unauthorized", {
    message: ERROR_MESSAGES.AUTH_UNAUTHORIZED,
    code: ERROR_CODES.AUTH_UNAUTHORIZED,
    status: 401,
  });

const authGuardSkipPathPatterns: RegExp[] = [
  /^\/api\/v1\/auth(?:\/|$)/,
  /^\/api\/v1\/health/,
  /^\/api\/v1\/youtube\/.*/,
];

export const jwtAuthGuard = new Elysia({ name: "jwt-auth-guard" }).onRequest(
  async ({ request }) => {
    const requestPath = new URL(request.url).pathname;
    const shouldSkipAuthGuard = authGuardSkipPathPatterns.some((pattern) =>
      pattern.test(requestPath),
    );

    if (shouldSkipAuthGuard) {
      return;
    }

    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.session || !session.user) {
        throw unauthorizedError();
      }
    } catch {
      throw unauthorizedError();
    }
  },
);

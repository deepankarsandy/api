import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import "reflect-metadata";
import "@shared/container";
import { userRoutes } from "@routes/user.routes";
import {
  buildApiErrorResponse,
  resolveErrorCode,
  resolveErrorStatus,
} from "@shared/types/error.types";
import { responseWrapper } from "./shared/response.plugin";

export const buildApp = () =>
  new Elysia()
    .use(cors())
    .use(swagger())
    .use(responseWrapper)
    .onError(({ error, code, set }) => {
      const resolvedCode = resolveErrorCode(code, error);
      const status = resolveErrorStatus(resolvedCode, error, set.status);
      set.status = status;

      return buildApiErrorResponse({
        error,
        code: resolvedCode,
        status,
        includeStack: process.env.NODE_ENV !== "production",
      });
    })
    .group("/api/v1", (app) =>
      app
        .get("/health", () => ({
          status: "ok",
        }))
        .use(userRoutes),
    );

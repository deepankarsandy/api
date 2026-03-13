import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import "reflect-metadata";
import "@shared/container";
import { auth } from "@infrastructure/auth/better-auth";
import { userRoutes } from "@routes/user.routes";
import { youtubeRoutes } from "@routes/youtube.routes";
import { jwtAuthGuard } from "@shared/auth.guard";
import {
  buildApiErrorResponse,
  resolveErrorCode,
  resolveErrorStatus,
} from "@shared/types/error.types";
import { responseWrapper } from "./shared/response.plugin";

const isProduction = Bun.env.NODE_ENV === "production";
const allowedOrigins = [
  "http://localhost:8080",
  "http://sandyhome.local",
  "https://deepankar.ddns.net",
] as const;

export const buildApp = () =>
  new Elysia()
    .use(
      cors({
        origin: [...allowedOrigins],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposeHeaders: ["set-auth-token"],
      }),
    )
    .use(
      swagger(
        // uncomment for classic view
        /**
          {
            provider: "swagger-ui", // This forces the classic UI
            // path: "/v1/docs", // Following your API versioning requirement
            documentation: {
              info: {
                title: "Bun/Elysia Hexagonal API",
                version: "1.0.50",
              },
            },
          }
        */
        {
          provider: "scalar",
          path: "/swagger",
          specPath: "/swagger/json",
          documentation: {
            info: {
              title: "Bun + Elysia Hexagonal API",
              version: "1.0.50",
              description: "Versioned API documentation",
            },
            components: {
              securitySchemes: {
                bearerAuth: {
                  type: "http",
                  scheme: "bearer",
                  bearerFormat: "JWT",
                },
              },
            },
            servers: [
              {
                url: "http://localhost:3000/",
                description: "Localhost (default)",
              },
            ],
          },
          scalarConfig: {
            defaultHttpClient: {
              clientKey: "fetch",
              targetKey: "javascript",
            },
            layout: "classic",
            showSidebar: true,
            theme: "default",
            isEditable: false,
            hideModels: false,
            hideTestRequestButton: false,
            hideSearch: false,
            hideDarkModeToggle: false,
            withDefaultFonts: true,
            defaultOpenAllTags: false,
            darkMode: true,
            persistAuth: !isProduction,
            showDeveloperTools: "never",
            hiddenClients: {
              c: true,
              ruby: true,
              php: true,
              python: true,
              csharp: true,
              clojure: true,
              go: true,
              http: true,
              java: true,
              kotlin: true,
              node: true,
              objc: true,
              ocaml: true,
              r: true,
              swift: true,
              // @ts-expect-error
              dart: true,
              fsharp: true,
              scala: true,
              rust: true,
              js: ["axios", "jquery", "ofetch", "xhr"],
              shell: ["httpie"],
            },
            // Scalar shows this as the server selector, and includes API versioned bases.
            servers: [
              {
                url: "http://localhost:3000",
                description: "Localhost v1 (default)",
              },
            ],
          },
        },
      ),
    )
    .use(responseWrapper)
    .onError(({ error, code, set }) => {
      const resolvedCode = resolveErrorCode(code, error);
      const status = resolveErrorStatus(resolvedCode, error, set.status);
      set.status = status;

      return buildApiErrorResponse({
        error,
        code: resolvedCode,
        status,
        includeStack: !isProduction,
      });
    })
    .group("/api/v1", (app) =>
      app
        .get("/health", () => ({
          status: "ok",
        }))
        // Better Auth public endpoints (sign-up, sign-in, sign-out, session, etc.)
        .all("/auth", ({ request }) => auth.handler(request))
        .all("/auth/*", ({ request }) => auth.handler(request))
        .group("", (protectedApp) =>
          protectedApp.use(jwtAuthGuard).use(userRoutes).use(youtubeRoutes),
        ),
    );

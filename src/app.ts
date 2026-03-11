import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import "reflect-metadata";
import "@shared/container";
import { authRoutes } from "@routes/auth.routes";
import { userRoutes } from "@routes/user.routes";
import {
  buildApiErrorResponse,
  resolveErrorCode,
  resolveErrorStatus,
} from "@shared/types/error.types";
import { responseWrapper } from "./shared/response.plugin";

const isProduction = Bun.env.NODE_ENV === "production";

export const buildApp = () =>
  new Elysia()
    .use(cors())
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
        .use(authRoutes)
        .use(userRoutes),
    );

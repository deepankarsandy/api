import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import "reflect-metadata";
import "@shared/container";
import { userRoutes } from "@routes/user.routes";

export const buildApp = () =>
  new Elysia()
    .use(cors())
    .use(swagger())
    .group("/api/v1", (app) =>
      app
        .get("/health", () => ({
          status: "ok",
        }))
        .use(userRoutes),
    )
    .onError(({ error, code }) => {
      if (code === "VALIDATION") {
        console.error(`Error: ${error.message}`);
        return error.message;
      }
    });

import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from '@elysiajs/cors';

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .group("/api/v1", (app) =>
    app.get("/health", () => ({
      status: "ok",
    })),
  )
  .onError(({ error, code }) => {
    if (code === "VALIDATION") {
      console.error(`Error: ${error.message}`);

      return error.message;
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

import { buildApp } from "@/app";

const app = buildApp();

if (import.meta.main) {
  app.listen(3000);
  console.log(
    `Elysia is running at ${app.server?.hostname ?? "localhost"}:${app.server?.port ?? 3000}`,
  );
}

export { app };

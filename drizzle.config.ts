import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/infrastructure/database/schema/*.ts",
  out: "./src/infrastructure/database/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "./data/app.db",
  },
  verbose: true,
  strict: true,
});

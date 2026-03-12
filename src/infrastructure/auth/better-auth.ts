import { db } from "@db/client";
import * as schema from "@db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, jwt } from "better-auth/plugins";

const allowedOrigins = ["http://localhost:8080", "http://localhost:5173"] as const;

export const auth = betterAuth({
  baseURL: Bun.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  basePath: "/api/v1/auth",
  trustedOrigins: [...allowedOrigins],
  plugins: [bearer(), jwt()],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    modelName: "users",
  },
  account: {
    modelName: "accounts",
  },
  session: {
    modelName: "sessions",
  },
  verification: {
    modelName: "verifications",
  },
});

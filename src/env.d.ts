export {};

type AppNodeEnv = "development" | "test" | "production";

declare module "bun" {
  interface Env {
    NODE_ENV?: AppNodeEnv;
    DATABASE_URL?: string;
    BETTER_AUTH_URL?: string;
    BETTER_AUTH_SECRET?: string;
    YOUTUBE_DATA_API_V3?: string;
    APP_URL?: string;
  }
}

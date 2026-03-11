import { createDevelopmentDatabase } from "./development";
import { createProductionDatabase } from "./production";
import { createTestDatabase } from "./test";

const env = Bun.env.NODE_ENV ?? "development";

const setupDatabase = () => {
  if (env === "production") {
    return createProductionDatabase();
  }

  if (env === "test") {
    return createTestDatabase();
  }

  return createDevelopmentDatabase();
};

const { db, client } = setupDatabase();
export { db, client };

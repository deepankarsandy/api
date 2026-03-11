import { Database } from "bun:sqlite";
import { drizzle as drizzleBun } from "drizzle-orm/bun-sqlite";
import { type DatabaseSetup, runPragmas, runSchemaCreation, schema } from "./common";

export const createTestDatabase = (): DatabaseSetup => {
  const client = new Database(":memory:");

  runPragmas(client);
  runSchemaCreation(client);

  return {
    client,
    db: drizzleBun(client, { schema }),
  };
};

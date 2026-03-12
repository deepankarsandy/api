import Database from "bun:sqlite";
import { drizzle as drizzleBun } from "drizzle-orm/bun-sqlite";
import {
  type DatabaseSetup,
  ensureDatabaseDirectory,
  requireDatabaseUrl,
  runPragmas,
  runSchemaCreation,
  schema,
} from "./common";

export const createProductionDatabase = (): DatabaseSetup => {
  const databaseUrl = requireDatabaseUrl("production");

  ensureDatabaseDirectory(databaseUrl);

  const client = new Database(databaseUrl);

  runPragmas(client);
  runSchemaCreation(client);

  return {
    client,
    db: drizzleBun(client, { schema }),
  };
};

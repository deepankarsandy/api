import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import { drizzle as drizzleBun } from "drizzle-orm/bun-sqlite";
import {
  type DatabaseSetup,
  ensureDatabaseDirectory,
  requireDatabaseUrl,
  runPragmas,
  runSchemaCreation,
  schema,
} from "./common";

export const createDevelopmentDatabase = (): DatabaseSetup => {
  const databaseUrl = requireDatabaseUrl("development");
  ensureDatabaseDirectory(databaseUrl);

  const client = new Database(":memory:");

  if (existsSync(databaseUrl)) {
    const fileDatabase = new Database(databaseUrl);

    try {
      console.log("Restoring database from", databaseUrl);
      (fileDatabase as Database & { backup(target: Database): void }).backup(client);
    } finally {
      fileDatabase.close();
    }
  }

  runPragmas(client);
  runSchemaCreation(client);

  let isClosed = false;

  const backupToDisk = () => {
    if (isClosed) {
      return;
    }

    const fileDatabase = new Database(databaseUrl);

    try {
      console.log("Backing up database to", databaseUrl);
      (client as Database & { backup(target: Database): void }).backup(fileDatabase);
    } finally {
      fileDatabase.close();
      client.close();
      isClosed = true;
    }
  };

  const handleSignal = () => {
    backupToDisk();
    process.exit(0);
  };

  process.once("exit", backupToDisk);
  process.once("SIGINT", handleSignal);
  process.once("SIGTERM", handleSignal);

  return {
    client,
    db: drizzleBun(client, { schema }),
  };
};

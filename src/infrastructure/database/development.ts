import { Database } from "bun:sqlite";
import { existsSync, writeFileSync } from "node:fs";
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

  let client = new Database(":memory:");

  if (existsSync(databaseUrl)) {
    const fileDatabase = new Database(databaseUrl);

    try {
      console.log("Restoring database into memory from ", databaseUrl);
      client = Database.deserialize(fileDatabase.serialize());
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

    try {
      console.log("Backing up database from memory into ", databaseUrl);
      // Serialize the database to a Uint8Array
      const contents = client.serialize();

      // Write the contents to a backup file
      writeFileSync(databaseUrl, contents);
    } finally {
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

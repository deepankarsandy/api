import { createClient as createLibsqlClient } from "@libsql/client";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
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

  const client = createLibsqlClient({ url: databaseUrl });
  runPragmas(client);
  runSchemaCreation(client);

  return {
    client,
    db: drizzleLibsql(client, { schema }),
  };
};

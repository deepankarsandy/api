import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "./data/app.db";

if (databaseUrl !== ":memory:") {
  mkdirSync(dirname(databaseUrl), { recursive: true });
}

const sqlite = new Database(databaseUrl, { create: true });

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  );
`);

export const db = drizzle(sqlite, { schema });

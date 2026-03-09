import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const inMemoryDb = (process.env.IN_MEMORY_DB ?? "false").toLowerCase() === "true";
const databaseUrl = inMemoryDb ? ":memory:" : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required when IN_MEMORY_DB is not set to true.");
}

if (databaseUrl !== ":memory:") {
  mkdirSync(dirname(databaseUrl), { recursive: true });
}

const sqlite = new Database(databaseUrl, { create: true });
sqlite.run("PRAGMA foreign_keys = ON;");

const expectedUserColumns = [
  "id",
  "email",
  "emailVerified",
  "role",
  "password",
  "createdAt",
  "lastLoginAt",
  "banned",
];

const expectedUserProfileColumns = [
  "id",
  "userId",
  "isDefault",
  "firstName",
  "middleName",
  "lastName",
  "bio",
  "avatarUrl",
  "slug",
  "themePreference",
  "timezone",
  "language",
];

const existingUserColumns = sqlite.query("PRAGMA table_info(users)").all() as Array<{
  name: string;
}>;

const existingUserProfileColumns = sqlite.query("PRAGMA table_info(user_profiles)").all() as Array<{
  name: string;
}>;

const shouldRecreateUsersTable =
  existingUserColumns.length > 0 &&
  !expectedUserColumns.every((column) =>
    existingUserColumns.some((existingColumn) => existingColumn.name === column),
  );

const shouldRecreateProfilesTable =
  existingUserProfileColumns.length > 0 &&
  !expectedUserProfileColumns.every((column) =>
    existingUserProfileColumns.some((existingColumn) => existingColumn.name === column),
  );

if (shouldRecreateUsersTable) {
  sqlite.run(`
    DROP TABLE IF EXISTS user_profiles;
    DROP TABLE IF EXISTS users;
  `);
} else if (shouldRecreateProfilesTable) {
  sqlite.run("DROP TABLE IF EXISTS user_profiles;");
}

sqlite.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    role TEXT NOT NULL,
    password TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    lastLoginAt INTEGER,
    banned INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    isDefault INTEGER NOT NULL DEFAULT 0,
    firstName TEXT NOT NULL,
    middleName TEXT,
    lastName TEXT,
    bio TEXT,
    avatarUrl TEXT,
    slug TEXT,
    themePreference TEXT,
    timezone TEXT,
    language TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export const db = drizzle(sqlite, { schema });

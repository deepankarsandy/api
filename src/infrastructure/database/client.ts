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

/**
 * Optimized for memory-heavy, low-latency usage.
 * These settings are for reducing disk writes and use memory first pattern.
 * Update these for actual deployment.
 *  */
sqlite.run("PRAGMA journal_mode = WAL;");
sqlite.run("PRAGMA synchronous = NORMAL;");
sqlite.run("PRAGMA cache_size = -64000;");
sqlite.run("PRAGMA temp_store = MEMORY;");
sqlite.run("PRAGMA synchronous = NORMAL;"); // remove this for actual production

const expectedUserColumns = [
  "id",
  "name",
  "email",
  "image",
  "emailVerified",
  "role",
  "password",
  "createdAt",
  "updatedAt",
  "lastLoginAt",
  "lastPasswordChangedAt",
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
  "createdAt",
  "updatedAt",
];

const expectedAccountColumns = [
  "id",
  "userId",
  "accountId",
  "providerId",
  "accessToken",
  "refreshToken",
  "idToken",
  "accessTokenExpiresAt",
  "refreshTokenExpiresAt",
  "scope",
  "password",
  "createdAt",
  "updatedAt",
];

const expectedSessionColumns = [
  "id",
  "userId",
  "token",
  "expiresAt",
  "ipAddress",
  "userAgent",
  "createdAt",
  "updatedAt",
];

const expectedVerificationColumns = [
  "id",
  "identifier",
  "value",
  "expiresAt",
  "createdAt",
  "updatedAt",
];

const existingUserColumns = sqlite.query("PRAGMA table_info(users)").all() as Array<{
  name: string;
}>;

const existingUserProfileColumns = sqlite.query("PRAGMA table_info(user_profiles)").all() as Array<{
  name: string;
}>;

const existingAccountColumns = sqlite.query("PRAGMA table_info(accounts)").all() as Array<{
  name: string;
}>;

const existingSessionColumns = sqlite.query("PRAGMA table_info(sessions)").all() as Array<{
  name: string;
}>;

const existingVerificationColumns = sqlite
  .query("PRAGMA table_info(verifications)")
  .all() as Array<{
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

const shouldRecreateAccountsTable =
  existingAccountColumns.length > 0 &&
  !expectedAccountColumns.every((column) =>
    existingAccountColumns.some((existingColumn) => existingColumn.name === column),
  );

const shouldRecreateSessionsTable =
  existingSessionColumns.length > 0 &&
  !expectedSessionColumns.every((column) =>
    existingSessionColumns.some((existingColumn) => existingColumn.name === column),
  );

const shouldRecreateVerificationsTable =
  existingVerificationColumns.length > 0 &&
  !expectedVerificationColumns.every((column) =>
    existingVerificationColumns.some((existingColumn) => existingColumn.name === column),
  );

if (shouldRecreateUsersTable) {
  sqlite.run(`
    DROP TABLE IF EXISTS sessions;
    DROP TABLE IF EXISTS accounts;
    DROP TABLE IF EXISTS verifications;
    DROP TABLE IF EXISTS user_profiles;
    DROP TABLE IF EXISTS users;
  `);
} else if (shouldRecreateProfilesTable) {
  sqlite.run("DROP TABLE IF EXISTS user_profiles;");
}

if (shouldRecreateAccountsTable) {
  sqlite.run("DROP TABLE IF EXISTS accounts;");
}

if (shouldRecreateSessionsTable) {
  sqlite.run("DROP TABLE IF EXISTS sessions;");
}

if (shouldRecreateVerificationsTable) {
  sqlite.run("DROP TABLE IF EXISTS verifications;");
}

sqlite.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    image TEXT,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    role TEXT NOT NULL DEFAULT 'user',
    password TEXT NOT NULL DEFAULT '',
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    lastLoginAt INTEGER,
    lastPasswordChangedAt INTEGER,
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
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt INTEGER NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite, { schema });

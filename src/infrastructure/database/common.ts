import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Client as LibsqlClient } from "@libsql/client";
import * as schema from "./schema";

export type DatabaseClient = Database | LibsqlClient;

export type DatabaseSetup = {
  db: any;
  client: DatabaseClient;
};

const executeStatement = (dbInstance: DatabaseClient, sql: string) => {
  if (dbInstance instanceof Database) {
    dbInstance.run(sql);
    return;
  }

  dbInstance.execute(sql);
};

export const ensureDatabaseDirectory = (databaseUrl: string) => {
  mkdirSync(dirname(databaseUrl), { recursive: true });
};

export const requireDatabaseUrl = (environment: string) => {
  const databaseUrl = Bun.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(`DATABASE_URL is required for ${environment}.`);
  }

  return databaseUrl;
};

export const runPragmas = (dbInstance: DatabaseClient) => {
  const pragmas = [
    "PRAGMA foreign_keys = ON;",
    "PRAGMA journal_mode = WAL;",
    "PRAGMA synchronous = NORMAL;",
    "PRAGMA cache_size = -64000;",
    "PRAGMA temp_store = MEMORY;",
  ];

  for (const pragma of pragmas) {
    executeStatement(dbInstance, pragma);
  }
};

export const runSchemaCreation = (dbInstance: DatabaseClient) => {
  executeStatement(
    dbInstance,
    `
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
    `,
  );

  executeStatement(
    dbInstance,
    `
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
    `,
  );

  executeStatement(
    dbInstance,
    `
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
    `,
  );

  executeStatement(
    dbInstance,
    `
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
    `,
  );

  executeStatement(
    dbInstance,
    `
      CREATE TABLE IF NOT EXISTS verifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          identifier TEXT NOT NULL,
          value TEXT NOT NULL,
          expiresAt INTEGER NOT NULL,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
      );
    `,
  );

  executeStatement(
    dbInstance,
    `
      CREATE TABLE IF NOT EXISTS jwks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          publicKey TEXT NOT NULL,
          privateKey TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          expiresAt INTEGER
      );
    `,
  );
};

export { schema };

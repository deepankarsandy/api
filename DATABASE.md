# Database Configuration Guide

This project uses SQLite with Drizzle ORM. Database initialization is selected by `NODE_ENV` in [`src/infrastructure/database/client.ts`](/Users/deepankar/projects/api/src/infrastructure/database/client.ts), which delegates to environment-specific setup files under `src/infrastructure/database`.

## Runtime Modes

### Development

- Env file: `.env.development`
- Required values:
  - `NODE_ENV=development`
  - `DATABASE_URL=./data/dev.db`
- Setup file: [`src/infrastructure/database/development.ts`](/Users/deepankar/projects/api/src/infrastructure/database/development.ts)
- Behavior:
  - Creates an in-memory SQLite database with `:memory:`
  - If the file at `DATABASE_URL` already exists, restores that file into memory on startup
  - Applies SQLite pragmas and schema creation against the in-memory database
  - Runs the application entirely against the in-memory database
  - On shutdown (`exit`, `SIGINT`, `SIGTERM`), backs up the in-memory database back to the file at `DATABASE_URL`

Development is optimized for fast local iteration while still persisting state between restarts through the backup file.

### Test

- Env file: `.env.test`
- Required values:
  - `NODE_ENV=test`
  - `DATABASE_URL=:memory:`
- Setup file: [`src/infrastructure/database/test.ts`](/Users/deepankar/projects/api/src/infrastructure/database/test.ts)
- Behavior:
  - Uses an in-memory SQLite database only
  - Does not restore from disk
  - Does not back up to disk on shutdown
  - Applies SQLite pragmas and schema creation on startup

This keeps tests isolated, fast, and disposable.

### Production

- Env file: `.env.production`
- Required values:
  - `NODE_ENV=production`
  - `DATABASE_URL=./data/prod.db`
- Setup file: [`src/infrastructure/database/production.ts`](/Users/deepankar/projects/api/src/infrastructure/database/production.ts)
- Behavior:
  - Uses the current libSQL client setup already used by the app
  - Ensures the database directory exists before connecting
  - Applies pragmas and schema creation during startup
  - Does not use the development restore-to-memory workflow

Production keeps the existing persistent configuration path and does not switch execution to an in-memory database.

## Shared Setup

Shared database setup lives in [`src/infrastructure/database/common.ts`](/Users/deepankar/projects/api/src/infrastructure/database/common.ts).

It contains:

- `requireDatabaseUrl(environment)` to enforce `DATABASE_URL`
- `ensureDatabaseDirectory(databaseUrl)` to create the parent directory when needed
- `runPragmas(client)` to apply SQLite performance and integrity pragmas
- `runSchemaCreation(client)` to create the base tables if they do not exist

The current pragmas are:

- `PRAGMA foreign_keys = ON;`
- `PRAGMA journal_mode = WAL;`
- `PRAGMA synchronous = NORMAL;`
- `PRAGMA cache_size = -64000;`
- `PRAGMA temp_store = MEMORY;`

## Environment Files

### `.env`

Base local defaults. This file currently contains shared local values such as `DATABASE_URL`, auth URL, and auth secret.

### `.env.development`

Used for local development. It should point to the file that acts as the persistence target for the development in-memory database.

### `.env.test`

Used for tests. It should always keep the database in memory:

```env
NODE_ENV=test
DATABASE_URL=:memory:
```

### `.env.production`

Used for production configuration. It should point to a persistent on-disk database path or the production database URL expected by the deployed runtime.

## File Layout

```text
src/infrastructure/database
├ client.ts
├ common.ts
├ development.ts
├ production.ts
├ test.ts
└ schema
  ├ index.ts
  └ user.schema.ts
```

## Startup Flow

1. The app imports `db` from [`src/infrastructure/database/client.ts`](/Users/deepankar/projects/api/src/infrastructure/database/client.ts).
2. `client.ts` reads `NODE_ENV`.
3. The matching environment setup file creates the database client and Drizzle instance.
4. Shared pragmas and table creation run during initialization.
5. Repositories consume the exported `db` instance.

## Operational Notes

- Development persistence depends on clean shutdown hooks. If the process is force-killed, the latest in-memory state may not be written back to disk.
- Tests should not rely on disk state because test setup is intentionally ephemeral.
- Schema creation currently runs at startup in addition to any migration workflow.
- Migration commands remain available:
  - `bun run db:generate`
  - `bun run db:migrate`
  - `bun run db:studio`

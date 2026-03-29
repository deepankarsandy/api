# Repository Guidelines

## Project Structure & Module Organization

`src/` follows a layered, clean-architecture layout. Keep domain types in `src/domain`, use cases in `src/application`, adapters in `src/infrastructure`, HTTP-facing code in `src/presentation`, and shared wiring/helpers in `src/shared`. Runtime entry points are `src/index.ts` and `src/app.ts`. Repository-wide references live in `ARCHITECTURE.md`, `DATABASE.md`, `TEST.md`, and `CONVENTIONS.md`.

Use entity subdirectories for `commands/`, `queries/`, and `handlers/` (for example `src/application/handlers/user/create-user.handler.ts`). Repositories and interfaces stay flat by entity, such as `src/infrastructure/repositories/user.repository.ts`.

## Build, Test, and Development Commands

Use Bun for local work:

- `bun run dev`: start the API with file watching.
- `bun run dev:debug`: start with the Bun inspector enabled.
- `bun start`: run the production entry path.
- `bun run typecheck`: run TypeScript without emitting files.
- `bun run lint` / `bun run lint:fix`: run Biome checks and fixes.
- `bun run format`: apply Prettier formatting.
- `bun run test`, `test:unit`, `test:integration`, `test:e2e`, `test:coverage`: run the full or scoped test suites.
- `bun run db:generate`, `db:migrate`, `db:studio`: manage Drizzle migrations and inspect the SQLite database.

## Coding Style & Naming Conventions

Write TypeScript with 2-space indentation, semicolons, double quotes, trailing commas, and a 100-character line width. Prettier enforces formatting; Biome handles linting and import organization.

Use kebab-case filenames with a type suffix: `user.controller.ts`, `create-user.command.ts`, `user-repository.interface.ts`. Prefer the configured path aliases over deep relative imports, such as `@domain/*`, `@application/*`, `@repositories/*`, and `@shared/*`.

## Testing Guidelines

This repo uses Bun’s test runner through `scripts/run-tests.ts`. Place tests only inside `__tests__/` folders, either colocated with code or under `src/__tests__/`. Do not use generic folders like `src/tests`.

Name tests with exactly one layer suffix: `*.test.unit.ts`, `*.test.integration.ts`, or `*.test.e2e.ts`. Keep tests deterministic, independent, and explicit about status codes and response payloads.

## Commit & Pull Request Guidelines

Recent history uses short, imperative, mostly lowercase subjects such as `cors fix` and `open music route for public use`. Keep commits focused and describe the behavior change plainly.

Before opening a PR, run `bun run lint`, `bun run typecheck`, and the relevant test command. PRs should summarize the change, note any env or database impact, and call out new migrations or contract changes with example requests/responses when useful.

## Security & Configuration Tips

Environment files are split by mode: `.env.development`, `.env.test`, and `.env.production`. Development uses `data/dev.db`; tests run against `:memory:`. Do not commit secrets or unintended local database artifacts. Lefthook formats and lint-fixes staged files before commit.

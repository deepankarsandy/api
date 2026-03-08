# Testing Guide

## Scope

This project uses Bun's test runner. Tests must follow the required structure and naming so scripts can target each test layer reliably.

## Test Location Rules

- All tests must be inside a `__tests__` directory.
- `__tests__` can be colocated with feature code or under `src/__tests__`.
- Do not place tests in generic folders like `src/tests`.

Examples:

- `src/__tests__/user-flow.test.e2e.ts`
- `src/application/handlers/__tests__/create-user-handler.test.unit.ts`
- `src/infrastructure/repositories/__tests__/user-repository.test.integration.ts`

## File Naming Rules

Use exactly one of these suffixes:

- `*.test.unit.ts`
- `*.test.integration.ts`
- `*.test.e2e.ts`

Recommended pattern:

- `<feature-or-file>.test.<type>.ts`

Examples:

- `create-user-handler.test.unit.ts`
- `user-repository.test.integration.ts`
- `user-flow.test.e2e.ts`

## Test Types

- `unit`: tests a single unit with mocked/fake dependencies.
- `integration`: tests multiple internal components together (for example handler + repository adapter).
- `e2e`: tests full request/response behavior through HTTP endpoints.

## Run Commands

- `bun run test`: run all tests.
- `bun run test:watch`: run all tests in watch mode.
- `bun run test:unit`: run only unit tests.
- `bun run test:integration`: run only integration tests.
- `bun run test:e2e`: run only e2e tests.
- `bun run test:coverage`: run all tests with coverage output.

## Writing Tests

- Keep Arrange/Act/Assert sections clear.
- Use deterministic input data; avoid randomness unless required.
- For e2e tests, boot the app once in `beforeAll` and stop it in `afterAll`.
- Prefer explicit assertions on status code, payload shape, and key fields.
- Keep each test independent from execution order.

## Recommended Layout by Layer

- `src/application/**/__tests__`: unit tests for commands/queries/handlers/services.
- `src/infrastructure/**/__tests__`: integration tests for adapters.
- `src/presentation/**/__tests__`: endpoint behavior tests (usually e2e/integration).
- `src/__tests__`: cross-feature e2e suites.

## Debugging Tests

Use the VS Code launch config:

- `API: Debug Current Test (Bun)` for the currently opened test file.
- `API: Debug Server (Bun)` to debug the app startup path.

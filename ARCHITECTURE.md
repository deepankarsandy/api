# Architecture - Clean Architecture (with CQRS-style handlers)

- Style: Hexagonal Architecture (Ports & Adapters) with CQRS-style command/query handlers
- Scope: not full CQRS/event sourcing; focused on separation of concerns and testability
- Runtime: Bun + Elysia + TypeScript + tsyringe (DI)
- Import strategy: `@/...` aliases mapped to `src/*` (plus layer aliases like `@application/*`, `@domain/*`, etc.)
- Naming strategy: kebab-case + file type suffix (for example `create-user.command.ts`, `user.controller.ts`)

```
src
 ├ domain
 │   ├ entities
 │   ├ value-objects
 │   └ interfaces (repositories interfaces)
 │
 ├ application
 │   ├ commands
 │   │   └ <entity> (e.g. `user/`)
 │   ├ queries
 │   │   └ <entity> (e.g. `user/`)
 │   ├ handlers
 │   │   └ <entity> (e.g. `user/`)
 │   └ services
 │
 ├ infrastructure
 │   ├ database
 │   ├ auth
 │   ├ repositories
 │   └ external
 │
 ├ presentation
 │   ├ http
 │   │   ├ controllers
 │   │   └ routes
 │   └ middleware
 │
 └ shared
     ├ errors
     └ utils
```

- Current implementation notes

- API base path is versioned: `/api/v1/*`
- OpenAPI/Swagger is exposed through `@elysiajs/swagger`
- Core middleware/plugins are enabled: JSON parsing (default in Elysia), CORS, and centralized `.onError(...)`
- Health check endpoint: `GET /api/v1/health`
- User persistence is currently in-memory only via `UserRepository` (array-backed). Database adapter will replace this later without changing application/domain contracts.
- Dependency injection is centralized in `src/shared/container.ts`; handlers/controllers consume dependencies via constructor injection.
- Tests live only under `__tests__` folders and use typed suffixes: `.test.unit.ts`, `.test.integration.ts`, `.test.e2e.ts`.
- Naming and directory conventions are documented in `CONVENTIONS.md`.

- Request flow (current)

```
POST /users
      ↓
UserController
      ↓
CreateUserCommand
      ↓
CreateUserHandler
      ↓
IUserRepository (domain port)
      ↓
UserRepository (in-memory adapter in infrastructure)
```

- Planned replacement flow (future)

```
IUserRepository
      ↓
PrismaUserRepository (or other DB adapter)
      ↓
Database
```

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
- User persistence is database-backed via Drizzle ORM + SQLite using `UserRepository` as infrastructure adapter.
- `GET /api/v1/users/:email` returns user with `profiles[]` from `user_profiles` relation.
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
UserRepository (Drizzle + SQLite adapter in infrastructure)
```

- Database structure (Drizzle + SQLite)

```
src/infrastructure/database
 ├ client.ts                  # env selector for db initialization
 ├ common.ts                  # shared pragmas, schema creation, and helpers
 ├ development.ts             # dev restore-to-memory + shutdown backup
 ├ production.ts              # production db initialization
 ├ test.ts                    # test in-memory db initialization
 ├ schema
 │   ├ index.ts               # schema export barrel
 │   └ user.schema.ts         # users + user_profiles schemas and relations
 └ migrations                 # drizzle-kit generated SQL migrations
```

- Current DB defaults

- Dialect: SQLite
- ORM: Drizzle (`drizzle-orm`)
- Development DB file: `./data/dev.db`
- Test DB: `:memory:`
- Production DB file: `./data/prod.db`
- Runtime selection is controlled by `NODE_ENV`
- Full environment-specific behavior is documented in `DATABASE.md`

- Database guides

- Generate migration files:
  - `bun run db:generate`
- Apply generated migrations:
  - `bun run db:migrate`
- Open Drizzle Studio:
  - `bun run db:studio`
- Keep all table definitions in `src/infrastructure/database/schema` to avoid schema logic inside repositories.
- Repositories should only consume `db` + table schemas and still implement domain interfaces (`IUserRepository`), so application/domain layers remain unchanged.
- Role constants live in `src/domain/constants/user-role.constant.ts` with allowed values: `admin`, `user`, `moderator`, `super_admin`.
- Current create-user flow persists only `email` plus backend defaults (`role=admin`, flags/timestamps/password defaults). Profile rows are intentionally created in a separate flow.
- Profile rows store `firstName` (required), `middleName` (optional), and `lastName` (optional). API responses include computed `profile.name` as concatenated full name.

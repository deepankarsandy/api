# Architecture - Clean Architecture (with CQRS-style handlers)

- Not full CQRS but Hexagonal Architecture/Ports & Adapters
- Recommended structure

```
src
 ├ domain
 │   ├ entities
 │   ├ value-objects
 │   └ interfaces (repositories interfaces)
 │
 ├ application
 │   ├ commands
 │   ├ queries
 │   ├ handlers
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

- Example request flow

```
POST /users
      ↓
UserController
      ↓
CreateUserCommand
      ↓
CreateUserHandler
      ↓
UserRepository (interface)
      ↓
PrismaUserRepository (infra)
      ↓
Database
```

- Use DI, create one container and use decorator to initialize it and consume thru constructor
- add structure to easily created versioned apis later if needed, current setup is to prefix all with /api/v1/
- setup to create openapi docs and swagger for apis from types using elysia plugin.
- add basic json parsing, cors handler, error handling plugins/middlewares that is needed for basic api
- create 1 basic health endpoint for test

# Naming And Directory Conventions

## File Naming

- Use kebab-case file names with a type suffix.
- Pattern: `<feature-name>.<type>.ts`
- Examples:
  - `user.controller.ts`
  - `user.routes.ts`
  - `create-user.command.ts`
  - `get-user-by-email.query.ts`
  - `create-user.handler.ts`
  - `user.repository.ts`
  - `user-repository.interface.ts`

## Directory Structure Rules

- `commands`, `queries`, and `handlers` must use an entity subdirectory.
- Each entity subdirectory contains only that entity's files.
- `repositories`, `interfaces`, and other one-file-per-entity layers do not need per-entity subdirectories.

## Required Layout

```txt
src/
  application/
    commands/
      user/
        create-user.command.ts
    queries/
      user/
        get-user-by-email.query.ts
    handlers/
      user/
        create-user.handler.ts
        get-user-by-email.handler.ts

  presentation/
    http/
      controllers/
        user.controller.ts
      routes/
        user.routes.ts

  domain/
    interfaces/
      user-repository.interface.ts

  infrastructure/
    repositories/
      user.repository.ts
```

## Import Guidance

- Prefer path aliases from `tsconfig.json`.
- Examples:
  - `@commands/user/create-user.command`
  - `@queries/user/get-user-by-email.query`
  - `@handlers/user/create-user.handler`
  - `@controllers/user.controller`
  - `@repositories/user.repository`
  - `@interfaces/user-repository.interface`

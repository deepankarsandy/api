// src/users/user.schemas.ts
import { t } from "elysia";

export const CreateUserBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  email: t.String({ format: "email" }),
  age: t.Optional(t.Number({ minimum: 13 })),
});

export const GetUserParams = t.Object({
  email: t.String({ format: "email" }),
});

// Derive TypeScript types from schemas — no duplication
export type CreateUserBody = typeof CreateUserBody.static;
export type GetUserParams = typeof GetUserParams.static;

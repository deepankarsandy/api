import { t } from "elysia";

export const SignUpWithEmailBody = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  name: t.Optional(t.String({ minLength: 1 })),
  image: t.Optional(t.String()),
});

export const SignUpWithEmailSuccessResponse = t.Object({
  data: t.Any(),
});

export type SignUpWithEmailBody = typeof SignUpWithEmailBody.static;

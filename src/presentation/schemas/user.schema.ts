import { USER_ROLE_VALUES } from "@domain/constants/user-role.constant";
import { t } from "elysia";

export const CreateUserBody = t.Object({
  email: t.String({ format: "email" }),
});

export const GetUserParams = t.Object({
  email: t.String({ format: "email" }),
});

export const UserProfileResponse = t.Object({
  id: t.Number(),
  userId: t.Number(),
  isDefault: t.Boolean(),
  firstName: t.String(),
  middleName: t.Nullable(t.String()),
  lastName: t.Nullable(t.String()),
  name: t.String(),
  bio: t.Nullable(t.String()),
  avatarUrl: t.Nullable(t.String()),
  slug: t.Nullable(t.String()),
  themePreference: t.Nullable(t.String()),
  timezone: t.Nullable(t.String()),
  language: t.Nullable(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const UserResponse = t.Object({
  id: t.Number(),
  email: t.String({ format: "email" }),
  emailVerified: t.Boolean(),
  role: t.Union([
    t.Literal(USER_ROLE_VALUES[0]),
    t.Literal(USER_ROLE_VALUES[1]),
    t.Literal(USER_ROLE_VALUES[2]),
    t.Literal(USER_ROLE_VALUES[3]),
  ]),
  password: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  lastLoginAt: t.Nullable(t.Date()),
  lastPasswordChangedAt: t.Nullable(t.Date()),
  banned: t.Boolean(),
  profiles: t.Array(UserProfileResponse),
});

export const CreateUserSuccessResponse = t.Object({
  data: t.Null(),
});

export const GetUserSuccessResponse = t.Object({
  data: UserResponse,
});

export type CreateUserBody = typeof CreateUserBody.static;
export type GetUserParams = typeof GetUserParams.static;

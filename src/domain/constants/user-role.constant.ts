export const USER_ROLE_VALUES = ["admin", "user", "moderator", "super_admin"] as const;

export type UserRole = (typeof USER_ROLE_VALUES)[number];

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
  SUPER_ADMIN: "super_admin",
} as const satisfies Record<string, UserRole>;

import { USER_ROLE_VALUES } from "@domain/constants/user-role.constant";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  role: text("role", { enum: USER_ROLE_VALUES }).notNull(),
  password: text("password").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  lastLoginAt: integer("lastLoginAt", { mode: "timestamp_ms" }),
  banned: integer("banned", { mode: "boolean" }).notNull().default(false),
});

export const userProfiles = sqliteTable("user_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isDefault: integer("isDefault", { mode: "boolean" }).notNull().default(false),
  firstName: text("firstName").notNull(),
  middleName: text("middleName"),
  lastName: text("lastName"),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  slug: text("slug"),
  themePreference: text("themePreference"),
  timezone: text("timezone"),
  language: text("language"),
});

export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(userProfiles),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

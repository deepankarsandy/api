import type { User } from "@entities/user";
import { db } from "@infrastructure/database/client";
import { userProfiles, users } from "@infrastructure/database/schema";
import type { CreateUserInput, IUserRepository } from "@interfaces/user-repository.interface";
import { eq } from "drizzle-orm";
import { injectable } from "tsyringe";

const buildProfileName = (parts: Array<string | null>): string =>
  parts
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim())
    .join(" ");

@injectable()
export class UserRepository implements IUserRepository {
  async create(user: CreateUserInput): Promise<void> {
    const now = new Date();

    await db.insert(users).values({
      email: user.email,
      emailVerified: false,
      role: user.role,
      password: "",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      lastPasswordChangedAt: null,
      banned: false,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const [storedUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!storedUser) {
      return null;
    }

    const storedProfiles = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, storedUser.id));

    const profiles = storedProfiles.map((profile) => ({
      ...profile,
      name: buildProfileName([profile.firstName, profile.middleName, profile.lastName]),
    }));

    return {
      ...storedUser,
      profiles,
    };
  }
}

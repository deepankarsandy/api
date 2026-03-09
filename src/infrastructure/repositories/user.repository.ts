import type { User } from "@entities/user";
import { db } from "@infrastructure/database/client";
import { users } from "@infrastructure/database/schema";
import type { IUserRepository } from "@interfaces/user-repository.interface";
import { eq } from "drizzle-orm";
import { injectable } from "tsyringe";

@injectable()
export class UserRepository implements IUserRepository {
  async create(user: User): Promise<void> {
    await db.insert(users).values(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user || null;
  }
}

import type { UserRole } from "@domain/constants/user-role.constant";
import type { User } from "@entities/user";

export interface CreateUserInput {
  email: string;
  role: UserRole;
}

export interface IUserRepository {
  create(user: CreateUserInput): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

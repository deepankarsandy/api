import type { User } from "@entities/user";
import type { IUserRepository } from "@interfaces/user-repository.interface";
import { injectable } from "tsyringe";

@injectable()
export class UserRepository implements IUserRepository {
  private readonly users: User[] = [];

  async create(user: User): Promise<void> {
    this.users.push(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) || null;
  }
}

import { CreateUserCommand } from "@commands/user/create-user.command";
import type { User } from "@entities/user";
import type { CreateUserHandler } from "@handlers/user/create-user.handler";
import type { GetUserByEmailHandler } from "@handlers/user/get-user-by-email.handler";
import { GetUserByEmailQuery } from "@queries/user/get-user-by-email.query";
import { injectable } from "tsyringe";

@injectable()
export class UserController {
  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly getUserByEmailHandler: GetUserByEmailHandler,
  ) {}

  async createUser(body: { name: string; email: string }): Promise<void> {
    const { name, email } = body;
    const command = new CreateUserCommand(name, email);
    await this.createUserHandler.handle(command);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = new GetUserByEmailQuery(email);
    return this.getUserByEmailHandler.handle(query);
  }
}

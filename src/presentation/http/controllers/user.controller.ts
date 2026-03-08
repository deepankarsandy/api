import { CreateUserCommand } from "@commands/user/create-user.command";
import type { User } from "@entities/user";
import type { CreateUserHandler } from "@handlers/user/create-user.handler";
import type { GetUserByEmailHandler } from "@handlers/user/get-user-by-email.handler";
import { GetUserByEmailQuery } from "@queries/user/get-user-by-email.query";
import { AppError } from "@shared/types/error.types";
import { injectable } from "tsyringe";
import { ERROR_CODES } from "@/shared/errors/error-codes.constant";
import { ERROR_MESSAGES } from "@/shared/errors/error-messages.constant";

@injectable()
export class UserController {
  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly getUserByEmailHandler: GetUserByEmailHandler,
  ) {}

  async createUser(body: { name: string; email: string }): Promise<void> {
    try {
      const { name, email } = body;
      const command = new CreateUserCommand(name, email);
      await this.createUserHandler.handle(command);
    } catch (error) {
      throw new AppError("User creation failed", {
        message: ERROR_MESSAGES.USER_CREATE_FAILED,
        code: ERROR_CODES.USER_CREATE_FAILED,
        status: 500,
        cause: error,
      });
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = new GetUserByEmailQuery(email);
    return this.getUserByEmailHandler.handle(query);
  }
}

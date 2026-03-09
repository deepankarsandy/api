import type { User } from "@entities/user";
import type { GetUserByEmailHandler } from "@handlers/user/get-user-by-email.handler";
import { GetUserByEmailQuery } from "@queries/user/get-user-by-email.query";
import { AppError } from "@shared/types/error.types";
import { injectable } from "tsyringe";
import { ERROR_CODES } from "@/shared/errors/error-codes.constant";
import { ERROR_MESSAGES } from "@/shared/errors/error-messages.constant";

@injectable()
export class UserController {
  constructor(private readonly getUserByEmailHandler: GetUserByEmailHandler) {}

  async getUserByEmail(email: string): Promise<User> {
    const query = new GetUserByEmailQuery(email);
    const user = await this.getUserByEmailHandler.handle(query);

    if (!user) {
      throw new AppError("User not found", {
        message: ERROR_MESSAGES.USER_NOT_FOUND,
        code: ERROR_CODES.USER_NOT_FOUND,
        status: 404,
      });
    }

    return user;
  }
}

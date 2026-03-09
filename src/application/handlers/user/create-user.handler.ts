import type { CreateUserCommand } from "@commands/user/create-user.command";
import { USER_ROLES } from "@domain/constants/user-role.constant";
import type { CreateUserInput, IUserRepository } from "@interfaces/user-repository.interface";
import { injectable } from "tsyringe";

@injectable()
export class CreateUserHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(command: CreateUserCommand): Promise<void> {
    const user: CreateUserInput = {
      email: command.email,
      role: USER_ROLES.ADMIN,
    };

    await this.userRepository.create(user);
  }
}

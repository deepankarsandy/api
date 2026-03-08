import type { CreateUserCommand } from "@commands/user/create-user.command";
import type { User } from "@entities/user";
import type { IUserRepository } from "@interfaces/user-repository.interface";
import { injectable } from "tsyringe";

@injectable()
export class CreateUserHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(command: CreateUserCommand): Promise<void> {
    const user: User = {
      id: crypto.randomUUID(),
      ...command,
    };
    await this.userRepository.create(user);
  }
}

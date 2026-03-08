import type { User } from "@entities/user";
import type { IUserRepository } from "@interfaces/user-repository.interface";
import type { GetUserByEmailQuery } from "@queries/user/get-user-by-email.query";
import { injectable } from "tsyringe";

@injectable()
export class GetUserByEmailHandler {
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(query: GetUserByEmailQuery): Promise<User | null> {
    return this.userRepository.findByEmail(query.email);
  }
}

import { AuthController } from "@controllers/auth.controller";
import { UserController } from "@controllers/user.controller";
import { GetUserByEmailHandler } from "@handlers/user/get-user-by-email.handler";
import { UserRepository } from "@repositories/user.repository";
import { container } from "tsyringe";

// Register your dependencies here
container.registerSingleton("UserRepository", UserRepository);

container.register(GetUserByEmailHandler, {
  useFactory: (dependencyContainer) =>
    new GetUserByEmailHandler(dependencyContainer.resolve("UserRepository")),
});

container.register(AuthController, {
  useFactory: () => new AuthController(),
});

container.register(UserController, {
  useFactory: (dependencyContainer) =>
    new UserController(dependencyContainer.resolve(GetUserByEmailHandler)),
});

export default container;
